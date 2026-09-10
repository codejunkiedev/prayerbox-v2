import {
  applySingleAdjustment,
  formatGregorianDate,
  formatHijriDate,
  getChashtTime,
  getIshraqTime,
  getProcessedPrayerTimings,
  isFridayPrayer,
} from '@/utils';
import {
  Theme,
  type AlAdhanPrayerTimes,
  type CustomThemeConfig,
  type DisplayLanguage,
  type PrayerTimes,
  type ScreenOrientation,
  type Settings,
} from '@/types';
import { Theme1, Theme2, Theme3, Theme4 } from './themes';
import type { ThemeProps } from './themes/types';
import { useCurrentTime, useAdjustedHijriDate } from '@/hooks';
import { HijriCalculationMethod } from '@/constants';
import { useTranslation } from 'react-i18next';

interface PrayerTimingDisplayProps {
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
  userSettings: Settings | null;
  orientation: ScreenOrientation;
  theme: Theme;
  masjidName?: string;
  contactDetails?: string;
  customTheme?: CustomThemeConfig | null;
  /** The masjid's IANA zone; null falls back to the device's. */
  timeZone?: string | null;
}

/**
 * Displays prayer timings using different themes based on user settings
 */
export function PrayerTimingDisplay({
  prayerTimes,
  prayerTimeSettings,
  userSettings,
  orientation,
  theme,
  masjidName,
  contactDetails,
  customTheme,
  timeZone = null,
}: PrayerTimingDisplayProps) {
  const { currentTime } = useCurrentTime(timeZone);
  const { i18n } = useTranslation();
  const lang = i18n.language as DisplayLanguage;

  const { adjustedHijriDate } = useAdjustedHijriDate({
    calculationMethod: userSettings?.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura,
    offset: userSettings?.hijri_offset || 0,
    lang,
    timeZone,
  });

  if (!prayerTimes || !userSettings) return null;

  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;
  const selectedTheme = theme;

  const processedPrayerTimings = getProcessedPrayerTimings(prayerTimes, prayerTimeSettings);

  const themeProps: ThemeProps = {
    timeZone,
    gregorianDate: formatGregorianDate(date?.gregorian, lang),
    hijriDate: adjustedHijriDate || formatHijriDate(date?.hijri, lang),
    sunrise: applySingleAdjustment(timings?.Sunrise || '', userSettings?.sunrise_adjustment),
    sunset: applySingleAdjustment(timings?.Sunset || '', userSettings?.sunset_adjustment),
    ishraq: getIshraqTime(
      timings?.Sunrise || '',
      userSettings?.sunrise_adjustment,
      userSettings?.ishraq_adjustment
    ),
    chasht: getChashtTime(
      timings?.Sunrise || '',
      timings?.Dhuhr || '',
      userSettings?.sunrise_adjustment,
      userSettings?.chasht_adjustment
    ),
    currentTime,
    processedPrayerTimings,
    prayerTimeSettings,
    isFriday: isFridayPrayer(date),
    orientation,
    masjidName,
    contactDetails,
    customTheme,
  };

  const getPage = () => {
    switch (selectedTheme) {
      case Theme.Theme1:
        return <Theme1 {...themeProps} />;
      case Theme.Theme2:
        return <Theme2 {...themeProps} />;
      case Theme.Theme3:
        return <Theme3 {...themeProps} />;
      case Theme.Theme4:
        return <Theme4 {...themeProps} />;
      default:
        return <Theme1 {...themeProps} />;
    }
  };

  return getPage();
}
