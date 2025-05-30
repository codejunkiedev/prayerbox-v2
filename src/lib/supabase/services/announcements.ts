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
