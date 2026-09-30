-- ============================================
-- Detect prayer time changes from settings, not from cached times
-- ============================================
-- 20260930000002 compared freshly resolved times against the cached days the
-- trigger copied aside. Cached days can be weeks old, and Al-Adhan's answer for
-- the same day moves by a minute over that time, so a save that touched nothing
-- announced Asr as changed. Seen on production on 30 September.
--
-- The queue now keeps the masjid's settings as they were before the first save
-- in a burst, and notify-prayer-changes resolves the old and new settings
-- against one Al-Adhan fetch. Only the masjid's own changes can differ.

DROP TABLE masjid_prayer_baseline;

ALTER TABLE masjid_prayer_changes ADD COLUMN previous JSONB;

COMMENT ON COLUMN masjid_prayer_changes.previous IS
  '{ settings, prayer_times, profile: { latitude, longitude, timezone } } as they were before the first save since the masjid was last processed.';

CREATE OR REPLACE FUNCTION invalidate_masjid_prayer_days()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_masjid_id UUID;
  v_settings JSONB;
  v_prayer_times JSONB;
  v_profile JSONB;
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

  IF EXISTS (SELECT 1 FROM masjid_prayer_changes WHERE masjid_id = v_masjid_id) THEN
    UPDATE masjid_prayer_changes SET changed_at = now() WHERE masjid_id = v_masjid_id;
  ELSIF EXISTS (SELECT 1 FROM masjid_profiles WHERE id = v_masjid_id)
    AND EXISTS (SELECT 1 FROM push_subscriptions WHERE masjid_id = v_masjid_id)
  THEN
    -- The table being written contributes its OLD row; the others are unchanged.
    IF TG_TABLE_NAME = 'settings' THEN
      IF TG_OP <> 'INSERT' THEN
        v_settings := to_jsonb(OLD);
      END IF;
    ELSE
      SELECT to_jsonb(s) INTO v_settings
      FROM settings s WHERE s.masjid_id = v_masjid_id ORDER BY s.created_at LIMIT 1;
    END IF;

    IF TG_TABLE_NAME = 'prayer_times' THEN
      IF TG_OP <> 'INSERT' THEN
        v_prayer_times := to_jsonb(OLD);
      END IF;
    ELSE
      SELECT to_jsonb(p) INTO v_prayer_times
      FROM prayer_times p WHERE p.masjid_id = v_masjid_id ORDER BY p.created_at LIMIT 1;
    END IF;

    IF TG_TABLE_NAME = 'masjid_profiles' THEN
      v_profile := jsonb_build_object(
        'latitude', OLD.latitude, 'longitude', OLD.longitude, 'timezone', OLD.timezone
      );
    ELSE
      SELECT jsonb_build_object('latitude', m.latitude, 'longitude', m.longitude, 'timezone', m.timezone)
      INTO v_profile
      FROM masjid_profiles m WHERE m.id = v_masjid_id;
    END IF;

    INSERT INTO masjid_prayer_changes (masjid_id, previous)
    VALUES (
      v_masjid_id,
      jsonb_build_object('settings', v_settings, 'prayer_times', v_prayer_times, 'profile', v_profile)
    )
    ON CONFLICT (masjid_id) DO UPDATE SET changed_at = now();
  END IF;

  DELETE FROM masjid_prayer_days WHERE masjid_id = v_masjid_id;

  RETURN NULL;
END;
$$;

-- The return type changes, which CREATE OR REPLACE cannot do.
DROP FUNCTION claim_prayer_changes(INTEGER, INTEGER);

CREATE FUNCTION claim_prayer_changes(
  p_quiet_seconds INTEGER DEFAULT 600,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (masjid_id UUID, changed_at TIMESTAMPTZ, previous JSONB)
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
  RETURNING c.masjid_id, c.changed_at, c.previous;
$$;

REVOKE ALL ON FUNCTION claim_prayer_changes(INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_prayer_changes(INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_prayer_changes(INTEGER, INTEGER) TO service_role;
