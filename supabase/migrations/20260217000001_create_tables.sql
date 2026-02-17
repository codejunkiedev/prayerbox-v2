-- ============================================
-- PrayerBox v2 - Database Schema Migration
-- ============================================

-- gen_random_uuid() is built into PostgreSQL 13+, no extension needed

-- ============================================
-- 1. masjid_profiles
-- ============================================
CREATE TABLE masjid_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

CREATE INDEX idx_masjid_profiles_user_id ON masjid_profiles(user_id);
CREATE UNIQUE INDEX idx_masjid_profiles_code ON masjid_profiles(code);

-- ============================================
-- 2. ayat_and_hadith
-- ============================================
CREATE TABLE ayat_and_hadith (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  text TEXT NOT NULL,
  translation TEXT NOT NULL,
  reference TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ayat', 'hadith')),
  archived BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER
);

CREATE INDEX idx_ayat_and_hadith_user_id ON ayat_and_hadith(user_id);
CREATE INDEX idx_ayat_and_hadith_lookup ON ayat_and_hadith(user_id, archived, visible);

-- ============================================
-- 3. announcements
-- ============================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER
);

CREATE INDEX idx_announcements_user_id ON announcements(user_id);
CREATE INDEX idx_announcements_lookup ON announcements(user_id, archived, visible);

-- ============================================
-- 4. events
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_time TEXT NOT NULL,
  location TEXT NOT NULL,
  chief_guest TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT '',
  qari TEXT NOT NULL DEFAULT '',
  naat_khawn TEXT NOT NULL DEFAULT '',
  karm_farma TEXT NOT NULL DEFAULT '',
  archived BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_lookup ON events(user_id, archived, visible);

-- ============================================
-- 5. posts
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  archived BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_lookup ON posts(user_id, archived, visible);

-- ============================================
-- 6. prayer_times (one per user)
-- ============================================
CREATE TABLE prayer_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calculation_method INTEGER NOT NULL DEFAULT 0,
  juristic_school INTEGER NOT NULL DEFAULT 1,
  prayer_adjustments JSONB
);

CREATE UNIQUE INDEX idx_prayer_times_user_id ON prayer_times(user_id);

-- ============================================
-- 7. settings (one per user)
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  modules JSONB NOT NULL DEFAULT '[
    {"id": "ayat-and-hadith", "name": "Ayats & Hadiths", "enabled": true, "display_order": 0},
    {"id": "announcements", "name": "Announcements", "enabled": true, "display_order": 1},
    {"id": "events", "name": "Events", "enabled": true, "display_order": 2},
    {"id": "posts", "name": "Posts", "enabled": true, "display_order": 3}
  ]'::jsonb,
  theme TEXT NOT NULL DEFAULT 'theme-1' CHECK (theme IN ('theme-1', 'theme-2')),
  hijri_calculation_method TEXT CHECK (hijri_calculation_method IN ('HJCoSA', 'UAQ', 'DIYANET')),
  hijri_offset INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX idx_settings_user_id ON settings(user_id);
