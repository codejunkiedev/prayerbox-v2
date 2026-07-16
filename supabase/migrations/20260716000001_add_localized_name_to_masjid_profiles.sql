-- ============================================
-- Localized masjid names on masjid profiles
-- ============================================
-- Lets a masjid provide Urdu and Arabic translations of its name. Both columns
-- are optional; consumers fall back to the English `name` when a translation is
-- blank, mirroring the localized `area` columns.

ALTER TABLE masjid_profiles
  ADD COLUMN name_ur TEXT NOT NULL DEFAULT '',
  ADD COLUMN name_ar TEXT NOT NULL DEFAULT '';
