import { SupabaseTables, type PrayerTimes } from '@/types';
import type { PrayerAdjustmentsFormData } from '../../zod';
import {
  getCurrentUser,
  getMasjidMembership,
  fetchByColumn,
  updateRecord,
  insertRecord,
} from '../helpers';

/**
 * Gets prayer adjustments for a masjid
 * @param masjidId Optional masjid ID, if not provided uses current user's masjid
 * @returns Promise resolving to prayer adjustments or null if not found
 */
export async function getPrayerAdjustments(masjidId?: string): Promise<PrayerTimes | null> {
  const effectiveMasjidId = masjidId || (await getMasjidMembership()).masjid_id;

  const prayerTimes = await fetchByColumn<PrayerTimes>(
    SupabaseTables.PrayerTimes,
    'masjid_id',
    effectiveMasjidId
  );
  return prayerTimes.length > 0 ? prayerTimes[0] : null;
}

/**
 * Saves or updates prayer adjustments for the current user's masjid
 * @param settings The prayer adjustments data to save
 * @returns Promise resolving to the saved prayer adjustments
 */
export async function savePrayerAdjustments(
  settings: PrayerAdjustmentsFormData
): Promise<PrayerTimes> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const { masjid_id } = await getMasjidMembership();

  const existing = await getPrayerAdjustments(masjid_id);

  const settingsToUpsert: Partial<PrayerTimes> = {
    ...settings,
    user_id: user.id,
    masjid_id,
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
