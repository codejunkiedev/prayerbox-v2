-- ============================================
-- settings / prayer_times: one row per masjid
-- ============================================
-- Both tables started out one-per-user (UNIQUE user_id) and later gained a
-- masjid_id with no uniqueness of its own, so nothing in the schema stopped a
-- masjid holding two rows. Only a masjid's one admin can write them, so in
-- practice each has one — but a second writer would add a second row, the admin
-- app would edit whichever row PostgREST happened to return first, and the
-- displays would keep reading the oldest. Every new reader would have to copy
-- that tiebreak.
--
-- From here both tables are keyed by masjid_id. user_id stays as a record of who
-- wrote the row: no longer unique, and nullable with ON DELETE SET NULL, so
-- deleting the account of whoever last saved doesn't delete the masjid's prayer
-- configuration with it.
--
-- Any duplicates are resolved by keeping each masjid's oldest row, which is the
-- one its displays already show, so no screen changes when this lands. The
-- display read functions still pick ORDER BY created_at LIMIT 1; under the new
-- constraint that is a no-op, so they are left as they are.
--
-- Independent of the app bundle; push any time.

DO $$
DECLARE
  v_settings BIGINT;
  v_prayer_times BIGINT;
BEGIN
  DELETE FROM settings s
   USING settings older
   WHERE older.masjid_id = s.masjid_id
     AND (older.created_at, older.id) < (s.created_at, s.id);
  GET DIAGNOSTICS v_settings = ROW_COUNT;

  DELETE FROM prayer_times p
   USING prayer_times older
   WHERE older.masjid_id = p.masjid_id
     AND (older.created_at, older.id) < (p.created_at, p.id);
  GET DIAGNOSTICS v_prayer_times = ROW_COUNT;

  IF v_settings + v_prayer_times > 0 THEN
    RAISE NOTICE 'Removed % duplicate settings row(s) and % duplicate prayer_times row(s)',
      v_settings, v_prayer_times;
  END IF;
END $$;

-- The inline UNIQUE and the explicit index both enforced one row per user.
-- Dropped by name without IF EXISTS, so a database whose names have drifted
-- fails here rather than quietly keeping the old key.
--
-- No replacement index on user_id: there is one row per masjid, and the only
-- lookup by it is the SET NULL when an auth user is deleted.
ALTER TABLE settings
  DROP CONSTRAINT settings_user_id_key,
  DROP CONSTRAINT settings_user_id_fkey,
  ALTER COLUMN user_id DROP NOT NULL,
  ADD CONSTRAINT settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT settings_masjid_id_key UNIQUE (masjid_id);

DROP INDEX idx_settings_user_id;

ALTER TABLE prayer_times
  DROP CONSTRAINT prayer_times_user_id_key,
  DROP CONSTRAINT prayer_times_user_id_fkey,
  ALTER COLUMN user_id DROP NOT NULL,
  ADD CONSTRAINT prayer_times_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT prayer_times_masjid_id_key UNIQUE (masjid_id);

DROP INDEX idx_prayer_times_user_id;

COMMENT ON COLUMN settings.user_id IS
  'Who wrote the row, not its owner. Rows are one per masjid (masjid_id is unique).';
COMMENT ON COLUMN prayer_times.user_id IS
  'Who last saved the row, not its owner. Rows are one per masjid (masjid_id is unique).';
