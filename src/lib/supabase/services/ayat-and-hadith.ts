import { SupabaseTables, type AyatAndHadith } from '@/types';
import type { AyatAndHadithData } from '../../zod';
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

export async function getAyatAndHadith(userId?: string): Promise<AyatAndHadith[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
    ...(userId ? [{ column: 'visible', value: true }] : []),
  ];

  const items = await fetchByMultipleConditions<AyatAndHadith>(
    SupabaseTables.AyatAndHadith,
    conditions
  );

  return sortByDisplayOrderOrCreatedAt(items);
}

export async function upsertAyatAndHadith(ayatAndHadith: AyatAndHadithData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const ayatAndHadithToUpsert: Partial<AyatAndHadith> = {
    ...ayatAndHadith,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (ayatAndHadith.id) {
    return await updateRecord<AyatAndHadith>(
      SupabaseTables.AyatAndHadith,
      ayatAndHadith.id,
      ayatAndHadithToUpsert
    );
  } else {
    ayatAndHadithToUpsert.created_at = new Date().toISOString();
    ayatAndHadithToUpsert.visible = true;

    const allItems = await getAyatAndHadith();
    ayatAndHadithToUpsert.display_order = getMaxOrderValue(allItems) + 1;

    return await insertRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, ayatAndHadithToUpsert);
  }
}

export async function deleteAyatAndHadith(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<AyatAndHadith>(SupabaseTables.AyatAndHadith, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to delete this item');

  const updates: Partial<AyatAndHadith> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, id, updates);
  return true;
}

export async function toggleAyatAndHadithVisibility(
  id: string,
  visible: boolean
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const items = await fetchByColumn<AyatAndHadith>(SupabaseTables.AyatAndHadith, 'id', id);

  if (items.length === 0) throw new Error('Item not found');
  if (items[0].user_id !== user.id) throw new Error('Not authorized to update this item');

  const updates: Partial<AyatAndHadith> = { visible, updated_at: new Date().toISOString() };

  await updateRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, id, updates);
  return true;
}

export async function updateAyatAndHadithOrder(
  items: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const itemIds = items.map(item => item.id);
  const conditions = [{ column: 'id', value: itemIds[0] }];

  for (let i = 1; i < itemIds.length; i++) {
    conditions.push({ column: 'id', value: itemIds[i] });
  }

  const existingItems = await fetchByMultipleConditions<AyatAndHadith>(
    SupabaseTables.AyatAndHadith,
    conditions
  );

  const unauthorized = existingItems.some(item => item.user_id !== user.id);
  if (unauthorized) {
    throw new Error('Not authorized to update one or more items');
  }

  return await updateRecordsOrder(SupabaseTables.AyatAndHadith, items, user.id);
}
