import type {
  CustomThemeConfig,
  ProcessedPrayerTiming,
  PrayerTimes,
  ScreenOrientation,
} from '@/types';

export interface ThemeProps {
  gregorianDate: string;
  hijriDate: string;
  sunrise: string;
  sunset: string;
  currentTime: Date;
  processedPrayerTimings: ProcessedPrayerTiming[];
  prayerTimeSettings: PrayerTimes | null;
  orientation: ScreenOrientation;
  /** Only consumed by the custom theme (theme-4); null falls back to defaults. */
  customTheme?: CustomThemeConfig | null;
}
