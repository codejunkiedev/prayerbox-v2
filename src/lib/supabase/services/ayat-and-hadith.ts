import { SupabaseTables, type AyatAndHadith } from '@/types';
import type { AyatAndHadithData } from '../../zod';
import {
  getCurrentUser,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from '../helpers';
import { removeScreenAssignments } from './screens';

export async function getAyatAndHadith(userId?: string): Promise<AyatAndHadith[]> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<AyatAndHadith>(SupabaseTables.AyatAndHadith, conditions);
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
  await removeScreenAssignments(id);
  return true;
}
