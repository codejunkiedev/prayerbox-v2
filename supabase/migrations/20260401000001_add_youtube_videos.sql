-- Create youtube_videos table
create table if not exists public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  youtube_url text not null,
  loop_video boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.youtube_videos enable row level security;

-- RLS policies (match existing pattern)
create policy "Users can view their own youtube videos"
  on public.youtube_videos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own youtube videos"
  on public.youtube_videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own youtube videos"
  on public.youtube_videos for update
  using (auth.uid() = user_id);

-- Allow anon select for display screens
create policy "Anon can view youtube videos"
  on public.youtube_videos for select
  using (true);

-- Update screen_content check constraint to include youtube_videos
alter table public.screen_content
  drop constraint screen_content_content_type_check;

alter table public.screen_content
  add constraint screen_content_content_type_check
  check (content_type in ('ayat_and_hadith', 'announcements', 'events', 'posts', 'youtube_videos'));
