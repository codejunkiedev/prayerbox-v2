-- ============================================
-- Display read path, phase A: add the new surface
-- ============================================
-- Purely additive. Nothing is revoked here, so the currently deployed bundle —
-- which reads the tables directly as `anon` — keeps working exactly as it does
-- today. Phase B (20260909000002) removes the old path once every screen is on
-- a bundle that uses these functions.
--
-- Why this exists: the `anon` role, whose publishable key ships in the web
-- bundle and in the TV shell, can currently SELECT every row of every display
-- table. That includes `display_screens`, which holds the 7-character screen
-- login codes — anyone with the key can list every code and sign in as any
-- masjid's display — and the content tables, whose policies carry no masjid
-- predicate, so one request returns every masjid's announcements, events,
-- posts, videos, ayat/hadith, prayer settings and profiles.
--
-- The replacement is a set of SECURITY DEFINER functions keyed by the screen
-- code. The code becomes a bearer credential: checkable but never listable,
-- and it pins every result to the one masjid that owns the screen.

-- ============================================
-- 1. display_revisions — the realtime beacon
-- ============================================
-- Realtime decides what to deliver by evaluating the *subscriber's* RLS, so
-- once phase B revokes anon's SELECT the display's `postgres_changes`
-- subscriptions would go silent. Both display hooks ignore the event payload
-- and simply refetch, so the ten per-table subscriptions collapse into one
-- subscription to this counter.
--
-- One row per masjid holding nothing but a revision number. It is the only
-- table anon can read after phase B, and it is deliberately content-free.
--
-- No FK to masjid_profiles on purpose: ON DELETE CASCADE fires as an AFTER
-- trigger, so a cascaded child delete could try to re-insert a beacon row for
-- an already-deleted masjid. The bump function guards on the profile existing
-- instead, and the masjid_profiles branch removes the row outright.

CREATE TABLE display_revisions (
  masjid_id UUID PRIMARY KEY,
  revision BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO display_revisions (masjid_id)
SELECT id FROM masjid_profiles
ON CONFLICT (masjid_id) DO NOTHING;

ALTER TABLE display_revisions ENABLE ROW LEVEL SECURITY;

-- Justified `USING (true)`: the row exposes no masjid content, and Realtime
-- will not notify a subscriber that cannot read the row.
CREATE POLICY "Anyone can read display revisions"
  ON display_revisions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Granted explicitly rather than relying on the schema's default privileges,
-- since this is the one anon-readable table phase B leaves standing. No write
-- policies either way: the SECURITY DEFINER trigger below is the only writer.
GRANT SELECT ON display_revisions TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON display_revisions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION bump_display_revision()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
  v_masjid_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN rec := OLD; ELSE rec := NEW; END IF;

  IF TG_TABLE_NAME = 'masjid_profiles' THEN
    -- The masjid itself is going away; drop its beacon rather than bump it.
    IF TG_OP = 'DELETE' THEN
      DELETE FROM display_revisions WHERE masjid_id = rec.id;
      RETURN NULL;
    END IF;
    v_masjid_id := rec.id;
  ELSIF TG_TABLE_NAME = 'screen_content' THEN
    -- screen_content has no masjid_id of its own.
    SELECT ds.masjid_id INTO v_masjid_id
      FROM display_screens ds WHERE ds.id = rec.screen_id;
  ELSE
    v_masjid_id := rec.masjid_id;
  END IF;

  IF v_masjid_id IS NULL THEN RETURN NULL; END IF;

  -- Skip writes that are part of a masjid deletion cascade, whose ordering
  -- against the masjid_profiles branch above is not guaranteed.
  IF NOT EXISTS (SELECT 1 FROM masjid_profiles WHERE id = v_masjid_id) THEN
    RETURN NULL;
  END IF;

  INSERT INTO display_revisions AS dr (masjid_id, revision, updated_at)
  VALUES (v_masjid_id, 1, now())
  ON CONFLICT (masjid_id)
  DO UPDATE SET revision = dr.revision + 1, updated_at = now();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'masjid_profiles',
    'display_screens',
    'screen_content',
    'settings',
    'prayer_times',
    'announcements',
    'events',
    'posts',
    'youtube_videos',
    'ayat_and_hadith'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_bump_display_revision
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION bump_display_revision()', tbl);
  END LOOP;
END $$;

-- Publish the beacon. The content tables stay in the publication for now so
-- the currently deployed bundle keeps receiving its per-table events; phase B
-- removes them.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'display_revisions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.display_revisions';
  END IF;
END $$;

-- ============================================
-- 2. The display's replacement read path
-- ============================================
-- Everything a display needs, keyed by its own screen code. A caller without a
-- valid code gets NULL, and a caller with one cannot widen the query to another
-- masjid — there is no parameter that would let it.

-- Minimal disclosure for the TV shell, which only needs to know whether the
-- code the user typed is real before it loads the display in its WebView.
CREATE OR REPLACE FUNCTION verify_screen_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM display_screens WHERE code = p_code);
$$;

-- Login-with-code: the screen row plus the masjid it belongs to.
CREATE OR REPLACE FUNCTION get_display_session(p_code TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'screen', to_jsonb(s),
    'masjid_profile', to_jsonb(p)
  )
  FROM display_screens s
  LEFT JOIN masjid_profiles p ON p.id = s.masjid_id
  WHERE s.code = p_code;
$$;

-- Prayer settings only, for the hook that refetches on its own schedule
-- (midnight rollover, month change) rather than with the content payload.
--
-- settings and prayer_times are unique per *user*, not per masjid, so a masjid
-- with moderators can hold more than one row. The client took whichever row
-- PostgREST returned first; ordering by created_at makes that deterministic
-- and keeps the admin's original row winning, as it does today.
CREATE OR REPLACE FUNCTION get_display_prayer_settings(p_code TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'settings', (
      SELECT to_jsonb(x) FROM settings x
      WHERE x.masjid_id = s.masjid_id ORDER BY x.created_at LIMIT 1
    ),
    'prayer_times', (
      SELECT to_jsonb(x) FROM prayer_times x
      WHERE x.masjid_id = s.masjid_id ORDER BY x.created_at LIMIT 1
    )
  )
  FROM display_screens s
  WHERE s.code = p_code;
$$;

-- The full render payload: screen, masjid, prayer settings, the screen's
-- visible playlist and the content rows it points at.
--
-- Each content branch re-checks masjid_id. screen_content.content_id carries no
-- foreign key, so without that check an admin could assign another masjid's
-- content id to their own screen and read it back through this function.
CREATE OR REPLACE FUNCTION get_display_payload(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_screen display_screens;
  v_screen_content JSONB;
  v_content JSONB;
BEGIN
  SELECT * INTO v_screen FROM display_screens WHERE code = p_code;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(sc) ORDER BY sc.display_order), '[]'::jsonb)
    INTO v_screen_content
    FROM screen_content sc
   WHERE sc.screen_id = v_screen.id
     AND sc.visible;

  SELECT COALESCE(jsonb_object_agg(t.id, t.row), '{}'::jsonb)
    INTO v_content
    FROM (
      SELECT a.id::TEXT AS id, to_jsonb(a) AS row
        FROM announcements a
        JOIN screen_content sc
          ON sc.content_id = a.id AND sc.content_type = 'announcements'
       WHERE sc.screen_id = v_screen.id AND sc.visible
         AND a.masjid_id = v_screen.masjid_id AND a.archived = false
      UNION ALL
      SELECT e.id::TEXT, to_jsonb(e)
        FROM events e
        JOIN screen_content sc
          ON sc.content_id = e.id AND sc.content_type = 'events'
       WHERE sc.screen_id = v_screen.id AND sc.visible
         AND e.masjid_id = v_screen.masjid_id AND e.archived = false
      UNION ALL
      SELECT p.id::TEXT, to_jsonb(p)
        FROM posts p
        JOIN screen_content sc
          ON sc.content_id = p.id AND sc.content_type = 'posts'
       WHERE sc.screen_id = v_screen.id AND sc.visible
         AND p.masjid_id = v_screen.masjid_id AND p.archived = false
      UNION ALL
      SELECT y.id::TEXT, to_jsonb(y)
        FROM youtube_videos y
        JOIN screen_content sc
          ON sc.content_id = y.id AND sc.content_type = 'youtube_videos'
       WHERE sc.screen_id = v_screen.id AND sc.visible
         AND y.masjid_id = v_screen.masjid_id AND y.archived = false
      UNION ALL
      SELECT ah.id::TEXT, to_jsonb(ah)
        FROM ayat_and_hadith ah
        JOIN screen_content sc
          ON sc.content_id = ah.id AND sc.content_type = 'ayat_and_hadith'
       WHERE sc.screen_id = v_screen.id AND sc.visible
         AND ah.masjid_id = v_screen.masjid_id AND ah.archived = false
    ) t;

  RETURN jsonb_build_object(
    'screen', to_jsonb(v_screen),
    'masjid_profile', (
      SELECT to_jsonb(p) FROM masjid_profiles p WHERE p.id = v_screen.masjid_id
    ),
    'settings', (
      SELECT to_jsonb(x) FROM settings x
      WHERE x.masjid_id = v_screen.masjid_id ORDER BY x.created_at LIMIT 1
    ),
    'prayer_times', (
      SELECT to_jsonb(x) FROM prayer_times x
      WHERE x.masjid_id = v_screen.masjid_id ORDER BY x.created_at LIMIT 1
    ),
    'screen_content', v_screen_content,
    'content', v_content
  );
END;
$$;

-- Granted deliberately rather than leaning on the implicit EXECUTE for PUBLIC.
REVOKE ALL ON FUNCTION verify_screen_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_display_session(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_display_prayer_settings(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_display_payload(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION verify_screen_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_display_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_display_prayer_settings(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_display_payload(TEXT) TO anon, authenticated;
