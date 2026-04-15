-- ============================================
-- Re-add Ayat & Hadith module (canvas-based slide designer)
-- ============================================
-- New schema stores source config, cached API text,
-- style config, and a rendered PNG image URL.
-- The display reads only the image, never the text.

-- ============================================
-- 1. Re-add 'ayat_and_hadith' to screen_content CHECK
-- ============================================
ALTER TABLE screen_content DROP CONSTRAINT IF EXISTS screen_content_content_type_check;
ALTER TABLE screen_content
  ADD CONSTRAINT screen_content_content_type_check
  CHECK (content_type IN ('announcements', 'events', 'posts', 'youtube_videos', 'ayat_and_hadith'));

-- ============================================
-- 2. Create ayat_and_hadith table
-- ============================================
CREATE TABLE ayat_and_hadith (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  masjid_id UUID NOT NULL REFERENCES masjid_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ayat', 'hadith')),
  orientation TEXT NOT NULL CHECK (orientation IN ('landscape', 'portrait', 'mobile')),
  source JSONB NOT NULL,
  cached_text JSONB NOT NULL,
  style JSONB NOT NULL,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ayat_and_hadith_masjid_id ON ayat_and_hadith(masjid_id);
CREATE INDEX idx_ayat_and_hadith_user_id ON ayat_and_hadith(user_id);

-- ============================================
-- 3. RLS policies (mirror announcements — any member can CRUD)
-- ============================================
ALTER TABLE ayat_and_hadith ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Anon can view ayat_and_hadith"
  ON ayat_and_hadith FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 4. Activity tracking trigger
-- ============================================
CREATE TRIGGER trg_update_last_active_ayat
  AFTER INSERT OR UPDATE OR DELETE ON ayat_and_hadith
  FOR EACH ROW EXECUTE FUNCTION update_member_last_active();

-- ============================================
-- 5. Storage bucket + policies
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('ayat-hadith-slides', 'ayat-hadith-slides', true);

CREATE POLICY "Public read access for ayat-hadith slides"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'ayat-hadith-slides');

CREATE POLICY "Authenticated users can upload ayat-hadith slides"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ayat-hadith-slides');

CREATE POLICY "Authenticated users can update ayat-hadith slides"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ayat-hadith-slides');

CREATE POLICY "Authenticated users can delete ayat-hadith slides"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ayat-hadith-slides');
