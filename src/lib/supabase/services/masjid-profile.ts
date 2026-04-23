import { SupabaseBuckets, SupabaseTables, type MasjidMember, type MasjidProfile } from '@/types';
import type { MasjidProfileData } from '../../zod';
import {
  getCurrentUser,
  getMasjidMembership,
  uploadFile,
  fetchByColumn,
  fetchById,
  updateRecord,
  insertRecord,
} from '../helpers';
import { useAuthStore } from '@/store';

/**
 * Gets the masjid profile for the current authenticated user
 * @returns Promise resolving to masjid profile or null if not found
 */
export async function getMasjidProfile(): Promise<MasjidProfile | null> {
  try {
    const { masjid_id } = await getMasjidMembership();
    return await fetchById<MasjidProfile>(SupabaseTables.MasjidProfiles, masjid_id);
  } catch {
    // Fallback for users who haven't been added to masjid_members yet (e.g. during registration)
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const profiles = await fetchByColumn<MasjidProfile>(
      SupabaseTables.MasjidProfiles,
      'user_id',
      user.id
    );
    return profiles.length > 0 ? profiles[0] : null;
  }
}

/**
 * Gets a masjid profile by masjid ID
 * @param masjidId The masjid ID to search for
 * @returns Promise resolving to masjid profile or null if not found
 */
export async function getMasjidProfileByMasjidId(masjidId: string): Promise<MasjidProfile | null> {
  return await fetchById<MasjidProfile>(SupabaseTables.MasjidProfiles, masjidId);
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
    area: profileData.area,
  };

  if (logoUrl) profileToUpsert.logo_url = logoUrl;
  else if (shouldRemoveLogo) profileToUpsert.logo_url = '';

  if (existingProfile) {
    await ensureAdminMembership(existingProfile.id as string, user.id, profileData.name);
    return await updateRecord<MasjidProfile>(
      SupabaseTables.MasjidProfiles,
      existingProfile.id as string,
      profileToUpsert
    );
  } else {
    profileToUpsert.created_at = new Date().toISOString();
    const created = await insertRecord<MasjidProfile>(
      SupabaseTables.MasjidProfiles,
      profileToUpsert
    );

    await ensureAdminMembership(created.id, user.id, profileData.name);

    return created;
  }
}

async function ensureAdminMembership(
  masjidId: string,
  userId: string,
  name: string
): Promise<void> {
  try {
    const { masjid_id } = await getMasjidMembership();
    if (masjid_id === masjidId) return;
  } catch {
    // no membership yet — fall through to bootstrap
  }

  await insertRecord<MasjidMember>(SupabaseTables.MasjidMembers, {
    masjid_id: masjidId,
    user_id: userId,
    role: 'admin',
    name,
  });
  useAuthStore.getState().setAuth(masjidId, 'admin');
}
