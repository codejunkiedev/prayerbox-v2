-- ============================================
-- Per-screen theme selection
-- ============================================
-- Move the theme from settings (one per masjid) onto each display_screen so
-- different screens at the same masjid can render different themes. Existing
-- screens keep the masjid's current theme via backfill.

ALTER TABLE display_screens
  ADD COLUMN theme TEXT NOT NULL DEFAULT 'theme-1'
  CHECK (theme IN ('theme-1', 'theme-2', 'theme-3'));

UPDATE display_screens ds
SET theme = s.theme
FROM settings s
WHERE s.masjid_id = ds.masjid_id;

ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_theme_check;
ALTER TABLE settings DROP COLUMN IF EXISTS theme;
