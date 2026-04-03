-- Add theme-3 to the settings theme check constraint
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_theme_check;
ALTER TABLE settings ADD CONSTRAINT settings_theme_check CHECK (theme IN ('theme-1', 'theme-2', 'theme-3'));
