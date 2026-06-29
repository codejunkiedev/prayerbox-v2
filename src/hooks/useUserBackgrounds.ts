import { useCallback, useEffect, useState } from 'react';
import { listUserBackgrounds } from '@/lib/supabase';
import type { BackgroundImage } from '@/types';

/**
 * Loads the current masjid's uploaded background images. Mirrors
 * {@link useBackgroundImages} (curated library) but for per-masjid uploads, and
 * exposes `refetch` so callers can refresh the grid after an upload or delete.
 */
export function useUserBackgrounds() {
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const files = await listUserBackgrounds();
      setImages(files);
    } catch (err) {
      console.error('Failed to load uploaded backgrounds:', err);
      setError('Failed to load uploaded images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { images, loading, error, refetch };
}
