-- ============================================
-- Contact details on masjid profiles
-- ============================================
-- Lets a masjid publish a contact number, contact email and website. All three
-- are optional and default to blank for existing profiles.

ALTER TABLE masjid_profiles
  ADD COLUMN contact_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN contact_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN website TEXT NOT NULL DEFAULT '';
