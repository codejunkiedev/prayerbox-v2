import type { AlAdhanPrayerTimes, PrayerTimes, ProcessedPrayerTiming } from '@/types';
import { getAdjustedPrayerTime, PRAYER_NAMES } from './prayer-time-adjustments';

/**
 * Gets the appropriate title for an AyatAndHadith item
 * @param type Type of content ('ayat' or 'hadith')
 * @returns Display title for the content type
 */
export function getAyatHadithTitle(type: 'ayat' | 'hadith'): string {
  return type === 'ayat' ? 'Quranic Verse' : 'Hadith';
}

/**
 * Processes prayer times with adjustments and returns formatted timing data
 * @param prayerTimes Raw prayer times from Al-Adhan API
 * @param prayerTimeSettings Prayer time settings with adjustments
 * @returns Array of processed prayer timings with names, times, and Arabic names
 */
export function getProcessedPrayerTimings(
  prayerTimes: AlAdhanPrayerTimes,
  prayerTimeSettings: PrayerTimes
): ProcessedPrayerTiming[] {
  const timings = prayerTimes.timings;
  const processedTimings: ProcessedPrayerTiming[] = [
    {
      name: 'fajr',
      time: getAdjustedPrayerTime('fajr', timings.Fajr, prayerTimeSettings),
      arabicName: PRAYER_NAMES.fajr,
    },
    {
      name: 'dhuhr',
      time: getAdjustedPrayerTime('dhuhr', timings.Dhuhr, prayerTimeSettings),
      arabicName: PRAYER_NAMES.dhuhr,
    },
    {
      name: 'asr',
      time: getAdjustedPrayerTime('asr', timings.Asr, prayerTimeSettings),
      arabicName: PRAYER_NAMES.asr,
    },
    {
      name: 'maghrib',
      time: getAdjustedPrayerTime('maghrib', timings.Maghrib, prayerTimeSettings),
      arabicName: PRAYER_NAMES.maghrib,
    },
    {
      name: 'isha',
      time: getAdjustedPrayerTime('isha', timings.Isha, prayerTimeSettings),
      arabicName: PRAYER_NAMES.isha,
    },
    {
      name: 'jumma1',
      time: getAdjustedPrayerTime('jumma1', timings.Dhuhr, prayerTimeSettings),
      arabicName: PRAYER_NAMES.jumma,
    },
    {
      name: 'jumma2',
      time: getAdjustedPrayerTime('jumma2', timings.Dhuhr, prayerTimeSettings),
      arabicName: PRAYER_NAMES.jumma,
    },
    {
      name: 'jumma3',
      time: getAdjustedPrayerTime('jumma3', timings.Dhuhr, prayerTimeSettings),
      arabicName: PRAYER_NAMES.jumma,
    },
  ];
  return processedTimings;
}
