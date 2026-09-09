-- ============================================
-- REVERT of 20260909000001_add_display_read_functions.sql
-- ============================================
-- Removes the code-keyed read functions and the realtime beacon.
--
-- ORDER MATTERS: if phase B (20260909000002) has been applied, revert it FIRST.
-- Phase B is what removes the old anon read path, and it leaves the functions
-- here as the display's only way in — dropping them while B is live takes every
-- display offline. Reverting B alone is safe and is usually all you want.
--
-- Running this after B has been reverted is safe: the old bundle reads the
-- tables directly and never calls these functions, and the beacon table only
-- ever held derived counters, so nothing is lost. It rebuilds itself from the
-- next write if phase A is applied again.
--
-- To run: paste into the SQL editor for the project, or copy into
-- supabase/migrations/ under a fresh timestamp and push. The Supabase CLI is
-- forward-only — it has no `down`, so a revert is itself a migration.

-- ============================================
-- 1. The read functions
-- ============================================
DROP FUNCTION IF EXISTS get_display_payload(TEXT);
DROP FUNCTION IF EXISTS get_display_prayer_settings(TEXT);
DROP FUNCTION IF EXISTS get_display_session(TEXT);
DROP FUNCTION IF EXISTS verify_screen_code(TEXT);

-- ============================================
-- 2. The beacon
-- ============================================
-- CASCADE drops the ten trg_bump_display_revision triggers that depend on it.
DROP FUNCTION IF EXISTS bump_display_revision() CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'display_revisions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.display_revisions';
  END IF;
END $$;

DROP TABLE IF EXISTS display_revisions;
