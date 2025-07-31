import type {
  AlAdhanPrayerTimes,
  ModuleId,
  PrayerTimes,
  ProcessedPrayerTiming,
  Settings,
} from '@/types';
import type { ReactNode } from 'react';
import { getAdjustedPrayerTime, isFridayPrayer, PRAYER_NAMES } from './prayer-time-adjustments';

/**
 * Creates a module order map from user settings or defaults
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
 */
export function sortByDisplayOrder<T extends { display_order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
}

/**
 * Group and order content for display
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
 */
export function getAyatHadithTitle(type: 'ayat' | 'hadith'): string {
  return type === 'ayat' ? 'Quranic Verse' : 'Hadith';
}

export function getProcessedPrayerTimings(
  prayerTimes: AlAdhanPrayerTimes,
  prayerTimeSettings: PrayerTimes
): ProcessedPrayerTiming[] {
  const timings = prayerTimes.timings;
  const isJumma = isFridayPrayer(prayerTimes.date);

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
  ];

  // If it's Friday, add Jumma prayer after Dhuhr
  if (isJumma && prayerTimeSettings.prayer_adjustments?.jumma1) {
    const jummaTime = getAdjustedPrayerTime('jumma1', timings.Dhuhr, prayerTimeSettings);

    // Insert Jumma after Dhuhr (at index 2)
    processedTimings.splice(2, 0, {
      name: 'jumma1',
      time: jummaTime,
      arabicName: PRAYER_NAMES.jumma,
    });
  }

  return processedTimings;
}
