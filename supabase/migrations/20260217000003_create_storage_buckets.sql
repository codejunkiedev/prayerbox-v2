-- ============================================
-- Storage Buckets
-- ============================================

-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('masjid-logos', 'masjid-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('masjid-posts', 'masjid-posts', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- ============================================
-- Storage Policies - masjid-logos
-- ============================================

-- Anyone can view logos (public bucket)
CREATE POLICY "Public read access for masjid logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'masjid-logos');

-- Authenticated users can upload logos
CREATE POLICY "Authenticated users can upload masjid logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'masjid-logos');

-- Authenticated users can update their own logos
CREATE POLICY "Authenticated users can update masjid logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'masjid-logos');

-- Authenticated users can delete their own logos
CREATE POLICY "Authenticated users can delete masjid logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'masjid-logos');

-- ============================================
-- Storage Policies - masjid-posts
-- ============================================

-- Anyone can view post images (public bucket)
CREATE POLICY "Public read access for masjid posts"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'masjid-posts');

-- Authenticated users can upload post images
CREATE POLICY "Authenticated users can upload masjid posts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'masjid-posts');

-- Authenticated users can update post images
CREATE POLICY "Authenticated users can update masjid posts"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'masjid-posts');

-- Authenticated users can delete post images
CREATE POLICY "Authenticated users can delete masjid posts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'masjid-posts');

-- ============================================
-- Storage Policies - assets
-- ============================================

-- Anyone can view assets (predesigned posts, etc.)
CREATE POLICY "Public read access for assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'assets');

-- Only authenticated users can manage assets
CREATE POLICY "Authenticated users can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assets');
