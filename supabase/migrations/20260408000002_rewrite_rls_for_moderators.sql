-- ============================================
-- Rewrite RLS policies for moderator support.
-- Moves from user_id = auth.uid() to
-- masjid_id = get_user_masjid_id() with role checks.
-- ============================================

-- ============================================
-- 1. masjid_members RLS
-- ============================================
ALTER TABLE masjid_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own masjid members"
  ON masjid_members FOR SELECT
  TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Admins can insert masjid members"
  ON masjid_members FOR INSERT
  TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete masjid members"
  ON masjid_members FOR DELETE
  TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

-- Members can update their own row (for last_active_at via trigger)
CREATE POLICY "Members can update own membership"
  ON masjid_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any member in their masjid
CREATE POLICY "Admins can update masjid members"
  ON masjid_members FOR UPDATE
  TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin')
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

-- ============================================
-- 2. Content tables: any member can CRUD
-- ============================================

-- ayat_and_hadith
DROP POLICY IF EXISTS "Users can view own ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can insert own ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can update own ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Users can delete own ayat_and_hadith" ON ayat_and_hadith;

CREATE POLICY "Members can view masjid ayat_and_hadith"
  ON ayat_and_hadith FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can insert masjid ayat_and_hadith"
  ON ayat_and_hadith FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can update masjid ayat_and_hadith"
  ON ayat_and_hadith FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id())
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can delete masjid ayat_and_hadith"
  ON ayat_and_hadith FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id());

-- announcements
DROP POLICY IF EXISTS "Users can view own announcements" ON announcements;
DROP POLICY IF EXISTS "Users can insert own announcements" ON announcements;
DROP POLICY IF EXISTS "Users can update own announcements" ON announcements;
DROP POLICY IF EXISTS "Users can delete own announcements" ON announcements;

CREATE POLICY "Members can view masjid announcements"
  ON announcements FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can insert masjid announcements"
  ON announcements FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can update masjid announcements"
  ON announcements FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id())
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can delete masjid announcements"
  ON announcements FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id());

-- events
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can insert own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

CREATE POLICY "Members can view masjid events"
  ON events FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can insert masjid events"
  ON events FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can update masjid events"
  ON events FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id())
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can delete masjid events"
  ON events FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id());

-- posts
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Members can view masjid posts"
  ON posts FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can insert masjid posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can update masjid posts"
  ON posts FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id())
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can delete masjid posts"
  ON posts FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id());

-- youtube_videos
DROP POLICY IF EXISTS "Users can view their own youtube videos" ON youtube_videos;
DROP POLICY IF EXISTS "Users can insert their own youtube videos" ON youtube_videos;
DROP POLICY IF EXISTS "Users can update their own youtube videos" ON youtube_videos;

CREATE POLICY "Members can view masjid youtube_videos"
  ON youtube_videos FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can insert masjid youtube_videos"
  ON youtube_videos FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can update masjid youtube_videos"
  ON youtube_videos FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id())
  WITH CHECK (masjid_id = get_user_masjid_id());

CREATE POLICY "Members can delete masjid youtube_videos"
  ON youtube_videos FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id());

-- ============================================
-- 3. Admin-only tables: SELECT for all members,
--    mutations for admins only
-- ============================================

-- masjid_profiles
DROP POLICY IF EXISTS "Users can view own masjid profile" ON masjid_profiles;
DROP POLICY IF EXISTS "Users can insert own masjid profile" ON masjid_profiles;
DROP POLICY IF EXISTS "Users can update own masjid profile" ON masjid_profiles;
DROP POLICY IF EXISTS "Users can delete own masjid profile" ON masjid_profiles;

CREATE POLICY "Members can view masjid profile"
  ON masjid_profiles FOR SELECT TO authenticated
  USING (id = get_user_masjid_id());

CREATE POLICY "Admins can insert masjid profile"
  ON masjid_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update masjid profile"
  ON masjid_profiles FOR UPDATE TO authenticated
  USING (id = get_user_masjid_id() AND get_user_role() = 'admin')
  WITH CHECK (id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete masjid profile"
  ON masjid_profiles FOR DELETE TO authenticated
  USING (id = get_user_masjid_id() AND get_user_role() = 'admin');

-- display_screens
DROP POLICY IF EXISTS "Users can view own display screens" ON display_screens;
DROP POLICY IF EXISTS "Users can insert own display screens" ON display_screens;
DROP POLICY IF EXISTS "Users can update own display screens" ON display_screens;
DROP POLICY IF EXISTS "Users can delete own display screens" ON display_screens;

CREATE POLICY "Members can view masjid display screens"
  ON display_screens FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Admins can insert masjid display screens"
  ON display_screens FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can update masjid display screens"
  ON display_screens FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin')
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete masjid display screens"
  ON display_screens FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

-- screen_content (admin-only mutations, member reads)
DROP POLICY IF EXISTS "Users can view own screen content" ON screen_content;
DROP POLICY IF EXISTS "Users can insert own screen content" ON screen_content;
DROP POLICY IF EXISTS "Users can update own screen content" ON screen_content;
DROP POLICY IF EXISTS "Users can delete own screen content" ON screen_content;

CREATE POLICY "Members can view masjid screen content"
  ON screen_content FOR SELECT TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE masjid_id = get_user_masjid_id()));

CREATE POLICY "Admins can insert masjid screen content"
  ON screen_content FOR INSERT TO authenticated
  WITH CHECK (screen_id IN (SELECT id FROM display_screens WHERE masjid_id = get_user_masjid_id()) AND get_user_role() = 'admin');

CREATE POLICY "Admins can update masjid screen content"
  ON screen_content FOR UPDATE TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE masjid_id = get_user_masjid_id()) AND get_user_role() = 'admin')
  WITH CHECK (screen_id IN (SELECT id FROM display_screens WHERE masjid_id = get_user_masjid_id()) AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete masjid screen content"
  ON screen_content FOR DELETE TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE masjid_id = get_user_masjid_id()) AND get_user_role() = 'admin');

-- prayer_times
DROP POLICY IF EXISTS "Users can view own prayer_times" ON prayer_times;
DROP POLICY IF EXISTS "Users can insert own prayer_times" ON prayer_times;
DROP POLICY IF EXISTS "Users can update own prayer_times" ON prayer_times;
DROP POLICY IF EXISTS "Users can delete own prayer_times" ON prayer_times;

CREATE POLICY "Members can view masjid prayer_times"
  ON prayer_times FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Admins can insert masjid prayer_times"
  ON prayer_times FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can update masjid prayer_times"
  ON prayer_times FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin')
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete masjid prayer_times"
  ON prayer_times FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

-- settings
DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON settings;

CREATE POLICY "Members can view masjid settings"
  ON settings FOR SELECT TO authenticated
  USING (masjid_id = get_user_masjid_id());

CREATE POLICY "Admins can insert masjid settings"
  ON settings FOR INSERT TO authenticated
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can update masjid settings"
  ON settings FOR UPDATE TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin')
  WITH CHECK (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete masjid settings"
  ON settings FOR DELETE TO authenticated
  USING (masjid_id = get_user_masjid_id() AND get_user_role() = 'admin');

-- ============================================
-- 4. Anon policies remain unchanged
-- ============================================
-- All existing anon SELECT policies are unaffected
-- as they don't reference user_id or masjid_id.
