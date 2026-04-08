import { SupabaseTables, type Event } from '@/types';
import type { EventData } from '../../zod';
import {
  getCurrentUser,
  getMasjidMembership,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from '../helpers';
import { removeScreenAssignments } from './screens';

export async function getEvents(masjidId?: string): Promise<Event[]> {
  const effectiveMasjidId = masjidId || (await getMasjidMembership()).masjid_id;

  const conditions = [
    { column: 'masjid_id', value: effectiveMasjidId },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<Event>(SupabaseTables.Events, conditions);
}

export async function upsertEvent(event: EventData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const { masjid_id } = await getMasjidMembership();

  const eventToUpsert: Partial<Event> = {
    ...event,
    user_id: user.id,
    masjid_id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (event.id) {
    return await updateRecord<Event>(SupabaseTables.Events, event.id, eventToUpsert);
  } else {
    eventToUpsert.created_at = new Date().toISOString();

    return await insertRecord<Event>(SupabaseTables.Events, eventToUpsert);
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  const updates: Partial<Event> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<Event>(SupabaseTables.Events, id, updates);
  await removeScreenAssignments(id);
  return true;
}
