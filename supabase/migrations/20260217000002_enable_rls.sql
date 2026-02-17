-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE masjid_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayat_and_hadith ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- masjid_profiles policies
-- ============================================

-- Owners can do everything with their own profile
CREATE POLICY "Users can view own masjid profile"
  ON masjid_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own masjid profile"
  ON masjid_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own masjid profile"
  ON masjid_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own masjid profile"
  ON masjid_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ============================================
-- ayat_and_hadith policies
-- ============================================
CREATE POLICY "Users can view own ayat_and_hadith"
  ON ayat_and_hadith FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own ayat_and_hadith"
  ON ayat_and_hadith FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ayat_and_hadith"
  ON ayat_and_hadith FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own ayat_and_hadith"
  ON ayat_and_hadith FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- announcements policies
-- ============================================
CREATE POLICY "Users can view own announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- events policies
-- ============================================
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- posts policies
-- ============================================
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- prayer_times policies
-- ============================================
CREATE POLICY "Users can view own prayer_times"
  ON prayer_times FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own prayer_times"
  ON prayer_times FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own prayer_times"
  ON prayer_times FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own prayer_times"
  ON prayer_times FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- settings policies
-- ============================================
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own settings"
  ON settings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
