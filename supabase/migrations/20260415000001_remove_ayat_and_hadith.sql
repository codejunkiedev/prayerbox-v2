-- Remove ayat_and_hadith module

-- Remove content rows referencing ayat_and_hadith before updating the CHECK constraint
DELETE FROM screen_content WHERE content_type = 'ayat_and_hadith';

-- Update screen_content CHECK constraint to remove 'ayat_and_hadith'
ALTER TABLE screen_content DROP CONSTRAINT IF EXISTS screen_content_content_type_check;
ALTER TABLE screen_content
  ADD CONSTRAINT screen_content_content_type_check
  CHECK (content_type IN ('announcements', 'events', 'posts', 'youtube_videos'));

-- Drop trigger on ayat_and_hadith
DROP TRIGGER IF EXISTS trg_update_last_active_ayat ON ayat_and_hadith;

-- Drop policies on ayat_and_hadith
DROP POLICY IF EXISTS "Members can view masjid ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Members can insert masjid ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Members can update masjid ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Members can delete masjid ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Anon can view ayat and hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can view own ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can insert own ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can update own ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can delete own ayat_and_hadith" ON ayat_and_hadith;

-- Drop indexes
DROP INDEX IF EXISTS idx_ayat_and_hadith_user_id;
DROP INDEX IF EXISTS idx_ayat_and_hadith_lookup;
DROP INDEX IF EXISTS idx_ayat_and_hadith_masjid_id;

-- Drop the table
DROP TABLE IF EXISTS ayat_and_hadith;
