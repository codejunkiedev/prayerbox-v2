-- ============================================
-- Display read path, phase B: remove the old surface
-- ============================================
-- This is the half that can strand a display in the field. Do NOT apply it
-- until every screen is confirmed to be running a bundle that reads through
-- the functions added in 20260909000001 — a display still on the old bundle
-- loses its reads the moment this lands, and screens run unattended, so they
-- will not necessarily reload on their own.
--
-- Check before applying: `screen_heartbeats.last_seen_at` tells you which
-- screens are still alive, and the new bundle's first payload fetch is what
-- refreshes it. A screen whose heartbeat is stale has not picked up the new
-- bundle.
--
-- Reverting this file: supabase/reverts/20260909000002_*.revert.sql — it
-- restores every policy and grant below verbatim while leaving phase A intact,
-- so both the old and the new bundle work during a rollback.

-- ============================================
-- 1. Realtime publication
-- ============================================
-- The beacon added in phase A replaces these. Dropping them stops Postgres
-- decoding their WAL for a subscriber that no longer exists, and means a
-- permissive anon policy added here by mistake in future cannot be turned into
-- a cross-masjid change feed.

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
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 2. Remove every anon read path
-- ============================================
-- Audit of the anon SELECT policies this drops:
--
--   display_screens    USING (true)              leaked every screen login code
--   screen_content     USING (true)              leaked every screen's playlist
--   masjid_profiles    USING (true)              leaked contact phone/email
--   settings           USING (true)              no masjid predicate
--   prayer_times       USING (true)              no masjid predicate
--   ayat_and_hadith    USING (true)              no masjid predicate
--   announcements      USING (archived = false)  no masjid predicate
--   events             USING (archived = false)  no masjid predicate
--   posts              USING (archived = false)  no masjid predicate
--   youtube_videos     USING (true)              see note below
--
-- "Anon can view youtube videos" was created without a TO clause, so it applied
-- to PUBLIC — every role, not just anon. The moderator RLS rewrite dropped the
-- old owner policies on that table but left this one standing, which meant any
-- authenticated member of any masjid could read every masjid's videos. Dropping
-- it closes an authenticated cross-tenant read, not just an anonymous one.
--
-- The "ayat and hadith" (spaced) name is a leftover: that policy died with the
-- table in 20260415000001 and was recreated under the underscored name. Both
-- are dropped defensively.

DROP POLICY IF EXISTS "Anon can view display screens" ON display_screens;
DROP POLICY IF EXISTS "Anon can view screen content" ON screen_content;
DROP POLICY IF EXISTS "Anon can view masjid profiles" ON masjid_profiles;
DROP POLICY IF EXISTS "Anon can view settings" ON settings;
DROP POLICY IF EXISTS "Anon can view prayer times" ON prayer_times;
DROP POLICY IF EXISTS "Anon can view announcements" ON announcements;
DROP POLICY IF EXISTS "Anon can view events" ON events;
DROP POLICY IF EXISTS "Anon can view posts" ON posts;
DROP POLICY IF EXISTS "Anon can view ayat_and_hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Anon can view ayat and hadith" ON ayat_and_hadith;
DROP POLICY IF EXISTS "Anon can view youtube videos" ON youtube_videos;

-- Belt and braces. With the policies gone, RLS already returns zero rows, but
-- revoking the grant means a future permissive policy cannot silently reopen
-- the table to anon — the privilege has to be granted back deliberately. It
-- also kills the `?code=eq.X` predicate, not just the projection: Postgres
-- requires SELECT on a column to reference it in a WHERE clause, so codes stop
-- being resolvable through the table at all.
--
-- The phase A functions are SECURITY DEFINER and run as the owner, so they are
-- unaffected by this.
REVOKE SELECT ON
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
FROM anon;

-- ============================================
-- 3. Storage: stop anon listing the buckets
-- ============================================
-- The remaining unscoped read grants live on storage.objects. Each bucket's
-- read policy is `TO public USING (bucket_id = '<bucket>')`, which lets anyone
-- holding the publishable key call the storage list API and enumerate every
-- masjid's post images, logos, slides and uploaded backgrounds — the same
-- cross-masjid exposure the policies above closed on the database side.
--
-- These buckets are public, and downloads from a public bucket are served by
-- `/storage/v1/object/public/...` without consulting RLS at all (no key is even
-- required). So the display keeps rendering every image exactly as before; only
-- the listing path, used solely by the authenticated admin UI (background
-- picker, predesigned posts, uploaded backgrounds), is restricted.
--
-- Not addressed here: the *write* policies on these buckets are
-- `TO authenticated USING (bucket_id = ...)` with no path scoping, so any
-- moderator can overwrite or delete another masjid's images. Fixing that needs
-- a per-masjid path convention that three of these buckets do not yet have,
-- plus relocating existing objects.

DROP POLICY IF EXISTS "Public read access for masjid logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for masjid posts" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for ayat-hadith slides" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for user backgrounds" ON storage.objects;

CREATE POLICY "Members can list display buckets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id IN (
      'masjid-logos',
      'masjid-posts',
      'assets',
      'ayat-hadith-slides',
      'user-backgrounds'
    )
  );
