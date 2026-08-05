-- ============================================
-- Ishraq and Chasht adjustments.
--
-- The AlAdhan API returns neither time, so both are derived from the times it
-- does return:
--   Ishraq = sunrise + 15 minutes — once the sun has risen a spear's length
--            above the horizon, the forbidden time at sunrise has passed.
--   Chasht = midway between sunrise and Zawal (Dhuhr) — a quarter of the day
--            gone, which the Hanafi scholars hold as the preferred time for
--            Salat al-Duha.
-- Both are conventions rather than observations, so every masjid can offset or
-- override them from the Prayer Time Adjustments modal.
--
-- Like sunrise/sunset these show a single time, so they don't need the
-- starts/athan/iqamah split and live on settings rather than prayer_times.
-- ============================================

ALTER TABLE settings
  ADD COLUMN ishraq_adjustment JSONB NOT NULL DEFAULT '{"type": "default"}'::jsonb,
  ADD COLUMN chasht_adjustment JSONB NOT NULL DEFAULT '{"type": "default"}'::jsonb;
