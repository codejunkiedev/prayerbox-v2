import type { AlAdhanPrayerTimes } from '@/types';

/**
 * Checks if the given date is a Friday
 * @param date AlAdhan prayer times date object
 * @returns True if the date is Friday
 */
export const isFridayPrayer = (date: AlAdhanPrayerTimes['date'] | undefined): boolean => {
  return date?.gregorian?.weekday?.en === 'Friday';
};

/**
 * Gets the prayer time names for display
 */
export const PRAYER_NAMES = {
  fajr: 'فجر',
  sunrise: 'شروق',
  dhuhr: 'ظهر',
  asr: 'عصر',
  maghrib: 'مغرب',
  isha: 'عشاء',
  jumma: 'جمعة',
  jumma1: 'جمعة ١',
  jumma2: 'جمعة ٢',
  jumma3: 'جمعة ٣',
} as const;
