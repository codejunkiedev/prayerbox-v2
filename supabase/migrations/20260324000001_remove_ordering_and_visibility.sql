-- ============================================
-- Remove ordering and visibility controls
-- ============================================
-- Drops visible and display_order columns from content tables,
-- updates composite indexes, recreates anon policies without
-- the visible check, and removes the modules JSONB column
-- from settings (modules are now hardcoded in the application).

-- ============================================
-- 1. Drop anon policies that reference the visible column
-- ============================================
DROP POLICY IF EXISTS "Anon can view ayat and hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Anon can view announcements" ON announcements;
DROP POLICY IF EXISTS "Anon can view events" ON events;
DROP POLICY IF EXISTS "Anon can view posts" ON posts;

-- ============================================
-- 2. ayat_and_hadith
-- ============================================
DROP INDEX IF EXISTS idx_ayat_and_hadith_lookup;
ALTER TABLE ayat_and_hadith DROP COLUMN IF EXISTS visible;
ALTER TABLE ayat_and_hadith DROP COLUMN IF EXISTS display_order;
CREATE INDEX idx_ayat_and_hadith_lookup ON ayat_and_hadith(user_id, archived);

-- ============================================
-- 3. announcements
-- ============================================
DROP INDEX IF EXISTS idx_announcements_lookup;
ALTER TABLE announcements DROP COLUMN IF EXISTS visible;
ALTER TABLE announcements DROP COLUMN IF EXISTS display_order;
CREATE INDEX idx_announcements_lookup ON announcements(user_id, archived);

-- ============================================
-- 4. events
-- ============================================
DROP INDEX IF EXISTS idx_events_lookup;
ALTER TABLE events DROP COLUMN IF EXISTS visible;
ALTER TABLE events DROP COLUMN IF EXISTS display_order;
CREATE INDEX idx_events_lookup ON events(user_id, archived);

-- ============================================
-- 5. posts
-- ============================================
DROP INDEX IF EXISTS idx_posts_lookup;
ALTER TABLE posts DROP COLUMN IF EXISTS visible;
ALTER TABLE posts DROP COLUMN IF EXISTS display_order;
CREATE INDEX idx_posts_lookup ON posts(user_id, archived);

-- ============================================
-- 6. Recreate anon policies without visible check
-- ============================================
CREATE POLICY "Anon can view ayat and hadith"
  ON ayat_and_hadith FOR SELECT
  TO anon
  USING (archived = false);

CREATE POLICY "Anon can view announcements"
  ON announcements FOR SELECT
  TO anon
  USING (archived = false);

CREATE POLICY "Anon can view events"
  ON events FOR SELECT
  TO anon
  USING (archived = false);

CREATE POLICY "Anon can view posts"
  ON posts FOR SELECT
  TO anon
  USING (archived = false);

-- ============================================
-- 7. settings — drop modules column
-- ============================================
ALTER TABLE settings DROP COLUMN IF EXISTS modules;
