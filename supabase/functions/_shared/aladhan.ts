/**
 * Al-Adhan, server side. The base times every resolved day is built from.
 *
 * Fetched a whole month at a time and cached in `masjid_prayer_days`, so this
 * runs once per masjid per month rather than once per phone.
 */

const BASE_URL = 'https://api.aladhan.com/v1';

export interface AlAdhanDay {
  timings: Record<string, string>;
  date: {
    readable: string;
    gregorian: { date: string; weekday: { en: string } };
    hijri: {
      date: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
      designation: { abbreviated: string; expanded: string };
    };
  };
}

export interface MonthRequest {
  year: number;
  month: number;
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  calendarMethod?: string | null;
}

export class AlAdhanError extends Error {}

/** `18-09-2026` (Al-Adhan's gregorian format) to `2026-09-18`. */
export const isoFromAlAdhanDate = (date: string): string | null => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

export const fetchMonth = async ({
  year,
  month,
  latitude,
  longitude,
  method,
  school,
  calendarMethod,
}: MonthRequest): Promise<AlAdhanDay[]> => {
  const url = new URL(`${BASE_URL}/calendar/${year}/${month}`);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('method', String(method));
  url.searchParams.set('school', String(school));
  if (calendarMethod) url.searchParams.set('calendarMethod', calendarMethod);

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new AlAdhanError(`Al-Adhan returned ${response.status} for ${year}-${month}`);
  }

  const body = (await response.json()) as { data?: AlAdhanDay[] };
  if (!Array.isArray(body.data)) throw new AlAdhanError('Al-Adhan returned no calendar data');
  return body.data;
};

/** Today's date in a masjid's own timezone, as `YYYY-MM-DD`. */
export const todayInTimeZone = (timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

/** A masjid's current wall clock as `HH:mm`. */
export const timeInTimeZone = (timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '00';
  return `${get('hour')}:${get('minute')}`;
};

/** Calendar arithmetic on `YYYY-MM-DD` strings, anchored at UTC noon to dodge DST. */
export const shiftIsoDate = (iso: string, days: number): string => {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const isoDateRange = (fromIso: string, toIso: string): string[] => {
  const days: string[] = [];
  let cursor = fromIso;
  // Guard rail rather than a real limit: the callers ask for weeks, not years.
  for (let i = 0; i < 400 && cursor <= toIso; i += 1) {
    days.push(cursor);
    cursor = shiftIsoDate(cursor, 1);
  }
  return days;
};

/** The `[year, month]` pairs a date range spans, so a window can cross a month end. */
export const monthsSpanning = (fromIso: string, toIso: string): [number, number][] => {
  const months: [number, number][] = [];
  const seen = new Set<string>();

  for (const day of isoDateRange(fromIso, toIso)) {
    const key = day.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);
    months.push([Number(day.slice(0, 4)), Number(day.slice(5, 7))]);
  }

  return months;
};
