-- Update screen_content check constraint to include youtube_videos
alter table public.screen_content
  drop constraint screen_content_content_type_check;

alter table public.screen_content
  add constraint screen_content_content_type_check
  check (content_type in ('ayat_and_hadith', 'announcements', 'events', 'posts', 'youtube_videos'));
