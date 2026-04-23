-- Replace the client-side bootstrap approach (RLS policies that let a
-- brand-new user insert their own admin membership) with a DB trigger
-- that atomically mints an admin membership whenever a masjid_profile
-- row is created. This removes the orphan-profile failure mode and
-- the client no longer has to coordinate two writes.

-- 1. Trigger: profile insert → admin membership insert
CREATE OR REPLACE FUNCTION handle_new_masjid_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO masjid_members (masjid_id, user_id, role, name)
  VALUES (NEW.id, NEW.user_id, 'admin', NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_masjid_profile_insert
  AFTER INSERT ON masjid_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_masjid_profile();

-- 2. Backfill legacy orphans: profiles without a corresponding membership
INSERT INTO masjid_members (masjid_id, user_id, role, name)
SELECT mp.id, mp.user_id, 'admin', mp.name
FROM masjid_profiles mp
LEFT JOIN masjid_members mm ON mm.user_id = mp.user_id
WHERE mm.id IS NULL;

-- 3. Drop the now-redundant client-bootstrap policies
DROP POLICY IF EXISTS "Users can bootstrap first admin membership" ON masjid_members;
DROP POLICY IF EXISTS "Members can view own membership row" ON masjid_members;
