import type { PrayerAdjustments, SingleAdjustment, Theme } from './common';
import type { HijriCalculationMethod } from '@/constants';

export enum SupabaseTables {
  MasjidProfiles = 'masjid_profiles',
  Announcements = 'announcements',
  Events = 'events',
  Posts = 'posts',
  YouTubeVideos = 'youtube_videos',
  PrayerTimes = 'prayer_times',
  Settings = 'settings',
  DisplayScreens = 'display_screens',
  ScreenContent = 'screen_content',
  MasjidMembers = 'masjid_members',
  AyatAndHadith = 'ayat_and_hadith',
}

export enum SupabaseBuckets {
  MasjidLogos = 'masjid-logos',
  MasjidPosts = 'masjid-posts',
  Assets = 'assets',
  AyatHadithSlides = 'ayat-hadith-slides',
  UserBackgrounds = 'user-backgrounds',
}

export enum SupabaseFolders {
  PredesignedPosts = 'predesigned-posts',
  AyatHadithBackgrounds = 'ayat-hadith-backgrounds',
}

export type MemberRole = 'admin' | 'moderator';

export interface MasjidMember {
  id: string;
  masjid_id: string;
  user_id: string;
  role: MemberRole;
  name: string;
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
  area_ur: string;
  area_ar: string;
  latitude: number | null;
  longitude: number | null;
}

export type ScreenOrientation = 'landscape' | 'portrait' | 'mobile';
export type ScreenContentType =
  | 'announcements'
  | 'events'
  | 'posts'
  | 'youtube_videos'
  | 'ayat_and_hadith';
export type PostOrientation = 'landscape' | 'portrait';

export type AyatHadithType = 'ayat' | 'hadith';

export interface AyatSource {
  surah: number;
  ayah: number;
}

export interface HadithSource {
  book: string;
  hadith_number: string;
}

export interface AyatHadithCachedText {
  arabic: string;
  urdu?: { edition: string; text: string };
  english?: { edition: string; text: string };
  reference?: { arabic: string; english: string };
}

export interface BackgroundImage {
  name: string;
  url: string;
}

export type AyatHadithAlign = 'left' | 'center' | 'right';

export interface AyatHadithTextStyle {
  font_id: string;
  size: number;
  color: string;
  line_height: number;
  align: AyatHadithAlign;
}

export interface AyatHadithReferenceStyle extends AyatHadithTextStyle {
  arabic_font_id: string;
}

export type AyatHadithBackground =
  | { type: 'image'; url: string }
  | { type: 'color'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number };

/** Position + size of a layer, as percentages (0–100) of the canvas. */
export interface AyatHadithBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AyatHadithLayerKey = 'overlay' | 'arabic' | 'urdu' | 'english' | 'reference';

export interface AyatHadithPositions {
  overlay: AyatHadithBox;
  arabic: AyatHadithBox;
  urdu: AyatHadithBox;
  english: AyatHadithBox;
  reference: AyatHadithBox;
}

export interface AyatHadithStyle {
  background: AyatHadithBackground;
  overlay_color: string;
  overlay_opacity: number;
  show_overlay: boolean;
  arabic: AyatHadithTextStyle;
  urdu: AyatHadithTextStyle;
  english: AyatHadithTextStyle;
  reference: AyatHadithReferenceStyle;
  positions: AyatHadithPositions;
}

export interface AyatAndHadith extends Base {
  type: AyatHadithType;
  orientation: ScreenOrientation;
  source: AyatSource | HadithSource;
  cached_text: AyatHadithCachedText;
  style: AyatHadithStyle;
  image_url: string;
  image_path: string;
  archived: boolean;
}

export type DisplayLanguage = 'en' | 'ur' | 'ar';

/**
 * Text groups for the custom prayer-timings theme. Each group is an independent
 * unit for the per-group size multiplier and the semantic color slot, mapped to
 * Theme 3's typographic roles.
 */
export type CustomThemeTextGroup = 'header' | 'names' | 'times' | 'countdown' | 'date';

/**
 * Per-element show/hide flags for the custom theme. The prayer-name column is
 * always shown; at least one of the three time columns must stay visible
 * (enforced in the controls). Hidden elements reflow within Theme 3's layout.
 */
export interface CustomThemeVisibility {
  columnStarts: boolean;
  columnAthan: boolean;
  columnIqamah: boolean;
  sunriseSunset: boolean;
  nextIqamahCard: boolean;
  hijriDate: boolean;
  gregorianDate: boolean;
  clock: boolean;
}

/**
 * Text colors for the custom theme: one `global` color plus optional per-group
 * overrides. A null override means that group inherits `global`.
 */
export interface CustomThemeColors {
  global: string;
  overrides: Record<CustomThemeTextGroup, string | null>;
}

/**
 * Per-screen config for the custom prayer-timings theme (theme-4). Reuses
 * Theme 3's layout/hierarchy as the fixed base; these controls affect
 * appearance and element visibility only — never positioning. `size.scale` is
 * a global multiplier on Theme 3's base sizes, `size.groups` are per-group
 * fine-tune multipliers on top of it.
 */
export interface CustomThemeConfig {
  background: AyatHadithBackground;
  overlay: { enabled: boolean; color: string; opacity: number };
  fonts: { latin: string; arabic: string };
  size: { scale: number; groups: Record<CustomThemeTextGroup, number> };
  colors: CustomThemeColors;
  visibility: CustomThemeVisibility;
}

export interface DisplayScreen extends Base {
  name: string;
  code: string;
  orientation: ScreenOrientation;
  show_prayer_times: boolean;
  show_weather: boolean;
  theme: Theme;
  custom_theme: CustomThemeConfig | null;
  language: DisplayLanguage;
  slide_interval_seconds: number;
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
  hijri_calculation_method?: HijriCalculationMethod;
  hijri_offset?: number;
  calculation_method?: number;
  juristic_school?: number;
  sunrise_adjustment?: SingleAdjustment;
  sunset_adjustment?: SingleAdjustment;
}
