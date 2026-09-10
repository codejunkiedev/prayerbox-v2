-- ============================================
-- Masjid timezone
-- ============================================

ALTER TABLE masjid_profiles ADD COLUMN timezone TEXT;

COMMENT ON COLUMN masjid_profiles.timezone IS
  'IANA zone id, e.g. Asia/Karachi. NULL until backfilled.';

CREATE OR REPLACE FUNCTION is_valid_timezone(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
  SELECT (p_name = 'UTC' OR p_name LIKE '%/%')
     AND EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_name);
$$;

CREATE OR REPLACE FUNCTION validate_masjid_timezone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.timezone IS NOT NULL AND NOT is_valid_timezone(NEW.timezone) THEN
    RAISE EXCEPTION 'Not a valid IANA timezone: %', NEW.timezone
      USING HINT = 'Expected a zone id such as Asia/Karachi. See pg_timezone_names.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_masjid_timezone
  BEFORE INSERT OR UPDATE OF timezone ON masjid_profiles
  FOR EACH ROW EXECUTE FUNCTION validate_masjid_timezone();
