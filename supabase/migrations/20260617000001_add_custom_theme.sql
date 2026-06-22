-- ============================================
-- Custom prayer-timings theme (theme-4)
-- ============================================
-- Adds a 4th "Custom" theme option and a per-screen JSON config that stores its
-- user customizations (background, overlay, fonts, sizes, colors). Themes 1-3
-- ignore the column. Existing screens keep custom_theme NULL until they opt in.

ALTER TABLE display_screens DROP CONSTRAINT IF EXISTS display_screens_theme_check;
ALTER TABLE display_screens
  ADD CONSTRAINT display_screens_theme_check
  CHECK (theme IN ('theme-1', 'theme-2', 'theme-3', 'theme-4'));

ALTER TABLE display_screens ADD COLUMN IF NOT EXISTS custom_theme JSONB;
