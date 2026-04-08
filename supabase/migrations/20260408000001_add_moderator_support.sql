-- ============================================
-- Moderator support: masjid_members table,
-- masjid_id columns, backfill, helper functions,
-- and activity tracking triggers.
-- ============================================

-- ============================================
-- 1. Create masjid_members table
-- ============================================
CREATE TABLE masjid_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masjid_id UUID NOT NULL REFERENCES masjid_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(masjid_id, user_id)
);

CREATE INDEX idx_masjid_members_user_id ON masjid_members(user_id);
CREATE INDEX idx_masjid_members_masjid_id ON masjid_members(masjid_id);

-- ============================================
-- 2. Add masjid_id to content tables
-- ============================================
ALTER TABLE ayat_and_hadith ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;
ALTER TABLE announcements ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;
ALTER TABLE youtube_videos ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;

-- ============================================
-- 3. Add masjid_id to admin-only tables
-- ============================================
ALTER TABLE display_screens ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;
ALTER TABLE prayer_times ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN masjid_id UUID REFERENCES masjid_profiles(id) ON DELETE CASCADE;

-- ============================================
-- 4. Backfill masjid_id from user_id
-- ============================================
UPDATE ayat_and_hadith SET masjid_id = mp.id FROM masjid_profiles mp WHERE ayat_and_hadith.user_id = mp.user_id;
UPDATE announcements SET masjid_id = mp.id FROM masjid_profiles mp WHERE announcements.user_id = mp.user_id;
UPDATE events SET masjid_id = mp.id FROM masjid_profiles mp WHERE events.user_id = mp.user_id;
UPDATE posts SET masjid_id = mp.id FROM masjid_profiles mp WHERE posts.user_id = mp.user_id;
UPDATE youtube_videos SET masjid_id = mp.id FROM masjid_profiles mp WHERE youtube_videos.user_id = mp.user_id;
UPDATE display_screens SET masjid_id = mp.id FROM masjid_profiles mp WHERE display_screens.user_id = mp.user_id;
UPDATE prayer_times SET masjid_id = mp.id FROM masjid_profiles mp WHERE prayer_times.user_id = mp.user_id;
UPDATE settings SET masjid_id = mp.id FROM masjid_profiles mp WHERE settings.user_id = mp.user_id;

-- Delete orphaned rows that have no matching masjid profile
DELETE FROM ayat_and_hadith WHERE masjid_id IS NULL;
DELETE FROM announcements WHERE masjid_id IS NULL;
DELETE FROM events WHERE masjid_id IS NULL;
DELETE FROM posts WHERE masjid_id IS NULL;
DELETE FROM youtube_videos WHERE masjid_id IS NULL;
DELETE FROM display_screens WHERE masjid_id IS NULL;
DELETE FROM prayer_times WHERE masjid_id IS NULL;
DELETE FROM settings WHERE masjid_id IS NULL;

-- ============================================
-- 5. Set masjid_id NOT NULL
-- ============================================
ALTER TABLE ayat_and_hadith ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE announcements ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE events ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE posts ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE youtube_videos ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE display_screens ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE prayer_times ALTER COLUMN masjid_id SET NOT NULL;
ALTER TABLE settings ALTER COLUMN masjid_id SET NOT NULL;

-- ============================================
-- 6. Add indexes on masjid_id
-- ============================================
CREATE INDEX idx_ayat_and_hadith_masjid_id ON ayat_and_hadith(masjid_id);
CREATE INDEX idx_announcements_masjid_id ON announcements(masjid_id);
CREATE INDEX idx_events_masjid_id ON events(masjid_id);
CREATE INDEX idx_posts_masjid_id ON posts(masjid_id);
CREATE INDEX idx_youtube_videos_masjid_id ON youtube_videos(masjid_id);
CREATE INDEX idx_display_screens_masjid_id ON display_screens(masjid_id);

-- ============================================
-- 7. Seed existing users as admins
-- ============================================
INSERT INTO masjid_members (masjid_id, user_id, role)
SELECT id, user_id, 'admin'
FROM masjid_profiles;

-- ============================================
-- 8. RLS helper functions
-- ============================================
CREATE OR REPLACE FUNCTION get_user_masjid_id()
RETURNS UUID AS $$
  SELECT masjid_id FROM masjid_members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM masjid_members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 9. Activity tracking trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE masjid_members
  SET last_active_at = now(), updated_at = now()
  WHERE user_id = auth.uid();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_last_active_ayat
  AFTER INSERT OR UPDATE OR DELETE ON ayat_and_hadith
  FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

CREATE TRIGGER trg_update_last_active_announcements
  AFTER INSERT OR UPDATE OR DELETE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

CREATE TRIGGER trg_update_last_active_events
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

CREATE TRIGGER trg_update_last_active_posts
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

CREATE TRIGGER trg_update_last_active_youtube
  AFTER INSERT OR UPDATE OR DELETE ON youtube_videos
  FOR EACH ROW EXECUTE FUNCTION update_member_last_active();
