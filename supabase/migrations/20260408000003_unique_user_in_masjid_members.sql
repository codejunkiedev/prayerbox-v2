-- Ensure a user can only belong to one masjid
ALTER TABLE masjid_members ADD CONSTRAINT masjid_members_user_id_unique UNIQUE (user_id);
