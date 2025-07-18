import type { ProcessedPrayerTiming } from '@/types';

export interface ThemeProps {
  gregorianDate: string;
  hijriDate: string;
  sunrise: string;
  sunset: string;
  currentTime: Date;
  processedPrayerTimings: ProcessedPrayerTiming[];
}
