-- ============================================
-- Storage bucket for user-uploaded background images
-- Used by the custom prayer-timings theme (and, later, the Ayat/Hadith
-- builder). Curated library images live in `assets`; these are per-masjid
-- uploads scoped by a `<masjid_id>/` path prefix at the application layer.
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-backgrounds', 'user-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view uploaded backgrounds (public bucket — display screens load
-- them over the anon/login-with-code flow).
CREATE POLICY "Public read access for user backgrounds"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'user-backgrounds');

-- Authenticated users (admins + moderators) can upload backgrounds.
CREATE POLICY "Authenticated users can upload user backgrounds"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-backgrounds');

-- Authenticated users can replace backgrounds (upsert).
CREATE POLICY "Authenticated users can update user backgrounds"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-backgrounds');

-- Authenticated users can delete backgrounds.
CREATE POLICY "Authenticated users can delete user backgrounds"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-backgrounds');
