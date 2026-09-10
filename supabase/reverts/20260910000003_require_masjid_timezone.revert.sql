-- ============================================
-- REVERT of 20260910000003_require_masjid_timezone.sql
-- ============================================
-- Loses no data. Run this before rolling the web app back to a bundle that
-- creates profiles without a timezone.
--
-- To run: paste into the project's SQL editor, or copy into
-- supabase/migrations/ under a fresh timestamp and push.

ALTER TABLE masjid_profiles ALTER COLUMN timezone DROP NOT NULL;
