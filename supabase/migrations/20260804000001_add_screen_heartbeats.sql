-- ============================================
-- Track when a screen was last seen alive
-- ============================================
-- Displays sign in anonymously with their screen code and then keep that
-- session in localStorage indefinitely, so admins have no way to tell whether a
-- screen is still plugged in. Record a timestamp on login and refresh it with a
-- periodic heartbeat while the display runs.
--
-- Heartbeats are frequent writes, so they are kept off display_screens for two
-- reasons: that table is in the supabase_realtime publication (every write
-- would push a change to the live display and force a full content refetch),
-- and its rows carry the custom_theme JSON blob, which Postgres would rewrite
-- on every beat. This table is intentionally NOT added to the publication.

CREATE TABLE screen_heartbeats (
  screen_id UUID PRIMARY KEY REFERENCES display_screens(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE screen_heartbeats ENABLE ROW LEVEL SECURITY;

-- Members read heartbeats for their own masjid's screens. Writes only ever
-- happen through the SECURITY DEFINER function below, so no write policies.
CREATE POLICY "Members can view masjid screen heartbeats"
  ON screen_heartbeats FOR SELECT TO authenticated
  USING (screen_id IN (SELECT id FROM display_screens WHERE masjid_id = get_user_masjid_id()));

-- ============================================
-- Heartbeat stamping for anonymous displays
-- ============================================
-- The display client runs as `anon`, which has no write access to these tables.
-- Granting one would let any visitor stamp any screen, so beats go through a
-- SECURITY DEFINER function that only ever touches last_seen_at, and only for
-- the screen matching the supplied code.

CREATE OR REPLACE FUNCTION record_screen_heartbeat(p_code TEXT)
RETURNS VOID AS $$
  INSERT INTO screen_heartbeats (screen_id, last_seen_at)
  SELECT id, now() FROM display_screens WHERE code = p_code
  ON CONFLICT (screen_id) DO UPDATE SET last_seen_at = now();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION record_screen_heartbeat(TEXT) TO anon, authenticated;
