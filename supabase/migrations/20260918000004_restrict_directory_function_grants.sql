-- ============================================
-- Directory functions: revoke the grant anon was never meant to have
-- ============================================
-- 20260918000003 said these were granted to service_role alone, and it was
-- wrong. `REVOKE ALL ... FROM PUBLIC` does not touch the explicit EXECUTE that
-- Supabase's default privileges hand to `anon` and `authenticated` whenever a
-- function is created in `public` — that grant is to the roles, not to PUBLIC,
-- so it survived.
--
-- Checked against the live project after deploying: anon calling
-- search_masjids_nearby got `permission denied for table masjid_profiles`, not
-- `permission denied for function`. So the call reached the function body and
-- was stopped only because these are SECURITY INVOKER and anon lost its SELECT
-- on masjid_profiles back in 20260909000002.
--
-- Nothing was exposed, but the table grant was carrying the whole defence: add
-- a permissive SELECT policy to masjid_profiles one day and these turn into a
-- public endpoint with no second look. The Edge Function remains the only way
-- in, which is where the rate limit and the column whitelist live.

REVOKE ALL ON FUNCTION masjid_distance_km(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION
) FROM anon, authenticated;
REVOKE ALL ON FUNCTION search_masjids_nearby(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER
) FROM anon, authenticated;
REVOKE ALL ON FUNCTION search_masjids_by_name(
  TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER
) FROM anon, authenticated;
REVOKE ALL ON FUNCTION get_masjids_public(UUID[]) FROM anon, authenticated;
