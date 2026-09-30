-- ============================================
-- Push devices: phones that asked to hear about their masjids' time changes
-- ============================================
-- The app has no accounts, so a device is identified by a random id it
-- generates on install. Read and written only by Edge Functions.

CREATE TABLE push_devices (
  id UUID PRIMARY KEY,
  expo_push_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE push_subscriptions (
  device_id UUID NOT NULL REFERENCES push_devices(id) ON DELETE CASCADE,
  masjid_id UUID NOT NULL REFERENCES masjid_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, masjid_id)
);

CREATE INDEX idx_push_subscriptions_masjid_id ON push_subscriptions(masjid_id);

ALTER TABLE push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON push_devices FROM anon, authenticated;
REVOKE ALL ON push_subscriptions FROM anon, authenticated;

-- ============================================
-- Registration
-- ============================================
-- Replaces the device's whole followed list in one call. A token that moves to
-- a new install id takes its old row with it, and only listed masjids count.

CREATE OR REPLACE FUNCTION register_push_device(
  p_device_id UUID,
  p_token TEXT,
  p_platform TEXT,
  p_masjid_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  DELETE FROM push_devices WHERE expo_push_token = p_token AND id <> p_device_id;

  INSERT INTO push_devices (id, expo_push_token, platform)
  VALUES (p_device_id, p_token, p_platform)
  ON CONFLICT (id) DO UPDATE
    SET expo_push_token = EXCLUDED.expo_push_token,
        platform = EXCLUDED.platform,
        updated_at = now();

  DELETE FROM push_subscriptions
  WHERE device_id = p_device_id
    AND masjid_id <> ALL(coalesce(p_masjid_ids, ARRAY[]::UUID[]));

  INSERT INTO push_subscriptions (device_id, masjid_id)
  SELECT p_device_id, m.id
  FROM masjid_profiles m
  WHERE m.listed
    AND m.id = ANY(coalesce(p_masjid_ids, ARRAY[]::UUID[]))
  ON CONFLICT DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION register_push_device(UUID, TEXT, TEXT, UUID[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION register_push_device(UUID, TEXT, TEXT, UUID[]) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION register_push_device(UUID, TEXT, TEXT, UUID[]) TO service_role;
