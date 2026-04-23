-- Let a user always see their own membership row, independent of
-- get_user_masjid_id(). Without this, INSERT ... RETURNING on
-- masjid_members fails for a bootstrapping admin: the WITH CHECK
-- passes but the RETURNING SELECT policy uses the pre-insert
-- snapshot of get_user_masjid_id() (STABLE), so the new row is
-- invisible and Postgres aborts the INSERT.
CREATE POLICY "Members can view own membership row"
  ON masjid_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
