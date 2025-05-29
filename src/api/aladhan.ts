import type { AlAdhanPrayerTimes } from '@/types';
import { formatDate, getYearAndMonth } from '@/utils';

const AlAdhanBaseUrl = 'https://api.aladhan.com/v1';

export interface ApiResponse<T> {
  data: T;
  status: string;
  code: number;
}

export interface PrayerTimesPayload {
  date: Date;
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  signal?: AbortSignal;
}

export const fetchPrayerTimesForThisMonth = async ({
  date,
  latitude,
  longitude,
  method,
  school,
  signal,
}: PrayerTimesPayload): Promise<ApiResponse<AlAdhanPrayerTimes[]>> => {
  const [year, month] = getYearAndMonth(date);

  const url = new URL(`${AlAdhanBaseUrl}/calendar/${year}/${month}`);

  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('method', method.toString());
  url.searchParams.set('school', school.toString());

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Failed to fetch prayer times');
  return response.json();
};

export const fetchPrayerTimesForDate = async ({
  date,
  latitude,
  longitude,
  method,
  school,
  signal,
}: PrayerTimesPayload): Promise<ApiResponse<AlAdhanPrayerTimes>> => {
  const dateString = formatDate(date);

  const url = new URL(`${AlAdhanBaseUrl}/timings/${dateString}`);

  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('method', method.toString());
  url.searchParams.set('school', school.toString());

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Failed to fetch prayer times');
  return response.json();
};
