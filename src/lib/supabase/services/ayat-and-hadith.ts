import { SupabaseTables, type AyatAndHadith } from '@/types';
import type { AyatAndHadithData } from '../../zod';
import {
  getCurrentUser,
  getMasjidMembership,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from '../helpers';
import { removeScreenAssignments } from './screens';

export async function getAyatAndHadith(masjidId?: string): Promise<AyatAndHadith[]> {
  const effectiveMasjidId = masjidId || (await getMasjidMembership()).masjid_id;

  const conditions = [
    { column: 'masjid_id', value: effectiveMasjidId },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<AyatAndHadith>(SupabaseTables.AyatAndHadith, conditions);
}

export async function upsertAyatAndHadith(ayatAndHadith: AyatAndHadithData & { id?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const { masjid_id } = await getMasjidMembership();

  const ayatAndHadithToUpsert: Partial<AyatAndHadith> = {
    ...ayatAndHadith,
    user_id: user.id,
    masjid_id,
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
  const updates: Partial<AyatAndHadith> = { archived: true, updated_at: new Date().toISOString() };

  await updateRecord<AyatAndHadith>(SupabaseTables.AyatAndHadith, id, updates);
  await removeScreenAssignments(id);
  return true;
}
