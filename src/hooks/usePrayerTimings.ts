import { useCallback, useEffect, useState } from 'react';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { useDisplayStore } from '@/store';
import { getPrayerTimeSettings } from '@/lib/supabase';
import { toast } from 'sonner';
import { fetchPrayerTimesForDate } from '@/api';
import { isNullOrUndefined } from '@/utils';
import type { ErrorMessage } from '@/components/display';

type ReturnType = {
  isLoading: boolean;
  errorMessage: ErrorMessage | null;
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
};

/**
 * Custom hook to fetch and manage prayer times and settings
 * Fetches prayer time settings from database and prayer times from Al-Adhan API
 * @returns Object containing loading state, error messages, prayer times, and settings
 */
export function usePrayerTimings(): ReturnType {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes | null>(null);
  const [prayerTimeSettings, setPrayerTimeSettings] = useState<PrayerTimes | null>(null);

  const { masjidProfile } = useDisplayStore();
  const userId = masjidProfile?.user_id;

  const fetchPrayerTimes = useCallback(
    async (prayerTimeSettings: PrayerTimes | null, signal: AbortSignal) => {
      try {
        const { latitude, longitude } = masjidProfile || {};

        if (isNullOrUndefined(latitude) || isNullOrUndefined(longitude)) {
          setErrorMessage({
            title: 'Masjid profile is not set',
            description: 'Please set your masjid profile to continue',
          });
          return;
        }

        const { calculation_method: method, juristic_school: school } = prayerTimeSettings || {};

        if (isNullOrUndefined(method) || isNullOrUndefined(school)) {
          setErrorMessage({
            title: 'Prayer time settings are not set',
            description: 'Please set your prayer time settings to continue',
          });
          return;
        }

        const response = await fetchPrayerTimesForDate({
          date: new Date(),
          latitude,
          longitude,
          method,
          school,
          signal,
        });
        if (response?.data) {
          setPrayerTimes(response.data);
          setPrayerTimeSettings(prayerTimeSettings);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Prayer times fetch aborted');
        } else {
          console.error('Failed to fetch prayer times', error);
          toast.error('Failed to fetch prayer times');
        }
      }
    },
    [masjidProfile]
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (!userId) return () => abortController.abort();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const prayerTimeSettings = await getPrayerTimeSettings(userId);
        await fetchPrayerTimes(prayerTimeSettings, abortController.signal);
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        toast.error('Failed to fetch prayer times');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [fetchPrayerTimes, userId]);

  return {
    isLoading,
    errorMessage,
    prayerTimes,
    prayerTimeSettings,
  };
}
