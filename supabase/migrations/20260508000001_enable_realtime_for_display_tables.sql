-- Enable Supabase Realtime on every table the display module reads.
-- Without these, the display can subscribe to channels but the database
-- never publishes row changes, so admin edits won't push to live screens.
--
-- Adding to the supabase_realtime publication is the supported mechanism.
-- The DO block makes this idempotent (Postgres has no IF NOT EXISTS for
-- ALTER PUBLICATION ... ADD TABLE).
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'display_screens',
    'screen_content',
    'settings',
    'prayer_times',
    'masjid_profiles',
    'announcements',
    'events',
    'posts',
    'youtube_videos',
    'ayat_and_hadith'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;
