-- ============================================
-- REVERT of 20260910000002_events_timestamptz_and_end_time.sql
-- ============================================
-- LOSES DATA: every end_time. Dump them first if you may want them back:
--
--   COPY (SELECT id, end_time FROM events WHERE end_time IS NOT NULL)
--     TO STDOUT WITH CSV HEADER;
--
-- Roll the web app back first: the new bundle sends end_time on every event
-- save, and PostgREST rejects an unknown column.
--
-- To run: paste into the project's SQL editor, or copy into
-- supabase/migrations/ under a fresh timestamp and push.

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

REVOKE ALL ON FUNCTION get_display_payload(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_display_payload(TEXT) TO anon, authenticated;

DROP INDEX IF EXISTS idx_events_upcoming;
ALTER TABLE events DROP COLUMN IF EXISTS ends_at;
DROP FUNCTION IF EXISTS event_ends_at(TIMESTAMPTZ, TIMESTAMPTZ);

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_end_after_start;
ALTER TABLE events DROP COLUMN IF EXISTS end_time;

ALTER TABLE events
  ALTER COLUMN date_time TYPE TEXT
  USING to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
