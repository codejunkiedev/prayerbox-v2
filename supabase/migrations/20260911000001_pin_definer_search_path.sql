-- ============================================
-- Pin search_path on the remaining SECURITY DEFINER functions
-- ============================================
-- These four run as their owner but resolve unqualified names through the
-- caller's search_path, so an object placed earlier on that path could stand
-- in for `masjid_members` inside a function that bypasses RLS. Two of them —
-- get_user_masjid_id() and get_user_role() — sit under every masjid-scoped
-- policy, including the storage write policies.
--
-- Every other definer function (the display read path, the revision beacon,
-- the heartbeat) already sets `search_path = public`; this brings the older
-- ones in line. `public` rather than '' so the bodies stay untouched: each one
-- only names `masjid_members` (public) and `auth.uid()` (already qualified).
--
-- No planner cost: SECURITY DEFINER functions are never inlined, so adding a
-- SET clause changes nothing about how the policies execute.
--
-- Independent of the app bundle; push any time.

-- RLS helpers
ALTER FUNCTION public.get_user_masjid_id() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;

-- Trigger functions
ALTER FUNCTION public.update_member_last_active() SET search_path = public;
ALTER FUNCTION public.handle_new_masjid_profile() SET search_path = public;
