-- ============================================
-- Per-screen prayer time alerts
-- ============================================
-- Let each display sound a short beep the moment a prayer's athan or iqamah
-- time arrives, so a hall hears the change without anyone watching the
-- countdown. Off by default: existing screens stay silent until a masjid opts
-- in. `prayer_alert_triggers` is a set rather than a pair of booleans so more
-- trigger points (e.g. a few minutes before iqamah) can be added later without
-- another column.

-- Loudness is deliberately not stored: the beep plays at a fixed level and the
-- screen's own volume decides how loud the hall hears it.

ALTER TABLE display_screens
  ADD COLUMN prayer_alert_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN prayer_alert_triggers TEXT[] NOT NULL DEFAULT ARRAY['iqamah']::TEXT[],
  ADD COLUMN prayer_alert_sound TEXT NOT NULL DEFAULT 'beep';

ALTER TABLE display_screens
  ADD CONSTRAINT display_screens_prayer_alert_triggers_valid
    CHECK (prayer_alert_triggers <@ ARRAY['athan', 'iqamah']::TEXT[]),
  ADD CONSTRAINT display_screens_prayer_alert_sound_valid
    CHECK (prayer_alert_sound IN ('beep', 'silent'));
