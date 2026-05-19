-- ============================================
-- Per-screen language selection
-- ============================================
-- Allow each display screen to render prayer timings and the weather slide in
-- a chosen language. Existing screens default to English so behavior is
-- unchanged until a masjid explicitly opts in to another language.

ALTER TABLE display_screens
  ADD COLUMN language TEXT NOT NULL DEFAULT 'en'
  CHECK (language IN ('en', 'ur', 'ar'));
