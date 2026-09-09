-- ============================================
-- Scope storage writes to the caller's masjid
-- ============================================
-- Every write policy on storage.objects was `TO authenticated USING (bucket_id
-- = '<name>')` — no path condition, no ownership check. Any authenticated
-- member of any masjid could overwrite or delete any other masjid's images.
-- The database side of that hole was closed in 20260909000002; this is the
-- storage side of the same problem.
--
-- Two changes:
--
--   1. `assets` becomes read-only. It holds the curated library — predesigned
--      posts and ayat/hadith backgrounds — that every masjid renders from, so
--      poisoning one file there reaches every screen in the fleet. Nothing in
--      the app writes to it (only `listFiles` reads), so the upload policy was
--      pure attack surface. With no write policy at all, only service_role,
--      which bypasses RLS, can change it.
--
--   2. The four per-masjid buckets are scoped by path prefix.
--
-- Why the fallback clause exists: uploads are only now being switched to a
-- `<masjid_id>/` prefix (see the client change alongside this migration).
-- Existing objects carry older shapes — `<user_id>/<ts>.png` for slides,
-- flat `<user_id>-<ts>` for posts and logos — so mutating them has to fall
-- back to the uploader's membership. `owner` alone could not carry the whole
-- rule: 60 objects have no owner, and another 24 were left with dangling
-- owners by the account cleanup, which is why the prefix is the primary test
-- and ownership only the legacy path.
--
-- INSERT deliberately has no fallback: every new object must land under
-- `<masjid_id>/`, so the legacy shape cannot grow.

-- ============================================
-- 1. Drop the unscoped write policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can upload assets"              ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload masjid logos"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update masjid logos"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete masjid logos"        ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload masjid posts"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update masjid posts"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete masjid posts"        ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload ayat-hadith slides"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ayat-hadith slides"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ayat-hadith slides"  ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload user backgrounds"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update user backgrounds"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete user backgrounds"    ON storage.objects;

-- ============================================
-- 2. Masjid-scoped writes on the four per-masjid buckets
-- ============================================
-- `assets` is absent from every list below, which is what makes it read-only.

CREATE POLICY "Members can upload into their masjid folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('masjid-logos', 'masjid-posts', 'ayat-hadith-slides', 'user-backgrounds')
    AND (storage.foldername(name))[1] = public.get_user_masjid_id()::text
  );

-- A flat object name yields an empty foldername array, so [1] is NULL and the
-- first branch is simply false for legacy files — they fall to the owner test.
CREATE POLICY "Members can update their masjid objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('masjid-logos', 'masjid-posts', 'ayat-hadith-slides', 'user-backgrounds')
    AND (
      (storage.foldername(name))[1] = public.get_user_masjid_id()::text
      OR EXISTS (
        SELECT 1 FROM public.masjid_members m
        WHERE m.user_id = storage.objects.owner
          AND m.masjid_id = public.get_user_masjid_id()
      )
    )
  )
  WITH CHECK (
    bucket_id IN ('masjid-logos', 'masjid-posts', 'ayat-hadith-slides', 'user-backgrounds')
    AND (storage.foldername(name))[1] = public.get_user_masjid_id()::text
  );

CREATE POLICY "Members can delete their masjid objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('masjid-logos', 'masjid-posts', 'ayat-hadith-slides', 'user-backgrounds')
    AND (
      (storage.foldername(name))[1] = public.get_user_masjid_id()::text
      OR EXISTS (
        SELECT 1 FROM public.masjid_members m
        WHERE m.user_id = storage.objects.owner
          AND m.masjid_id = public.get_user_masjid_id()
      )
    )
  );
