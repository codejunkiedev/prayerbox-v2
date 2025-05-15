import supabase from './index';
import type { MasjidProfileData } from '../zod';

interface MasjidProfile extends MasjidProfileData {
  id?: string;
  user_id?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Get masjid profile for current user
export async function getMasjidProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('masjid_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is no rows returned
    console.error('Error fetching masjid profile:', error);
    throw error;
  }

  return data as MasjidProfile | null;
}

// Create or update masjid profile
export async function upsertMasjidProfile(profileData: MasjidProfileData, logoFile: File | null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  let logoUrl = undefined;

  // Upload logo if provided
  if (logoFile) {
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('masjid_logos')
      .upload(fileName, logoFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('masjid_logos').getPublicUrl(fileName);

    logoUrl = publicUrl;
  }

  // First check if profile exists
  const { data: existingProfile } = await supabase
    .from('masjid_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const profileToUpsert: MasjidProfile = {
    ...profileData,
    user_id: user.id,
    ...(logoUrl && { logo_url: logoUrl }),
    updated_at: new Date().toISOString(),
  };

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from('masjid_profiles')
      .update(profileToUpsert)
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating masjid profile:', error);
      throw error;
    }

    return data;
  } else {
    // Create new profile
    profileToUpsert.created_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('masjid_profiles')
      .insert(profileToUpsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating masjid profile:', error);
      throw error;
    }

    return data;
  }
}
