import {
  applySingleAdjustment,
  formatGregorianDate,
  formatHijriDate,
  getProcessedPrayerTimings,
} from '@/utils';
import {
  Theme,
  type AlAdhanPrayerTimes,
  type DisplayLanguage,
  type PrayerTimes,
  type ScreenOrientation,
  type Settings,
} from '@/types';
import { Theme1, Theme2, Theme3 } from './themes';
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
}: PrayerTimingDisplayProps) {
  const { currentTime } = useCurrentTime();
  const { i18n } = useTranslation();
  const lang = i18n.language as DisplayLanguage;

  const { adjustedHijriDate } = useAdjustedHijriDate({
    calculationMethod: userSettings?.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura,
    offset: userSettings?.hijri_offset || 0,
    lang,
  });

  if (!prayerTimes || !userSettings) return null;

  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;
  const selectedTheme = theme;

  const processedPrayerTimings = getProcessedPrayerTimings(prayerTimes, prayerTimeSettings);

  const themeProps: ThemeProps = {
    gregorianDate: formatGregorianDate(date?.gregorian, lang),
    hijriDate: adjustedHijriDate || formatHijriDate(date?.hijri, lang),
    sunrise: applySingleAdjustment(timings?.Sunrise || '', userSettings?.sunrise_adjustment),
    sunset: applySingleAdjustment(timings?.Sunset || '', userSettings?.sunset_adjustment),
    currentTime,
    processedPrayerTimings,
    prayerTimeSettings,
    orientation,
  };

  const getPage = () => {
    switch (selectedTheme) {
      case Theme.Theme1:
        return <Theme1 {...themeProps} />;
      case Theme.Theme2:
        return <Theme2 {...themeProps} />;
      case Theme.Theme3:
        return <Theme3 {...themeProps} />;
      default:
        return <Theme1 {...themeProps} />;
    }
  };

  return getPage();
}
