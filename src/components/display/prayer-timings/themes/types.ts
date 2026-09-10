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
  /**
   * Derived from sunrise rather than fetched — the prayer time API returns
   * neither. Only consumed by the custom theme (theme-4).
   */
  ishraq: string;
  chasht: string;
  /** Already a wall clock in the masjid's zone (see useCurrentTime). */
  currentTime: Date;
  /** The masjid's IANA zone; null falls back to the device's. */
  timeZone: string | null;
  processedPrayerTimings: ProcessedPrayerTiming[];
  prayerTimeSettings: PrayerTimes | null;
  isFriday: boolean;
  orientation: ScreenOrientation;
  /**
   * The masjid's name, already resolved to the language being rendered (see
   * `localizedProfileField`). Only consumed by the custom theme (theme-4);
   * blank hides it.
   */
  masjidName?: string;
  /**
   * The masjid's contact number, email and website as one ticker line (see
   * `formatContactDetails`). Only consumed by the custom theme (theme-4), and
   * only when its banner is set to show contact details; blank falls back to
   * the typed announcement.
   */
  contactDetails?: string;
  /** Only consumed by the custom theme (theme-4); null falls back to defaults. */
  customTheme?: CustomThemeConfig | null;
  /**
   * Forces the language for preview purposes (theme-4 editor) without touching
   * the global i18n language. When unset, the theme follows the screen's
   * Display Language like every other theme.
   */
  previewLanguage?: DisplayLanguage;
}
