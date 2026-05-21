-- ============================================
-- Localized area names on masjid profiles
-- ============================================
-- Lets a masjid provide Urdu and Arabic translations of its area name for the
-- localized weather slide. Both columns are optional; the display falls back
-- to the English `area` when a translation is blank.

ALTER TABLE masjid_profiles
  ADD COLUMN area_ur TEXT NOT NULL DEFAULT '',
  ADD COLUMN area_ar TEXT NOT NULL DEFAULT '';
