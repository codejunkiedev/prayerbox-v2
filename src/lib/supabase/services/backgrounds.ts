import { SupabaseBuckets, type BackgroundImage } from '@/types';
import supabase from '../index';
import { getMasjidMembership, uploadFile } from '../helpers';
import { captureSupabaseError } from '@/lib/sentry';

/** Extensions we surface in the uploaded-backgrounds grid. */
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Storage prefix that scopes a masjid's uploaded backgrounds to its own folder.
 * RLS keeps the bucket writable by any authenticated user; this path prefix is
 * what isolates one masjid's uploads from another's at the application layer.
 */
function masjidFolder(masjidId: string): string {
  return masjidId;
}

/**
 * Uploads a background image to the per-masjid `user-backgrounds` folder and
 * returns its public URL. The caller is responsible for validating the file
 * (type/size/dimensions) before calling — this only handles storage.
 */
export async function uploadBackgroundImage(file: File): Promise<string> {
  const { masjid_id } = await getMasjidMembership();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${masjidFolder(masjid_id)}/${Date.now()}.${ext}`;
  return uploadFile(SupabaseBuckets.UserBackgrounds, file, path);
}

/**
 * Lists the current masjid's uploaded background images, newest first.
 */
export async function listUserBackgrounds(): Promise<BackgroundImage[]> {
  const { masjid_id } = await getMasjidMembership();
  const folder = masjidFolder(masjid_id);

  const { data, error } = await supabase.storage
    .from(SupabaseBuckets.UserBackgrounds)
    .list(folder, { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    console.error('Error listing user backgrounds:', error);
    captureSupabaseError(error, {
      source: 'supabase.storage',
      operation: 'list_user_backgrounds',
      extra: { masjid_id },
    });
    throw new Error('Failed to load uploaded images');
  }

  return (data || [])
    .filter(item => {
      if (!item.name || item.name.includes('/')) return false;
      const ext = item.name.toLowerCase().split('.').pop();
      return SUPPORTED_EXTENSIONS.includes(ext || '');
    })
    .map(item => {
      const filePath = `${folder}/${item.name}`;
      const { data: urlData } = supabase.storage
        .from(SupabaseBuckets.UserBackgrounds)
        .getPublicUrl(filePath);
      return { name: item.name, url: urlData.publicUrl };
    });
}

/**
 * Deletes one of the current masjid's uploaded backgrounds by file name.
 */
export async function deleteUserBackground(name: string): Promise<void> {
  const { masjid_id } = await getMasjidMembership();
  const { error } = await supabase.storage
    .from(SupabaseBuckets.UserBackgrounds)
    .remove([`${masjidFolder(masjid_id)}/${name}`]);

  if (error) {
    console.error('Error deleting user background:', error);
    captureSupabaseError(error, {
      source: 'supabase.storage',
      operation: 'delete_user_background',
      extra: { masjid_id, name },
    });
    throw new Error('Failed to delete image');
  }
}
