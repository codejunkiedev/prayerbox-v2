import { formatTime, addTimeMinutes } from './date-time';
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

const DEFAULT_SINGLE_ADJUSTMENT: SingleAdjustment = { type: 'default' };

/**
 * Applies a single adjustment to a time string
 */
const applyAdjustment = (originalTime: string, adjustment: SingleAdjustment): string => {
  const timeOnly = originalTime.includes(' ') ? originalTime.split(' ')[0] : originalTime;

  if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    return addTimeMinutes(timeOnly, adjustment.offset);
  } else if (adjustment.type === 'manual' && adjustment.manual_time) {
    return adjustment.manual_time;
  }
  return timeOnly;
};

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
  return formatTime(applyAdjustment(originalTime, adjustment));
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
