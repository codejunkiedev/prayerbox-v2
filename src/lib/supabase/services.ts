import { SupabaseBuckets, SupabaseTables, type AyatAndHadith, type MasjidProfile } from '@/types';
import type { AyatAndHadithData, MasjidProfileData } from '../zod';
import {
  getCurrentUser,
  uploadFile,
  fetchByColumn,
  updateRecord,
  insertRecord,
  fetchByMultipleConditions,
} from './helpers';
import { generateMasjidCode } from '@/utils/general';

// Get masjid profile for current user
export async function getMasjidProfile(): Promise<MasjidProfile | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const profiles = await fetchByColumn<MasjidProfile>(
    SupabaseTables.MasjidProfiles,
    'user_id',
    user.id
  );
  return profiles.length > 0 ? profiles[0] : null;
}

// Create or update masjid profile
export async function upsertMasjidProfile(profileData: MasjidProfileData, logoFile: File | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  let logoUrl = undefined;

  // Upload logo if provided
  if (logoFile) {
    logoUrl = await uploadFile(SupabaseBuckets.MasjidLogos, logoFile, `${user.id}-${Date.now()}`);
  }

  // Check if profile exists
  const profiles = await fetchByColumn<MasjidProfile>(
    SupabaseTables.MasjidProfiles,
    'user_id',
    user.id
  );
  const existingProfile = profiles.length > 0 ? profiles[0] : null;

  const profileToUpsert: Partial<MasjidProfile> = {
    ...profileData,
    user_id: user.id,
    ...(logoUrl && { logo_url: logoUrl }),
    updated_at: new Date().toISOString(),
    address: profileData.address,
    name: profileData.name,
    code: existingProfile?.code || generateMasjidCode(),
  };

  if (existingProfile) {
    return await updateRecord<MasjidProfile>(
      SupabaseTables.MasjidProfiles,
      existingProfile.id as string,
      profileToUpsert
    );
  } else {
    profileToUpsert.created_at = new Date().toISOString();
    return await insertRecord<MasjidProfile>(SupabaseTables.MasjidProfiles, profileToUpsert);
  }
}

export async function getAyatAndHadith(): Promise<AyatAndHadith[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const conditions = [
    { column: 'user_id', value: user.id },
    { column: 'archived', value: false, isNull: true },
  ];

  return await fetchByMultipleConditions<AyatAndHadith>(SupabaseTables.AyatAndHadith, conditions);
}

export async function upsertAyatAndHadith(ayatAndHadith: AyatAndHadithData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const ayatAndHadiths = await fetchByColumn<AyatAndHadith>(
    SupabaseTables.AyatAndHadith,
    'user_id',
    user.id
  );

  const existingAyatAndHadith = ayatAndHadiths.length > 0 ? ayatAndHadiths[0] : null;

  const ayatAndHadithToUpsert: Partial<AyatAndHadith> = {
    ...ayatAndHadith,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    archived: false,
  };

  if (existingAyatAndHadith) {
    return await updateRecord<AyatAndHadith>(
      SupabaseTables.AyatAndHadith,
      existingAyatAndHadith.id as string,
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
  return true;
}
