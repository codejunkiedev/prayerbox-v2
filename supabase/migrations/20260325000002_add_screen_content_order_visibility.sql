-- ============================================
-- Add ordering and visibility to screen_content
-- ============================================
ALTER TABLE screen_content ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE screen_content ADD COLUMN visible BOOLEAN NOT NULL DEFAULT true;
