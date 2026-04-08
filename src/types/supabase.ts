import type { PrayerAdjustments, Theme } from './common';
import type { HijriCalculationMethod } from '@/constants';

export enum SupabaseTables {
  MasjidProfiles = 'masjid_profiles',
  AyatAndHadith = 'ayat_and_hadith',
  Announcements = 'announcements',
  Events = 'events',
  Posts = 'posts',
  YouTubeVideos = 'youtube_videos',
  PrayerTimes = 'prayer_times',
  Settings = 'settings',
  DisplayScreens = 'display_screens',
  ScreenContent = 'screen_content',
  MasjidMembers = 'masjid_members',
}

export enum SupabaseBuckets {
  MasjidLogos = 'masjid-logos',
  MasjidPosts = 'masjid-posts',
  Assets = 'assets',
}

export enum SupabaseFolders {
  PredesignedPosts = 'predesigned-posts',
}

export type MemberRole = 'admin' | 'moderator';

export interface MasjidMember {
  id: string;
  masjid_id: string;
  user_id: string;
  role: MemberRole;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Base {
  id: string;
  user_id: string;
  masjid_id: string;
  created_at: string;
  updated_at: string;
}

export interface MasjidProfile extends Base {
  logo_url: string;
  name: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
}

export type ScreenOrientation = 'landscape' | 'portrait' | 'mobile';
export type ScreenContentType =
  | 'ayat_and_hadith'
  | 'announcements'
  | 'events'
  | 'posts'
  | 'youtube_videos';
export type PostOrientation = 'landscape' | 'portrait';

export interface DisplayScreen extends Base {
  name: string;
  code: string;
  orientation: ScreenOrientation;
  show_prayer_times: boolean;
  show_weather: boolean;
}

export interface ScreenContent {
  id: string;
  screen_id: string;
  content_id: string;
  content_type: ScreenContentType;
  display_order: number;
  visible: boolean;
  created_at: string;
}

export interface AyatAndHadith extends Base {
  text: string;
  translation: string;
  reference: string;
  type: 'ayat' | 'hadith';
  archived: boolean;
}

export interface Announcement extends Base {
  description: string;
  archived: boolean;
}

export interface Event extends Base {
  title: string;
  description: string;
  date_time: string;
  location: string;
  chief_guest: string;
  host: string;
  qari: string;
  naat_khawn: string;
  karm_farma: string;
  archived: boolean;
}

export interface Post extends Base {
  title: string;
  image_url: string;
  archived: boolean;
  orientation: PostOrientation;
}

export interface YouTubeVideo extends Base {
  title: string;
  youtube_url: string;
  loop_video: boolean;
  archived: boolean;
}

export interface PrayerTimes extends Base {
  prayer_adjustments?: PrayerAdjustments;
}

export interface Settings extends Base {
  theme: Theme;
  hijri_calculation_method?: HijriCalculationMethod;
  hijri_offset?: number;
  calculation_method?: number;
  juristic_school?: number;
}
