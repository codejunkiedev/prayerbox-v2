import type { PrayerTimesForDate } from '@/types';

const AlAdhanBaseUrl = 'https://api.aladhan.com/v1';

type FetchPrayerTimesForDatePayload = {
  date: string;
  latitude: number;
  longitude: number;
  method: number;
  school: number;
};

export const fetchPrayerTimesForDate = async ({
  date,
  latitude,
  longitude,
  method,
  school,
}: FetchPrayerTimesForDatePayload): Promise<PrayerTimesForDate> => {
  const url = new URL(`${AlAdhanBaseUrl}/timings/${date}`);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('method', method.toString());
  url.searchParams.set('school', school.toString());

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch prayer times');
  }

  return response.json();
};
