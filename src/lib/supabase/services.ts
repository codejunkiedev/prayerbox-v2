import { SupabaseBuckets, SupabaseTables, type MasjidProfile } from '@/types';
import type { MasjidProfileData } from '../zod';
import { getCurrentUser, uploadFile, fetchByColumn, updateRecord, insertRecord } from './helpers';
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

  if (!user) {
    throw new Error('User not authenticated');
  }

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
