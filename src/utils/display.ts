import type {
  AlAdhanPrayerTimes,
  ModuleId,
  PrayerTimes,
  ProcessedPrayerTiming,
  Settings,
} from '@/types';
import type { ReactNode } from 'react';
import { getAdjustedPrayerTime, PRAYER_NAMES } from './prayer-time-adjustments';

/**
 * Creates a module order map from user settings or defaults
 * @param userSettings User settings containing module configuration
 * @returns Object mapping module IDs to their display order
 */
export function getModuleOrder(userSettings: Settings | null): Record<ModuleId, number> {
  const defaultOrder: Record<ModuleId, number> = {
    announcements: 1,
    'ayat-and-hadith': 2,
    events: 3,
    posts: 4,
  };

  // If no settings or modules, return default order
  if (!userSettings?.modules?.length) {
    return { ...defaultOrder };
  }

  // Create order map from user settings
  const moduleOrder = { ...defaultOrder };
  userSettings.modules.forEach(module => {
    moduleOrder[module.id] = module.display_order;
  });

  return moduleOrder;
}

/**
 * Sort items by their display_order property
 * @param items Array of items with optional display_order property
 * @returns Sorted array of items by display_order (ascending)
 */
export function sortByDisplayOrder<T extends { display_order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
}

/**
 * Group and order content for display based on module order
 * @param moduleOrder Module order mapping
 * @param announcementSlides Array of announcement slide components
 * @param ayatHadithSlides Array of ayat/hadith slide components
 * @param eventSlides Array of event slide components
 * @param postSlides Array of post slide components
 * @returns Ordered array of content groups with non-empty content
 */
export function createOrderedContentGroups(
  moduleOrder: Record<ModuleId, number>,
  announcementSlides: ReactNode[],
  ayatHadithSlides: ReactNode[],
  eventSlides: ReactNode[],
  postSlides: ReactNode[]
) {
  const contentGroups = [
    {
      moduleId: 'announcements',
      order: moduleOrder['announcements'],
      content: announcementSlides,
    },
    {
      moduleId: 'ayat-and-hadith',
      order: moduleOrder['ayat-and-hadith'],
      content: ayatHadithSlides,
    },
    {
      moduleId: 'events',
      order: moduleOrder['events'],
      content: eventSlides,
    },
    {
      moduleId: 'posts',
      order: moduleOrder['posts'],
      content: postSlides,
    },
  ];

  // Sort content groups by their module order
  contentGroups.sort((a, b) => a.order - b.order);

  // Filter out empty content groups
  return contentGroups.filter(group => group.content.length > 0);
}

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
