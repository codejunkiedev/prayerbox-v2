import type { AlAdhanPrayerTimes, PrayerTimes, Settings } from '@/types';

export interface ThemeProps {
  prayerTimes: AlAdhanPrayerTimes;
  prayerTimeSettings: PrayerTimes;
  userSettings: Settings;
  gregorianDate: string;
  hijriDate: string;
  sunrise: string;
  sunset: string;
  currentTime: Date;
}
