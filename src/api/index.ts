import type { AlAdhanPrayerTimes } from '@/types';
import { getMonth, getYear } from 'date-fns';

const AlAdhanBaseUrl = 'https://api.aladhan.com/v1';

interface PrayerTimesPayload {
  date: Date;
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  data: T;
  status: string;
  code: number;
}

export const fetchPrayerTimesForThisMonth = async ({
  date,
  latitude,
  longitude,
  method,
  school,
  signal,
}: PrayerTimesPayload): Promise<ApiResponse<AlAdhanPrayerTimes[]>> => {
  const [year, month] = [getYear(date), getMonth(date) + 1];

  const url = new URL(`${AlAdhanBaseUrl}/calendar/${year}/${month}`);

  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('method', method.toString());
  url.searchParams.set('school', school.toString());

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Failed to fetch prayer times');
  return response.json();
};
