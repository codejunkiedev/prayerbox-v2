-- ============================================
-- Resolved prayer times, cached per masjid per day
-- ============================================
-- Until now nothing in Postgres held a prayer time: `settings` and
-- `prayer_times` hold adjustments, and each display resolves them against a
-- month fetched from Al-Adhan. That scales with screens per masjid. It does not
-- scale to phones — every follower would fetch their own Al-Adhan month and run
-- their own copy of the three-category adjustment maths.
--
-- So the `masjid-directory` Edge Function resolves a window of days once per
-- masjid and parks the result here, and the phones read what it wrote.
--
-- A cache, not a source of truth: every row is derivable from `settings`,
-- `prayer_times`, the masjid's coordinates and Al-Adhan, and losing the table
-- costs one recompute. `day` is the date in the *masjid's* timezone, which is
-- the only calendar its followers should see.

CREATE TABLE masjid_prayer_days (
  masjid_id UUID NOT NULL REFERENCES masjid_profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  times JSONB NOT NULL,
  hijri JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (masjid_id, day)
);

COMMENT ON TABLE masjid_prayer_days IS
  'Cache of resolved prayer times written by the masjid-directory Edge Function. Safe to truncate; it rebuilds on demand.';
COMMENT ON COLUMN masjid_prayer_days.day IS 'Date in the masjid timezone, not the reader''s.';
COMMENT ON COLUMN masjid_prayer_days.times IS
  'Output of resolveDayTimes() in supabase/functions/_shared/prayer-engine.ts: five prayers in all three categories, Friday Jumma variants, four solar times, all as 24-hour HH:mm.';

ALTER TABLE masjid_prayer_days ENABLE ROW LEVEL SECURITY;

-- No policies on purpose. RLS with no policy denies every client role, and
-- service_role bypasses RLS, so the Edge Function is the only reader and writer.
-- The grants go as well: a permissive policy added here by mistake later still
-- cannot open the table without a deliberate GRANT.
REVOKE ALL ON masjid_prayer_days FROM anon, authenticated;

-- ============================================
-- Invalidation
-- ============================================
-- A cached day is a pure function of the masjid's adjustments, coordinates and
-- timezone, so any write to those throws the masjid's window away and the next
-- request recomputes it.
--
-- Deleting rather than stamping a revision and comparing: the window is a few
-- dozen rows per masjid, and a stale row that still looks fresh is exactly the
-- failure this feature cannot afford — a follower turning up to a jamaat that
-- moved last week.

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

  IF v_masjid_id IS NOT NULL THEN
    DELETE FROM masjid_prayer_days WHERE masjid_id = v_masjid_id;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER settings_invalidate_prayer_days
  AFTER INSERT OR UPDATE OR DELETE ON settings
  FOR EACH ROW EXECUTE FUNCTION invalidate_masjid_prayer_days();

CREATE TRIGGER prayer_times_invalidate_prayer_days
  AFTER INSERT OR UPDATE OR DELETE ON prayer_times
  FOR EACH ROW EXECUTE FUNCTION invalidate_masjid_prayer_days();

-- The WHEN clause matters: `UPDATE OF` fires when a column appears in the SET
-- list, changed or not, and the profile form saves every column on every save.
CREATE TRIGGER masjid_profiles_invalidate_prayer_days
  AFTER UPDATE OF latitude, longitude, timezone ON masjid_profiles
  FOR EACH ROW
  WHEN (
    OLD.latitude IS DISTINCT FROM NEW.latitude
    OR OLD.longitude IS DISTINCT FROM NEW.longitude
    OR OLD.timezone IS DISTINCT FROM NEW.timezone
  )
  EXECUTE FUNCTION invalidate_masjid_prayer_days();
