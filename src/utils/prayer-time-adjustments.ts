import { formatTime, addTimeMinutes } from './date-time';
import type { PrayerAdjustments, PrayerTimes } from '@/types';

type PrayerName = keyof PrayerAdjustments;

/**
 * Adjusts a prayer time based on settings
 * @param prayerName Name of the prayer
 * @param originalTime Original time in HH:mm format or formatted time
 * @param prayerTimeSettings Prayer time settings
 * @returns Adjusted time string
 */
export const getAdjustedPrayerTime = (
  prayerName: PrayerName,
  originalTime: string,
  prayerTimeSettings: PrayerTimes | null
): string => {
  if (!prayerTimeSettings?.prayer_adjustments) return originalTime;

  const timeOnly = originalTime.includes(' ') ? originalTime.split(' ')[0] : originalTime;
  const adjustment = prayerTimeSettings.prayer_adjustments[prayerName];

  if (!adjustment) return originalTime;

  if (adjustment.type === 'default') {
    return originalTime;
  } else if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    return formatTime(addTimeMinutes(timeOnly, adjustment.offset));
  } else if (adjustment.type === 'manual' && adjustment.manual_time) {
    return formatTime(adjustment.manual_time);
  }

  return originalTime;
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
 * @returns Adjustment label string
 */
export const getAdjustmentLabel = (
  prayerName: PrayerName,
  prayerTimeSettings: PrayerTimes | null
): string => {
  if (!prayerTimeSettings?.prayer_adjustments) return '';
  const adjustment = prayerTimeSettings.prayer_adjustments[prayerName];

  if (!adjustment || adjustment.type === 'default') return '';

  if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    const offset = adjustment.offset;
    const offsetDirection = offset > 0 ? '+' : offset < 0 ? '-' : '';
    const offsetValue = Math.abs(offset);
    const hours = Math.floor(offsetValue / 60);
    const minutes = offsetValue % 60;
    return `${offsetDirection}${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  } else if (adjustment.type === 'manual') {
    return '(manual)';
  }

  return '';
};
