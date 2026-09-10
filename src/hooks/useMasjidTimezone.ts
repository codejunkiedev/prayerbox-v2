import { useEffect, useState } from 'react';
import { getMasjidProfile } from '@/lib/supabase';

type ReturnType = {
  timeZone: string | null;
  isLoading: boolean;
};

/**
 * The current masjid's IANA timezone, or null when it has not been set
 */
export function useMasjidTimezone(): ReturnType {
  const [timeZone, setTimeZone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getMasjidProfile()
      .then(profile => {
        if (!cancelled) setTimeZone(profile?.timezone ?? null);
      })
      .catch(error => {
        console.error('Error loading masjid timezone:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { timeZone, isLoading };
}
