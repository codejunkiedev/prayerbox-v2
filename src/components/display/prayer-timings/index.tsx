import { formatGregorianDate, formatHijriDate, formatTime } from '@/utils';
import { Theme, type AlAdhanPrayerTimes, type PrayerTimes, type Settings } from '@/types';
import { Theme1, Theme2 } from './themes';
import type { ThemeProps } from './themes/types';
import { useCurrentTime } from '@/hooks';

interface PrayerTimingDisplayProps {
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
  userSettings: Settings | null;
}

export function PrayerTimingDisplay({
  prayerTimes,
  prayerTimeSettings,
  userSettings,
}: PrayerTimingDisplayProps) {
  const { currentTime } = useCurrentTime();

  if (!prayerTimes || !userSettings || !prayerTimeSettings) return null;

  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;
  const selectedTheme = userSettings?.theme;

  const themeProps: ThemeProps = {
    prayerTimes,
    prayerTimeSettings,
    userSettings,
    gregorianDate: formatGregorianDate(date?.gregorian),
    hijriDate: formatHijriDate(date?.hijri),
    sunrise: formatTime(timings?.Sunrise || ''),
    sunset: formatTime(timings?.Sunset || ''),
    currentTime,
  };

  const getPage = () => {
    switch (selectedTheme) {
      case Theme.Theme1:
        return <Theme1 {...themeProps} />;
      case Theme.Theme2:
        return <Theme2 {...themeProps} />;
      default:
        return <Theme1 {...themeProps} />;
    }
  };

  return getPage();
}
