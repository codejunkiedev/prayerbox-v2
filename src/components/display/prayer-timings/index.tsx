import {
  formatGregorianDate,
  formatHijriDate,
  formatTime,
  getProcessedPrayerTimings,
} from '@/utils';
import {
  Theme,
  type AlAdhanPrayerTimes,
  type PrayerTimes,
  type ScreenOrientation,
  type Settings,
} from '@/types';
import { Theme1, Theme2, Theme3 } from './themes';
import type { ThemeProps } from './themes/types';
import { useCurrentTime, useAdjustedHijriDate } from '@/hooks';
import { HijriCalculationMethod } from '@/constants';

interface PrayerTimingDisplayProps {
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
  userSettings: Settings | null;
  orientation: ScreenOrientation;
}

/**
 * Displays prayer timings using different themes based on user settings
 */
export function PrayerTimingDisplay({
  prayerTimes,
  prayerTimeSettings,
  userSettings,
  orientation,
}: PrayerTimingDisplayProps) {
  const { currentTime } = useCurrentTime();

  const { adjustedHijriDate } = useAdjustedHijriDate({
    calculationMethod: userSettings?.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura,
    offset: userSettings?.hijri_offset || 0,
  });

  if (!prayerTimes || !userSettings || !prayerTimeSettings) return null;

  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;
  const selectedTheme = userSettings?.theme;

  const processedPrayerTimings = getProcessedPrayerTimings(prayerTimes, prayerTimeSettings);

  const themeProps: ThemeProps = {
    gregorianDate: formatGregorianDate(date?.gregorian),
    hijriDate: adjustedHijriDate || formatHijriDate(date?.hijri),
    sunrise: formatTime(timings?.Sunrise || ''),
    sunset: formatTime(timings?.Sunset || ''),
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
