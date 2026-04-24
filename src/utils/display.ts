import type { AlAdhanPrayerTimes, PrayerTimes, ProcessedPrayerTiming } from '@/types';
import { getAdjustedPrayerTime, PRAYER_NAMES } from './prayer-time-adjustments';

/**
 * Processes prayer times with adjustments and returns formatted timing data
 * @param prayerTimes Raw prayer times from Al-Adhan API
 * @param prayerTimeSettings Prayer time settings with adjustments
 * @returns Array of processed prayer timings with names, times, and Arabic names
 */
export function getProcessedPrayerTimings(
  prayerTimes: AlAdhanPrayerTimes,
  prayerTimeSettings: PrayerTimes | null
): ProcessedPrayerTiming[] {
  const timings = prayerTimes.timings;

  const process = (
    name: keyof import('@/types').PrayerAdjustments,
    rawTime: string,
    arabicName: string
  ): ProcessedPrayerTiming => ({
    name,
    starts: getAdjustedPrayerTime(name, rawTime, prayerTimeSettings, 'starts'),
    athan: getAdjustedPrayerTime(name, rawTime, prayerTimeSettings, 'athan'),
    iqamah: getAdjustedPrayerTime(name, rawTime, prayerTimeSettings, 'iqamah'),
    arabicName,
  });

  return [
    process('fajr', timings.Fajr, PRAYER_NAMES.fajr),
    process('dhuhr', timings.Dhuhr, PRAYER_NAMES.dhuhr),
    process('asr', timings.Asr, PRAYER_NAMES.asr),
    process('maghrib', timings.Maghrib, PRAYER_NAMES.maghrib),
    process('isha', timings.Isha, PRAYER_NAMES.isha),
    process('jumma1', timings.Dhuhr, PRAYER_NAMES.jumma),
    process('jumma2', timings.Dhuhr, PRAYER_NAMES.jumma),
    process('jumma3', timings.Dhuhr, PRAYER_NAMES.jumma),
  ];
}
