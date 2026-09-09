-- ============================================
-- REVERT of 20260909000002_revoke_anon_display_access.sql
-- ============================================
-- Restores every anon read path that phase B removed, exactly as it was.
-- Phase A is left completely intact, so after running this BOTH the old bundle
-- (direct table reads) and the new one (the code-keyed functions) work. That
-- is the point: a rollback should not trade one breakage for another.
--
-- This reopens the cross-masjid exposure described in phase B's header,
-- including the listable screen codes. Treat it as an incident tool, not a
-- normal step, and re-apply phase B once whatever went wrong is understood.
--
-- To run: paste into the SQL editor for the project, or copy into
-- supabase/migrations/ under a fresh timestamp and push. The Supabase CLI is
-- forward-only — it has no `down`, so a revert is itself a migration.

-- ============================================
-- 1. Restore the realtime publication
-- ============================================
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'display_screens',
    'screen_content',
    'settings',
    'prayer_times',
    'masjid_profiles',
    'announcements',
    'events',
    'posts',
    'youtube_videos',
    'ayat_and_hadith'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 2. Restore the grants, then the policies
-- ============================================
GRANT SELECT ON
  display_screens,
  screen_content,
  masjid_profiles,
  settings,
  prayer_times,
  announcements,
  events,
  posts,
  ayat_and_hadith,
  youtube_videos
TO anon;

-- Verbatim from 20260325000001_add_display_screens.sql
CREATE POLICY "Anon can view display screens"
  ON display_screens FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can view screen content"
  ON screen_content FOR SELECT
  TO anon
  USING (true);

-- Verbatim from 20260217000004_add_anon_select_policies.sql
CREATE POLICY "Anon can view masjid profiles"
  ON masjid_profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can view prayer times"
  ON prayer_times FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can view settings"
  ON settings FOR SELECT
  TO anon
  USING (true);

-- Verbatim from 20260324000001_remove_ordering_and_visibility.sql
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

-- Verbatim from 20260415000002_add_ayat_and_hadith.sql. Note this is the
-- underscored name; the spaced "Anon can view ayat and hadith" policy died
-- with the old table in 20260415000001 and is deliberately not recreated.
CREATE POLICY "Anon can view ayat_and_hadith"
  ON ayat_and_hadith FOR SELECT
  TO anon
  USING (true);

-- Verbatim from 20260401000001_add_youtube_videos.sql, including the missing
-- TO clause that made it apply to PUBLIC rather than just anon. Restored as-is
-- so this file is a true revert; if you are rolling back for an unrelated
-- reason, consider adding `TO anon` here rather than reopening the
-- authenticated cross-tenant read as well.
CREATE POLICY "Anon can view youtube videos"
  ON public.youtube_videos FOR SELECT
  USING (true);

-- ============================================
-- 3. Restore the storage read policies
-- ============================================
DROP POLICY IF EXISTS "Members can list display buckets" ON storage.objects;

CREATE POLICY "Public read access for masjid logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'masjid-logos');

CREATE POLICY "Public read access for masjid posts"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'masjid-posts');

CREATE POLICY "Public read access for assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'assets');

CREATE POLICY "Public read access for ayat-hadith slides"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'ayat-hadith-slides');

CREATE POLICY "Public read access for user backgrounds"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'user-backgrounds');
