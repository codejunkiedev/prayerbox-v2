import type {
  CustomThemeConfig,
  DisplayLanguage,
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
  /**
   * Forces the language for preview purposes (theme-4 editor) without touching
   * the global i18n language. When unset, the theme follows the screen's
   * Display Language like every other theme.
   */
  previewLanguage?: DisplayLanguage;
}
