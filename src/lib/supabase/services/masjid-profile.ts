import { SupabaseBuckets, SupabaseTables, type MasjidProfile } from '@/types';
import type { MasjidProfileData } from '../../zod';
import { getCurrentUser, uploadFile, fetchByColumn, updateRecord, insertRecord } from '../helpers';
import { generateMasjidCode } from '@/utils';

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

export async function upsertMasjidProfile(
  profileData: MasjidProfileData,
  logoFile: File | null,
  shouldRemoveLogo: boolean = false
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  let logoUrl = undefined;

  if (logoFile) {
    logoUrl = await uploadFile(SupabaseBuckets.MasjidLogos, logoFile, `${user.id}-${Date.now()}`);
  }

  const profiles = await fetchByColumn<MasjidProfile>(
    SupabaseTables.MasjidProfiles,
    'user_id',
    user.id
  );
  const existingProfile = profiles.length > 0 ? profiles[0] : null;

  const profileToUpsert: Partial<MasjidProfile> = {
    ...profileData,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    latitude: profileData.latitude || null,
    longitude: profileData.longitude || null,
    name: profileData.name,
    code: existingProfile?.code || generateMasjidCode(),
  };

  if (logoUrl) profileToUpsert.logo_url = logoUrl;
  else if (shouldRemoveLogo) profileToUpsert.logo_url = '';

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
