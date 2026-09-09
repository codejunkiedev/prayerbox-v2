-- ============================================
-- REVERT of 20260909000003_scope_storage_writes.sql
-- ============================================
-- Restores the unscoped storage write policies exactly as they were, including
-- the `assets` upload policy.
--
-- This reopens cross-masjid writes: any authenticated member of any masjid can
-- overwrite or delete any other masjid's images, and can write into the shared
-- `assets` library that every screen renders from. Only run it if the scoped
-- policies turn out to block a legitimate flow, and re-apply the fix after.
--
-- To run: paste into the project's SQL editor, or copy into
-- supabase/migrations/ under a fresh timestamp and push.

DROP POLICY IF EXISTS "Members can upload into their masjid folder" ON storage.objects;
DROP POLICY IF EXISTS "Members can update their masjid objects"     ON storage.objects;
DROP POLICY IF EXISTS "Members can delete their masjid objects"     ON storage.objects;

-- Verbatim from 20260217000003_create_storage_buckets.sql
CREATE POLICY "Authenticated users can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Authenticated users can upload masjid logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'masjid-logos');

CREATE POLICY "Authenticated users can update masjid logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'masjid-logos');

CREATE POLICY "Authenticated users can delete masjid logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'masjid-logos');

CREATE POLICY "Authenticated users can upload masjid posts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'masjid-posts');

CREATE POLICY "Authenticated users can update masjid posts"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'masjid-posts');

CREATE POLICY "Authenticated users can delete masjid posts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'masjid-posts');

-- Verbatim from 20260415000002_add_ayat_and_hadith.sql
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

-- Verbatim from 20260629000001_add_user_backgrounds_bucket.sql
CREATE POLICY "Authenticated users can upload user backgrounds"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-backgrounds');

CREATE POLICY "Authenticated users can update user backgrounds"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-backgrounds');

CREATE POLICY "Authenticated users can delete user backgrounds"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-backgrounds');
