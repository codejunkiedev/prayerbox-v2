import { SupabaseTables, type Announcement } from '@/types';
import type { AnnouncementData } from '../../zod';
import {
  getCurrentUser,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from '../helpers';
import { removeScreenAssignments } from './screens';

export async function getAnnouncements(userId?: string): Promise<Announcement[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<Announcement>(SupabaseTables.Announcements, conditions);
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
  await removeScreenAssignments(id);
  return true;
}
