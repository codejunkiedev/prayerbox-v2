import { SupabaseTables, type PrayerTimes } from '@/types';
import type { PrayerAdjustmentsFormData } from '../../zod';
import { getCurrentUser, fetchByColumn, updateRecord, insertRecord } from '../helpers';

/**
 * Gets prayer adjustments for a user
 * @param userId Optional user ID, if not provided uses current authenticated user
 * @returns Promise resolving to prayer adjustments or null if not found
 */
export async function getPrayerAdjustments(userId?: string): Promise<PrayerTimes | null> {
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const prayerTimes = await fetchByColumn<PrayerTimes>(
    SupabaseTables.PrayerTimes,
    'user_id',
    user.id
  );
  return prayerTimes.length > 0 ? prayerTimes[0] : null;
}

/**
 * Saves or updates prayer adjustments for the current user
 * @param settings The prayer adjustments data to save
 * @returns Promise resolving to the saved prayer adjustments
 */
export async function savePrayerAdjustments(
  settings: PrayerAdjustmentsFormData
): Promise<PrayerTimes> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const existing = await getPrayerAdjustments();

  const settingsToUpsert: Partial<PrayerTimes> = {
    ...settings,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    return await updateRecord<PrayerTimes>(
      SupabaseTables.PrayerTimes,
      existing.id as string,
      settingsToUpsert
    );
  } else {
    settingsToUpsert.created_at = new Date().toISOString();
    return await insertRecord<PrayerTimes>(SupabaseTables.PrayerTimes, settingsToUpsert);
  }
}
