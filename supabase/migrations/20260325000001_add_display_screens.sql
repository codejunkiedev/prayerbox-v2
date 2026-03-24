-- ============================================
-- Add display screens and screen content
-- ============================================
-- Replaces the single masjid code with per-screen codes.
-- Each screen can have specific content assigned to it.

-- ============================================
-- 1. display_screens
-- ============================================
CREATE TABLE display_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait', 'mobile')),
  show_prayer_times BOOLEAN NOT NULL DEFAULT true,
  show_weather BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_display_screens_user_id ON display_screens(user_id);
CREATE UNIQUE INDEX idx_display_screens_code ON display_screens(code);

-- ============================================
-- 2. screen_content (junction table)
-- ============================================
CREATE TABLE screen_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES display_screens(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('ayat_and_hadith', 'announcements', 'events', 'posts')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(screen_id, content_id, content_type)
);

CREATE INDEX idx_screen_content_screen_id ON screen_content(screen_id);
CREATE INDEX idx_screen_content_content ON screen_content(content_id, content_type);

-- ============================================
-- 3. RLS for display_screens
-- ============================================
ALTER TABLE display_screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own display screens"
  ON display_screens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own display screens"
  ON display_screens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own display screens"
  ON display_screens FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own display screens"
  ON display_screens FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anon can view display screens"
  ON display_screens FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 4. RLS for screen_content
-- ============================================
ALTER TABLE screen_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own screen content"
  ON screen_content FOR SELECT
  TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own screen content"
  ON screen_content FOR INSERT
  TO authenticated
  WITH CHECK (screen_id IN (SELECT id FROM display_screens WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own screen content"
  ON screen_content FOR DELETE
  TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE user_id = auth.uid()));

CREATE POLICY "Anon can view screen content"
  ON screen_content FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 5. Remove code from masjid_profiles
-- ============================================
DROP INDEX IF EXISTS idx_masjid_profiles_code;

-- Drop the anon policy that references code (if it uses code for lookups)
-- The existing anon policy uses USING (true) so no change needed there.

ALTER TABLE masjid_profiles DROP COLUMN IF EXISTS code;
