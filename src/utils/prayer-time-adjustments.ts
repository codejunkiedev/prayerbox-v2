import { formatTime, addTimeMinutes } from './date-time';
import type { PrayerAdjustments, PrayerTimes } from '@/types';
import type { AlAdhanPrayerTimes } from '@/types';

type PrayerName = keyof PrayerAdjustments;

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

/**
 * Adjusts a prayer time based on settings
 * @param prayerName Name of the prayer
 * @param originalTime Original time in HH:mm format or formatted time
 * @param prayerTimeSettings Prayer time settings
 * @returns Adjusted time string formatted for display (e.g., "12:30 PM")
 */
export const getAdjustedPrayerTime = (
  prayerName: PrayerName,
  originalTime: string,
  prayerTimeSettings: PrayerTimes | null
): string => {
  if (!prayerTimeSettings?.prayer_adjustments) {
    return formatTime(originalTime.includes(' ') ? originalTime.split(' ')[0] : originalTime);
  }

  const timeOnly = originalTime.includes(' ') ? originalTime.split(' ')[0] : originalTime;
  const adjustment = prayerTimeSettings.prayer_adjustments[prayerName];

  if (!adjustment) {
    return formatTime(timeOnly);
  }

  let adjustedTime: string;

  if (adjustment.type === 'default') {
    adjustedTime = timeOnly;
  } else if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    adjustedTime = addTimeMinutes(timeOnly, adjustment.offset);
  } else if (adjustment.type === 'manual' && adjustment.manual_time) {
    adjustedTime = adjustment.manual_time;
  } else {
    adjustedTime = timeOnly;
  }

  return formatTime(adjustedTime);
};

/**
 * Checks if a prayer time is adjusted
 * @param prayerName Name of the prayer
 * @param prayerTimeSettings Prayer time settings
 * @returns True if the prayer time is adjusted
 */
export const isPrayerAdjusted = (
  prayerName: PrayerName,
  prayerTimeSettings: PrayerTimes | null
): boolean => {
  if (!prayerTimeSettings?.prayer_adjustments) return false;
  const adjustment = prayerTimeSettings.prayer_adjustments[prayerName];
  return !!adjustment && adjustment.type !== 'default';
};

/**
 * Gets the adjustment label for a prayer time
 * @param prayerName Name of the prayer
 * @param prayerTimeSettings Prayer time settings
 * @param includeParentheses Whether to wrap the label in parentheses
 * @returns Adjustment label string
 */
export const getAdjustmentLabel = (
  prayerName: PrayerName,
  prayerTimeSettings: PrayerTimes | null,
  includeParentheses: boolean = false
): string => {
  if (!prayerTimeSettings?.prayer_adjustments) return '';
  const adjustment = prayerTimeSettings.prayer_adjustments[prayerName];

  if (!adjustment || adjustment.type === 'default') return '';

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
