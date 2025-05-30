import type { ModuleId, Settings } from '@/types';
import type { ReactNode } from 'react';

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
