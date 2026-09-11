-- ============================================
-- Masjid timezone: required
-- ============================================
-- Push this only AFTER the web app that sends `timezone` is deployed. The
-- bundle it replaces creates profiles without one, so landing this first breaks
-- registration for a new masjid. That is the opposite ordering to the two
-- migrations before it.
--
-- No DEFAULT on purpose: a placeholder zone would render every datetime the
-- masjid publishes against the wrong clock, which is the bug this set of
-- migrations exists to remove.

DO $$
DECLARE
  v_missing BIGINT;
BEGIN
  SELECT count(*) INTO v_missing FROM masjid_profiles WHERE timezone IS NULL;

  IF v_missing > 0 THEN
    RAISE EXCEPTION '% masjid profile(s) still have no timezone', v_missing
      USING HINT = 'Run supabase/scripts/backfill-masjid-timezones.mjs first. A '
                   'profile with no coordinates has nothing to derive one from '
                   'and needs an admin to set its location.';
  END IF;
END $$;

ALTER TABLE masjid_profiles ALTER COLUMN timezone SET NOT NULL;
