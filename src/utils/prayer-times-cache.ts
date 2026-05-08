import type { AlAdhanPrayerTimes } from '@/types';
import { formatDate, getYearAndMonth } from './date-time';

const PRAYER_TIMES_CACHE_PREFIX = 'prayer_times_month_cache_v1';

export type PrayerTimesCacheKey = {
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  year: number;
  month: number;
};

type PrayerTimesCacheEntry = PrayerTimesCacheKey & {
  days: AlAdhanPrayerTimes[];
};

const buildCacheId = (key: PrayerTimesCacheKey): string =>
  [
    PRAYER_TIMES_CACHE_PREFIX,
    key.latitude,
    key.longitude,
    key.method,
    key.school,
    key.year,
    key.month,
  ].join(':');

export const monthCacheKeyFromDate = (
  date: Date,
  latitude: number,
  longitude: number,
  method: number,
  school: number
): PrayerTimesCacheKey => {
  const [year, month] = getYearAndMonth(date);
  return { latitude, longitude, method, school, year, month };
};

export const readPrayerTimesMonth = (key: PrayerTimesCacheKey): AlAdhanPrayerTimes[] | null => {
  try {
    const raw = localStorage.getItem(buildCacheId(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as PrayerTimesCacheEntry;
    return entry.days;
  } catch {
    return null;
  }
};

export const writePrayerTimesMonth = (
  key: PrayerTimesCacheKey,
  days: AlAdhanPrayerTimes[]
): void => {
  try {
    const entry: PrayerTimesCacheEntry = { ...key, days };
    localStorage.setItem(buildCacheId(key), JSON.stringify(entry));
  } catch {
    // Ignore quota / serialization errors — cache is best-effort.
  }
};

/**
 * Find today's row inside a monthly Al-Adhan response.
 * Al-Adhan dates are formatted as DD-MM-YYYY (matching `formatDate`).
 */
export const findTodayInMonth = (
  days: AlAdhanPrayerTimes[],
  date: Date
): AlAdhanPrayerTimes | null => {
  const target = formatDate(date);
  return days.find(row => row.date.gregorian.date === target) ?? null;
};
