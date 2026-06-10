-- ============================================
-- Per-screen slide interval
-- ============================================
-- Let each display screen control how long every slide stays on screen before
-- rotating to the next one. Stored in seconds and bounded to a sane viewing
-- range. Existing screens default to 5 seconds. YouTube video slides ignore
-- this value and continue to advance when the video finishes.

ALTER TABLE display_screens
  ADD COLUMN slide_interval_seconds INTEGER NOT NULL DEFAULT 5
  CHECK (slide_interval_seconds BETWEEN 3 AND 60);
