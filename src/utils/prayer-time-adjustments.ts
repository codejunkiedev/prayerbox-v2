import { formatTime, parseWallClockTime } from './date-time';
import {
  activeJummaVariants,
  applyAdjustment,
  chashtBase,
  ishraqBase,
  isAdjusted,
} from './prayer-engine';
import { instantOnZonedDay, nowInTimeZone } from './timezone';
import type {
  AdjustmentCategory,
  PrayerAdjustments,
  PrayerTimes,
  ProcessedPrayerTiming,
  SingleAdjustment,
} from '@/types';
import type { AlAdhanPrayerTimes } from '@/types';
import { differenceInMinutes } from 'date-fns';

type PrayerName = keyof PrayerAdjustments;

/**
 * Checks if the given date is a Friday
 */
export const isFridayPrayer = (date: AlAdhanPrayerTimes['date'] | undefined): boolean => {
  return date?.gregorian?.weekday?.en === 'Friday';
};

export const PRAYER_NAMES = {
  fajr: 'فجر',
  dhuhr: 'ظهر',
  asr: 'عصر',
  maghrib: 'مغرب',
  isha: 'عشاء',
  jumma: 'جمعة',
  jumma1: 'جمعة ١',
  jumma2: 'جمعة ٢',
  jumma3: 'جمعة ٣',
} as const;

const DEFAULT_SINGLE_ADJUSTMENT: SingleAdjustment = { type: 'default' };

/**
 * Applies a single adjustment and returns the result still in `HH:mm`, for
 * callers that go on to do arithmetic with it (see the Ishraq/Chasht bases).
 */
export const applySingleAdjustmentRaw = (
  originalTime: string,
  adjustment: SingleAdjustment | undefined | null
): string => applyAdjustment(originalTime, adjustment);

/**
 * Applies a single adjustment to a time string and returns a formatted result.
 * Exposed for times that aren't part of `prayer_adjustments` (e.g. sunrise/sunset).
 */
export const applySingleAdjustment = (
  originalTime: string,
  adjustment: SingleAdjustment | undefined | null
): string => formatTime(applySingleAdjustmentRaw(originalTime, adjustment));

export { ISHRAQ_MINUTES_AFTER_SUNRISE } from './prayer-engine';

/** Ishraq, formatted for display, with both the sunrise and Ishraq adjustments applied. */
export const getIshraqTime = (
  sunrise: string,
  sunriseAdjustment: SingleAdjustment | undefined | null,
  ishraqAdjustment: SingleAdjustment | undefined | null
): string =>
  formatTime(applySingleAdjustmentRaw(ishraqBase(sunrise, sunriseAdjustment), ishraqAdjustment));

/** Chasht, formatted for display, with both the sunrise and Chasht adjustments applied. */
export const getChashtTime = (
  sunrise: string,
  dhuhr: string,
  sunriseAdjustment: SingleAdjustment | undefined | null,
  chashtAdjustment: SingleAdjustment | undefined | null
): string =>
  formatTime(
    applySingleAdjustmentRaw(chashtBase(sunrise, dhuhr, sunriseAdjustment), chashtAdjustment)
  );

/**
 * Gets the single adjustment object for a prayer + category
 */
const getAdjustment = (
  prayerName: PrayerName,
  category: AdjustmentCategory,
  prayerTimeSettings: PrayerTimes | null
): SingleAdjustment => {
  return (
    prayerTimeSettings?.prayer_adjustments?.[prayerName]?.[category] ?? DEFAULT_SINGLE_ADJUSTMENT
  );
};

/**
 * Adjusts a prayer time based on settings for a specific category
 */
export const getAdjustedPrayerTime = (
  prayerName: PrayerName,
  originalTime: string,
  prayerTimeSettings: PrayerTimes | null,
  category: AdjustmentCategory = 'starts'
): string => {
  const adjustment = getAdjustment(prayerName, category, prayerTimeSettings);
  return formatTime(applySingleAdjustmentRaw(originalTime, adjustment));
};

/**
 * Checks if a prayer time is adjusted for a specific category
 */
export const isPrayerAdjusted = (
  prayerName: PrayerName,
  prayerTimeSettings: PrayerTimes | null,
  category: AdjustmentCategory = 'starts'
): boolean => isAdjusted(getAdjustment(prayerName, category, prayerTimeSettings));

/**
 * Gets the adjustment label for a prayer time
 */
export const getAdjustmentLabel = (
  prayerName: PrayerName,
  prayerTimeSettings: PrayerTimes | null,
  includeParentheses: boolean = false,
  category: AdjustmentCategory = 'starts'
): string => {
  const adjustment = getAdjustment(prayerName, category, prayerTimeSettings);

  if (adjustment.type === 'default') return '';

  let label = '';

  if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    const offset = adjustment.offset;
    const offsetDirection = offset > 0 ? '+' : offset < 0 ? '-' : '';
    const offsetValue = Math.abs(offset);
    const hours = Math.floor(offsetValue / 60);
    const minutes = offsetValue % 60;

    if (includeParentheses) {
      label = `(${offsetDirection}${hours > 0 ? `${hours.toString().padStart(2, '0')}h ` : ''}${minutes.toString().padStart(2, '0')}m)`;
    } else {
      label = `${offsetDirection}${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    }
  } else if (adjustment.type === 'manual') {
    label = includeParentheses ? '(manual)' : 'manual';
  }

  return label;
};

/**
 * Gets filtered Jumma prayer names based on adjustments
 */
export const getFilteredJummaPrayerNames = (
  prayerTimeSettings: PrayerTimes | null
): (keyof PrayerAdjustments)[] => activeJummaVariants(prayerTimeSettings?.prayer_adjustments);

/**
 * Minutes from now until the next prayer in `category`, in the masjid's zone.
 *
 * The prayer strings are the masjid's wall clock, so anchoring them to the
 * viewing device's calendar day and comparing against its clock is only correct
 * for a screen standing inside the masjid. Relies on `prayerTimes` being in
 * chronological order, as the callers build it.
 */
const minutesUntilNext = (
  prayerTimes: ProcessedPrayerTiming[],
  category: 'starts' | 'iqamah',
  timeZone: string | null | undefined
): { minutes: number; name: PrayerName } | null => {
  const now = new Date();
  const today = nowInTimeZone(timeZone);

  for (const prayer of prayerTimes) {
    const parsed = parseWallClockTime(prayer[category]);
    if (!parsed) continue;

    const at = instantOnZonedDay(today, parsed.hours, parsed.minutes, timeZone);
    if (at > now) return { minutes: differenceInMinutes(at, now), name: prayer.name };
  }

  return null;
};

const formatCountdown = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
};

/**
 * Gets the time before the next prayer (based on starts time)
 */
export const getTimeBeforeNextPrayer = (
  prayerTimes: ProcessedPrayerTiming[],
  timeZone: string | null | undefined
): { timeBefore: string; name: PrayerName } | null => {
  const next = minutesUntilNext(prayerTimes, 'starts', timeZone);
  if (!next) return null;
  return { timeBefore: formatCountdown(next.minutes), name: next.name };
};

/**
 * Gets the time before the next iqamah
 */
export const getTimeBeforeNextIqamah = (
  prayerTimes: ProcessedPrayerTiming[],
  timeZone: string | null | undefined
): { timeBefore: string; hours: number; minutes: number; name: PrayerName } | null => {
  const next = minutesUntilNext(prayerTimes, 'iqamah', timeZone);
  if (!next) return null;
  return {
    timeBefore: formatCountdown(next.minutes),
    hours: Math.floor(next.minutes / 60),
    minutes: next.minutes % 60,
    name: next.name,
  };
};
