-- ============================================
-- Move sunrise adjustment out of prayer_times.prayer_adjustments
-- into dedicated columns on settings, and add a sunset adjustment.
-- Sunrise/sunset only have a single displayed time, so they don't
-- need the starts/athan/iqamah split.
-- ============================================

ALTER TABLE settings
  ADD COLUMN sunrise_adjustment JSONB NOT NULL DEFAULT '{"type": "default"}'::jsonb,
  ADD COLUMN sunset_adjustment  JSONB NOT NULL DEFAULT '{"type": "default"}'::jsonb;

-- Copy any existing sunrise.starts adjustment from prayer_times into settings.
UPDATE settings s
SET sunrise_adjustment = COALESCE(pt.prayer_adjustments -> 'sunrise' -> 'starts', s.sunrise_adjustment)
FROM prayer_times pt
WHERE pt.masjid_id = s.masjid_id
  AND pt.prayer_adjustments ? 'sunrise';

-- Drop the now-orphan sunrise entry from prayer_times.prayer_adjustments.
UPDATE prayer_times
SET prayer_adjustments = prayer_adjustments - 'sunrise'
WHERE prayer_adjustments ? 'sunrise';
