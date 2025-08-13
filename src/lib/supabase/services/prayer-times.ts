import { SupabaseTables, type PrayerTimes } from '@/types';
import type { PrayerTimingsData } from '../../zod';
import { getCurrentUser, fetchByColumn, updateRecord, insertRecord } from '../helpers';

/**
 * Gets prayer time settings for a user
 * @param userId Optional user ID, if not provided uses current authenticated user
 * @returns Promise resolving to prayer time settings or null if not found
 */
export async function getPrayerTimeSettings(userId?: string): Promise<PrayerTimes | null> {
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
 * Saves or updates prayer time settings for the current user
 * @param settings The prayer time settings data to save
 * @returns Promise resolving to the saved prayer time settings
 */
export async function savePrayerTimeSettings(settings: PrayerTimingsData): Promise<PrayerTimes> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const existingSettings = await getPrayerTimeSettings();

  const settingsToUpsert: Partial<PrayerTimes> = {
    ...settings,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (existingSettings) {
    return await updateRecord<PrayerTimes>(
      SupabaseTables.PrayerTimes,
      existingSettings.id as string,
      settingsToUpsert
    );
  } else {
    settingsToUpsert.created_at = new Date().toISOString();
    return await insertRecord<PrayerTimes>(SupabaseTables.PrayerTimes, settingsToUpsert);
  }
}
