-- ============================================
-- Masjid timezone: correct the column comment
-- ============================================
-- 20260910000001 described the column as nullable until backfilled, which
-- 20260910000003 made untrue. No revert file: nothing here is worth undoing.

COMMENT ON COLUMN masjid_profiles.timezone IS
  'IANA zone id for the masjid''s wall clock, e.g. Asia/Karachi.';
