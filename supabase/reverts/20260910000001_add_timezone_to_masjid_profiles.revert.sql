-- ============================================
-- REVERT of 20260910000001_add_timezone_to_masjid_profiles.sql
-- ============================================
-- LOSES DATA. Dump the column first if you may want it back:
--
--   COPY (SELECT id, timezone FROM masjid_profiles WHERE timezone IS NOT NULL)
--     TO STDOUT WITH CSV HEADER;
--
-- To run: paste into the project's SQL editor, or copy into
-- supabase/migrations/ under a fresh timestamp and push.

DROP TRIGGER IF EXISTS trg_validate_masjid_timezone ON masjid_profiles;
DROP FUNCTION IF EXISTS validate_masjid_timezone();
DROP FUNCTION IF EXISTS is_valid_timezone(TEXT);

ALTER TABLE masjid_profiles DROP COLUMN IF EXISTS timezone;
