-- ============================================
-- Move calculation_method and juristic_school
-- from prayer_times to settings table
-- ============================================

-- 1. Add new columns to settings
ALTER TABLE settings
  ADD COLUMN calculation_method INTEGER,
  ADD COLUMN juristic_school INTEGER;

-- 2. Migrate existing data from prayer_times to settings
UPDATE settings s
SET
  calculation_method = pt.calculation_method,
  juristic_school = pt.juristic_school,
  updated_at = now()
FROM prayer_times pt
WHERE s.user_id = pt.user_id;

-- 3. Drop the columns from prayer_times
ALTER TABLE prayer_times
  DROP COLUMN calculation_method,
  DROP COLUMN juristic_school;
