import type { PrayerAdjustmentData } from '@/lib/zod';

export interface PrayerAdjustment {
  type: PrayerAdjustmentData['type'];
  offset?: number;
  manual_time?: string;
}

export interface PrayerAdjustments {
  fajr: PrayerAdjustment;
  sunrise: PrayerAdjustment;
  dhuhr: PrayerAdjustment;
  asr: PrayerAdjustment;
  maghrib: PrayerAdjustment;
  isha: PrayerAdjustment;
  jumma1: PrayerAdjustment;
  jumma2: PrayerAdjustment;
  jumma3: PrayerAdjustment;
}

export interface ProcessedPrayerTiming {
  name: string;
  time: string;
  arabicName: string;
}

export type ModuleId = 'ayat-and-hadith' | 'announcements' | 'events' | 'posts';
export type ModuleName = 'Ayats & Hadiths' | 'Announcements' | 'Events' | 'Posts';

export type Module = {
  id: ModuleId;
  name: ModuleName;
  enabled: boolean;
  display_order: number;
};

export enum Theme {
  Theme1 = 'theme-1',
  Theme2 = 'theme-2',
}
