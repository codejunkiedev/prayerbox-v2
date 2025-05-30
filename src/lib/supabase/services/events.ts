import { SupabaseTables, type Event } from '@/types';
import type { EventData } from '../../zod';
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

export async function getEvents(userId?: string): Promise<Event[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
    ...(userId ? [{ column: 'visible', value: true }] : []),
  ];

  const items = await fetchByMultipleConditions<Event>(SupabaseTables.Events, conditions);

  return sortByDisplayOrderOrCreatedAt(items);
}

export async function upsertEvent(event: EventData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const eventToUpsert: Partial<Event> = {
    ...event,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (event.id) {
    return await updateRecord<Event>(SupabaseTables.Events, event.id, eventToUpsert);
  } else {
    eventToUpsert.created_at = new Date().toISOString();
    eventToUpsert.visible = true;

    const allItems = await getEvents();
    eventToUpsert.display_order = getMaxOrderValue(allItems) + 1;

    return await insertRecord<Event>(SupabaseTables.Events, eventToUpsert);
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Event>(SupabaseTables.Events, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<Event> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<Event>(SupabaseTables.Events, id, updates);
  return true;
}

export async function toggleEventVisibility(id: string, visible: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<Event>(SupabaseTables.Events, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<Event> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<Event>(SupabaseTables.Events, id, updates);
  return true;
}

export async function updateEventsOrder(
  items: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const itemIds = items.map(item => item.id);
  const conditions = [{ column: 'id', value: itemIds[0] }];

  for (let i = 1; i < itemIds.length; i++) {
    conditions.push({ column: 'id', value: itemIds[i] });
  }

  const existingItems = await fetchByMultipleConditions<Event>(SupabaseTables.Events, conditions);

  const unauthorized = existingItems.some(item => item.user_id !== user.id);
  if (unauthorized) {
    throw new Error('Not authorized to update one or more items');
  }

  return await updateRecordsOrder(SupabaseTables.Events, items, user.id);
}
