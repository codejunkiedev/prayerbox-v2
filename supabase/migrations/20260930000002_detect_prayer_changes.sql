-- ============================================
-- Prayer time changes: what followers were last told, and who is due a check
-- ============================================
-- `masjid_prayer_baseline` holds the resolved times a masjid's followers last
-- saw. `masjid_prayer_changes` queues masjids whose configuration changed; the
-- `notify-prayer-changes` Edge Function drains it once an edit has gone quiet,
-- compares against the baseline, pushes the difference and moves the baseline.
--
-- Neither table references masjid_profiles: the invalidation trigger also runs
-- while a masjid is being deleted, when a reference to it could not be written.

CREATE TABLE masjid_prayer_baseline (
  masjid_id UUID NOT NULL,
  day DATE NOT NULL,
  times JSONB NOT NULL,
  PRIMARY KEY (masjid_id, day)
);

CREATE TABLE masjid_prayer_changes (
  masjid_id UUID PRIMARY KEY,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_masjid_prayer_changes_changed_at ON masjid_prayer_changes(changed_at);

ALTER TABLE masjid_prayer_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE masjid_prayer_changes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON masjid_prayer_baseline FROM anon, authenticated;
REVOKE ALL ON masjid_prayer_changes FROM anon, authenticated;

-- ============================================
-- Invalidation, now remembering what it throws away
-- ============================================
-- The cached days are the times followers have been reading, so they seed the
-- baseline before they go. DO NOTHING keeps the oldest copy across a burst of
-- saves. A masjid nobody follows keeps no baseline: a stale one would announce
-- old changes to whoever follows it next.

CREATE OR REPLACE FUNCTION invalidate_masjid_prayer_days()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_masjid_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'masjid_profiles' THEN
    v_masjid_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_masjid_id := OLD.masjid_id;
  ELSE
    v_masjid_id := NEW.masjid_id;
  END IF;

  IF v_masjid_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM masjid_profiles WHERE id = v_masjid_id)
    AND EXISTS (SELECT 1 FROM push_subscriptions WHERE masjid_id = v_masjid_id)
  THEN
    INSERT INTO masjid_prayer_baseline (masjid_id, day, times)
    SELECT masjid_id, day, times
    FROM masjid_prayer_days
    WHERE masjid_id = v_masjid_id
      AND day >= current_date - 1
    ON CONFLICT (masjid_id, day) DO NOTHING;

    INSERT INTO masjid_prayer_changes (masjid_id)
    VALUES (v_masjid_id)
    ON CONFLICT (masjid_id) DO UPDATE SET changed_at = now();
  ELSE
    DELETE FROM masjid_prayer_baseline WHERE masjid_id = v_masjid_id;
  END IF;

  DELETE FROM masjid_prayer_days WHERE masjid_id = v_masjid_id;

  RETURN NULL;
END;
$$;

-- ============================================
-- Claiming work
-- ============================================
-- Takes masjids whose last change is at least p_quiet_seconds old. A save that
-- lands after the claim re-queues the masjid rather than being lost.

CREATE OR REPLACE FUNCTION claim_prayer_changes(
  p_quiet_seconds INTEGER DEFAULT 600,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (masjid_id UUID, changed_at TIMESTAMPTZ)
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  DELETE FROM masjid_prayer_changes c
  WHERE c.masjid_id IN (
    SELECT q.masjid_id
    FROM masjid_prayer_changes q
    WHERE q.changed_at <= now() - make_interval(secs => greatest(p_quiet_seconds, 0))
    ORDER BY q.changed_at
    LIMIT least(greatest(coalesce(p_limit, 20), 1), 100)
    FOR UPDATE SKIP LOCKED
  )
  RETURNING c.masjid_id, c.changed_at;
$$;

REVOKE ALL ON FUNCTION claim_prayer_changes(INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_prayer_changes(INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_prayer_changes(INTEGER, INTEGER) TO service_role;
