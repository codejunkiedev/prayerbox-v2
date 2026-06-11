-- ============================================
-- Raise slide interval minimum to 5 seconds
-- ============================================
-- Anything shorter than 5 seconds rotates too fast to read on a display
-- screen. Bump existing rows below the new floor, then tighten the check
-- constraint from 3–60 to 5–60.

UPDATE display_screens
  SET slide_interval_seconds = 5
  WHERE slide_interval_seconds < 5;

ALTER TABLE display_screens
  DROP CONSTRAINT display_screens_slide_interval_seconds_check;

ALTER TABLE display_screens
  ADD CONSTRAINT display_screens_slide_interval_seconds_check
  CHECK (slide_interval_seconds BETWEEN 5 AND 60);
