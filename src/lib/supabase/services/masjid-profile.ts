import { SupabaseBuckets, SupabaseTables, type MasjidProfile } from '@/types';
import type { MasjidProfileData } from '../../zod';
import { getCurrentUser, uploadFile, fetchByColumn, updateRecord, insertRecord } from '../helpers';
import { generateMasjidCode } from '@/utils';

/**
 * Gets the masjid profile for the current authenticated user
 * @returns Promise resolving to masjid profile or null if not found
 */
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

/**
 * Gets a masjid profile by its unique code
 * @param code The masjid code to search for
 * @returns Promise resolving to masjid profile or null if not found
 */
export async function getMasjidByCode(code: string): Promise<MasjidProfile | null> {
  const profiles = await fetchByColumn<MasjidProfile>(SupabaseTables.MasjidProfiles, 'code', code);
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Creates or updates a masjid profile with optional logo upload
 * @param profileData The profile data to save
 * @param logoFile Optional logo file to upload
 * @param shouldRemoveLogo Whether to remove the existing logo
 * @returns Promise resolving to the created/updated profile
 */
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
