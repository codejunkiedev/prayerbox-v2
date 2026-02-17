-- ============================================
-- Anon SELECT policies for display (login-with-code) flow
-- The display view is accessed without authentication,
-- so the anon role needs read access to all tables.
-- ============================================

-- masjid_profiles: anon users need to look up a masjid by code
CREATE POLICY "Anon can view masjid profiles"
  ON masjid_profiles FOR SELECT
  TO anon
  USING (true);

-- ayat_and_hadith: display shows visible, non-archived items
CREATE POLICY "Anon can view ayat and hadith"
  ON ayat_and_hadith FOR SELECT
  TO anon
  USING (visible = true AND archived = false);

-- announcements: display shows visible, non-archived items
CREATE POLICY "Anon can view announcements"
  ON announcements FOR SELECT
  TO anon
  USING (visible = true AND archived = false);

-- events: display shows visible, non-archived items
CREATE POLICY "Anon can view events"
  ON events FOR SELECT
  TO anon
  USING (visible = true AND archived = false);

-- posts: display shows visible, non-archived items
CREATE POLICY "Anon can view posts"
  ON posts FOR SELECT
  TO anon
  USING (visible = true AND archived = false);

-- prayer_times: display needs prayer time settings
CREATE POLICY "Anon can view prayer times"
  ON prayer_times FOR SELECT
  TO anon
  USING (true);

-- settings: display needs module/theme settings
CREATE POLICY "Anon can view settings"
  ON settings FOR SELECT
  TO anon
  USING (true);
