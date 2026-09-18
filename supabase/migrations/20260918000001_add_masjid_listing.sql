-- ============================================
-- Masjid listing: the opt-in behind the mobile directory
-- ============================================
-- A masjid appears to phone users only when an admin ticks this. Nothing about
-- a masjid becomes public by default, which is why the column defaults to false
-- rather than backfilling the existing tenants.
--
-- Never true without coordinates: the directory is searched by distance, so a
-- listed masjid with no pin would sit in the table invisible to every query.
-- The CHECK turns that into a failed write the admin can see instead.

ALTER TABLE masjid_profiles ADD COLUMN listed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE masjid_profiles
  ADD CONSTRAINT masjid_profiles_listed_requires_coordinates
  CHECK (NOT listed OR (latitude IS NOT NULL AND longitude IS NOT NULL));

-- Partial by design: every directory query filters on `listed` first, and listed
-- masjids are a subset of the table.
CREATE INDEX idx_masjid_profiles_listed_coordinates
  ON masjid_profiles (latitude, longitude)
  WHERE listed;

COMMENT ON COLUMN masjid_profiles.listed IS
  'Admin opt-in to the public mobile directory. Read only through the directory functions added in 20260918000003.';
