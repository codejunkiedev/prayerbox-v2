import { SupabaseTables, type Announcement } from '@/types';
import type { AnnouncementData } from '../../zod';
import {
  getCurrentUser,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
  updateRecordsOrder,
  sortByDisplayOrderOrCreatedAt,
  getMaxOrderValue,
} from '../helpers';

/**
 * Retrieves announcements for a user, optionally filtered for display
 * @param userId Optional user ID, if not provided uses current authenticated user
 * @returns Promise resolving to array of announcements sorted by display order
 */
export async function getAnnouncements(userId?: string): Promise<Announcement[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
    ...(userId ? [{ column: 'visible', value: true }] : []),
  ];

  const items = await fetchByMultipleConditions<Announcement>(
    SupabaseTables.Announcements,
    conditions
  );

  return sortByDisplayOrderOrCreatedAt(items);
}

/**
 * Creates a new announcement or updates an existing one
 * @param announcement Announcement data with optional ID for updates
 * @returns Promise resolving to the created/updated announcement
 */
export async function upsertAnnouncement(announcement: AnnouncementData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const announcementToUpsert: Partial<Announcement> = {
    ...announcement,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (announcement.id) {
    return await updateRecord<Announcement>(
      SupabaseTables.Announcements,
      announcement.id,
      announcementToUpsert
    );
  } else {
    announcementToUpsert.created_at = new Date().toISOString();
    announcementToUpsert.visible = true;

    const allItems = await getAnnouncements();
    announcementToUpsert.display_order = getMaxOrderValue(allItems) + 1;

    return await insertRecord<Announcement>(SupabaseTables.Announcements, announcementToUpsert);
  }
}

/**
 * Soft deletes an announcement by marking it as archived
 * @param id The announcement ID to delete
 * @returns Promise resolving to success boolean
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Announcement>(SupabaseTables.Announcements, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<Announcement> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<Announcement>(SupabaseTables.Announcements, id, updates);
  return true;
}

/**
 * Toggles the visibility of an announcement
 * @param id The announcement ID to update
 * @param visible Whether the announcement should be visible
 * @returns Promise resolving to success boolean
 */
export async function toggleAnnouncementVisibility(id: string, visible: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Announcement>(SupabaseTables.Announcements, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<Announcement> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<Announcement>(SupabaseTables.Announcements, id, updates);
  return true;
}

/**
 * Updates the display order of multiple announcements
 * @param items Array of announcement items with ID and new display order
 * @returns Promise resolving to success boolean
 */
export async function updateAnnouncementsOrder(
  items: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const itemIds = items.map(item => item.id);
  const conditions = [{ column: 'id', value: itemIds[0] }];

  for (let i = 1; i < itemIds.length; i++) {
    conditions.push({ column: 'id', value: itemIds[i] });
  }

  const existingItems = await fetchByMultipleConditions<Announcement>(
    SupabaseTables.Announcements,
    conditions
  );

  const unauthorized = existingItems.some(item => item.user_id !== user.id);
  if (unauthorized) {
    throw new Error('Not authorized to update one or more items');
  }

  return await updateRecordsOrder(SupabaseTables.Announcements, items, user.id);
}
