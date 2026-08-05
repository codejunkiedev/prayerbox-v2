import { formatTime, addTimeMinutes, minutesBetweenTimes } from './date-time';
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

/** AlAdhan returns times as `05:16 (PKT)`; everything downstream wants `05:16`. */
const clockPart = (time: string): string => (time.includes(' ') ? time.split(' ')[0] : time);

/**
 * Applies a single adjustment and returns the result still in `HH:mm`, for
 * callers that go on to do arithmetic with it (see the Ishraq/Chasht bases).
 */
export const applySingleAdjustmentRaw = (
  originalTime: string,
  adjustment: SingleAdjustment | undefined | null
): string => {
  const timeOnly = clockPart(originalTime);
  if (!adjustment) return timeOnly;

  if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    return addTimeMinutes(timeOnly, adjustment.offset);
  } else if (adjustment.type === 'manual' && adjustment.manual_time) {
    return adjustment.manual_time;
  }
  return timeOnly;
};

/**
 * Applies a single adjustment to a time string and returns a formatted result.
 * Exposed for times that aren't part of `prayer_adjustments` (e.g. sunrise/sunset).
 */
export const applySingleAdjustment = (
  originalTime: string,
  adjustment: SingleAdjustment | undefined | null
): string => formatTime(applySingleAdjustmentRaw(originalTime, adjustment));

/**
 * Minutes after sunrise at which Ishraq becomes due. The sun has to clear the
 * horizon by "the length of a spear" before the forbidden time at sunrise ends,
 * which the fatwa literature and printed timetables settle at 15–20 minutes;
 * 15 is the figure most of them print, and the offset control covers a masjid
 * that prefers 20.
 */
export const ISHRAQ_MINUTES_AFTER_SUNRISE = 15;

/**
 * Ishraq, as `HH:mm` before its own adjustment. Derived rather than fetched —
 * the AlAdhan API returns no Ishraq — and derived from the *adjusted* sunrise so
 * that a masjid correcting sunrise keeps the same gap on screen instead of one
 * that no longer matches the sunrise beside it.
 */
const getIshraqBase = (sunrise: string, sunriseAdjustment: SingleAdjustment | undefined | null) =>
  addTimeMinutes(
    applySingleAdjustmentRaw(sunrise, sunriseAdjustment),
    ISHRAQ_MINUTES_AFTER_SUNRISE
  );

/**
 * Chasht (Salat al-Duha), as `HH:mm` before its own adjustment. Its window runs
 * from Ishraq to Zawal, but the preferred time in the Hanafi school is once a
 * quarter of the day has passed — the midpoint between sunrise and Zawal — which
 * is what a timetable prints as "Chasht". Follows the adjusted sunrise for the
 * same reason Ishraq does; Zawal is Dhuhr as the API returns it, since a
 * masjid's Dhuhr adjustment is a jamaat preference rather than a solar one.
 */
const getChashtBase = (
  sunrise: string,
  dhuhr: string,
  sunriseAdjustment: SingleAdjustment | undefined | null
) => {
  const from = applySingleAdjustmentRaw(sunrise, sunriseAdjustment);
  // Clamped so a sunrise manually set past Zawal can't push Chasht backwards
  // into the night; it collapses onto sunrise instead.
  const halfway = Math.max(0, Math.round(minutesBetweenTimes(from, clockPart(dhuhr)) / 2));
  return addTimeMinutes(from, halfway);
};

/** Ishraq, formatted for display, with both the sunrise and Ishraq adjustments applied. */
export const getIshraqTime = (
  sunrise: string,
  sunriseAdjustment: SingleAdjustment | undefined | null,
  ishraqAdjustment: SingleAdjustment | undefined | null
): string =>
  formatTime(applySingleAdjustmentRaw(getIshraqBase(sunrise, sunriseAdjustment), ishraqAdjustment));

/** Chasht, formatted for display, with both the sunrise and Chasht adjustments applied. */
export const getChashtTime = (
  sunrise: string,
  dhuhr: string,
  sunriseAdjustment: SingleAdjustment | undefined | null,
  chashtAdjustment: SingleAdjustment | undefined | null
): string =>
  formatTime(
    applySingleAdjustmentRaw(getChashtBase(sunrise, dhuhr, sunriseAdjustment), chashtAdjustment)
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
): boolean => {
  const adjustment = getAdjustment(prayerName, category, prayerTimeSettings);
  return adjustment.type !== 'default';
};

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
): (keyof PrayerAdjustments)[] => {
  const jummaVariants: (keyof PrayerAdjustments)[] = ['jumma1', 'jumma2', 'jumma3'];
  const adjustedJummaVariants = jummaVariants.filter(variant => {
    // A jumma variant is "active" if any of its categories are adjusted
    return (
      isPrayerAdjusted(variant, prayerTimeSettings, 'starts') ||
      isPrayerAdjusted(variant, prayerTimeSettings, 'athan') ||
      isPrayerAdjusted(variant, prayerTimeSettings, 'iqamah')
    );
  });

  return adjustedJummaVariants.length > 0 ? adjustedJummaVariants : ['jumma1'];
};

/**
 * Gets the time before the next prayer (based on starts time)
 */
export const getTimeBeforeNextPrayer = (
  prayerTimes: ProcessedPrayerTiming[]
): { timeBefore: string; name: keyof PrayerAdjustments } | null => {
  const currentTime = new Date();
  const nextPrayerTime = prayerTimes.find(
    prayer => new Date(`${currentTime.toDateString()} ${prayer.starts}`) > currentTime
  );
  if (!nextPrayerTime) return null;
  const difference = differenceInMinutes(
    new Date(`${currentTime.toDateString()} ${nextPrayerTime.starts}`),
    currentTime
  );
  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;
  const formattedTime = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  return { timeBefore: formattedTime, name: nextPrayerTime.name };
};

/**
 * Gets the time before the next iqamah
 */
export const getTimeBeforeNextIqamah = (
  prayerTimes: ProcessedPrayerTiming[]
): { timeBefore: string; hours: number; minutes: number; name: keyof PrayerAdjustments } | null => {
  const currentTime = new Date();
  const nextIqamah = prayerTimes.find(
    prayer => new Date(`${currentTime.toDateString()} ${prayer.iqamah}`) > currentTime
  );
  if (!nextIqamah) return null;
  const difference = differenceInMinutes(
    new Date(`${currentTime.toDateString()} ${nextIqamah.iqamah}`),
    currentTime
  );
  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;
  const formattedTime = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  return { timeBefore: formattedTime, hours, minutes, name: nextIqamah.name };
};
