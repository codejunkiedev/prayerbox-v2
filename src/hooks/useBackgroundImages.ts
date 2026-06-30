import { useEffect, useState } from 'react';
import { listFiles } from '@/lib/supabase/helpers';
import { VALID_IMAGE_EXTENSIONS } from '@/lib/zod';
import { SupabaseBuckets, SupabaseFolders, type BackgroundImage } from '@/types';

/**
 * Fetches the list of background images from the Supabase
 * `assets/ayat-hadith-backgrounds` folder, sorted alphabetically by filename.
 */
export function useBackgroundImages() {
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listFiles(SupabaseBuckets.Assets, SupabaseFolders.AyatHadithBackgrounds)
      .then(files => {
        if (cancelled) return;
        const filtered = files
          .filter(f => {
            const ext = f.name.toLowerCase().split('.').pop();
            return VALID_IMAGE_EXTENSIONS.includes(ext || '');
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        setImages(filtered);
      })
      .catch(err => {
        console.error('Failed to load background images:', err);
        if (!cancelled) setError('Failed to load images');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { images, loading, error };
}
