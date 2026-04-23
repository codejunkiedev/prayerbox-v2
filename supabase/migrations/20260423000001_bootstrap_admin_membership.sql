-- Allow a brand-new user (no existing membership) to insert a self-admin
-- row when they create their first masjid_profile. Without this, new
-- signups cannot bootstrap into the masjid_members table because the
-- existing "Admins can insert masjid members" policy requires an
-- already-admin membership.
CREATE POLICY "Users can bootstrap first admin membership"
  ON masjid_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM masjid_members mm WHERE mm.user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM masjid_profiles mp
      WHERE mp.id = masjid_id AND mp.user_id = auth.uid()
    )
  );
