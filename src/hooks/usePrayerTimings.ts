import { useCallback, useEffect, useState } from 'react';
import type { AlAdhanPrayerTimes, PrayerTimes, Settings } from '@/types';
import { useDisplayStore } from '@/store';
import { getPrayerAdjustments, getSettings } from '@/lib/supabase';
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
export function usePrayerTimings(enabled: boolean = true): ReturnType {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes | null>(null);
  const [prayerTimeSettings, setPrayerTimeSettings] = useState<PrayerTimes | null>(null);

  const { masjidProfile } = useDisplayStore();
  const masjidId = masjidProfile?.id;

  const fetchPrayerTimes = useCallback(
    async (
      userSettings: Settings | null,
      prayerTimeSettings: PrayerTimes | null,
      signal: AbortSignal
    ) => {
      try {
        const { latitude, longitude } = masjidProfile || {};

        if (isNullOrUndefined(latitude) || isNullOrUndefined(longitude)) {
          setErrorMessage({
            title: 'Masjid location is missing',
            description:
              'Prayer times need latitude and longitude from the masjid profile. Please set the location in the admin panel, or disable prayer times on this screen.',
          });
          return;
        }

        const method = userSettings?.calculation_method;
        const school = userSettings?.juristic_school;

        if (isNullOrUndefined(method) || isNullOrUndefined(school)) {
          setErrorMessage({
            title: 'Prayer calculation settings are missing',
            description:
              'Prayer times require a calculation method and juristic school. Please configure them in the admin panel, or disable prayer times on this screen.',
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

    if (!enabled || !masjidId) return () => abortController.abort();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [userSettings, prayerTimeSettings] = await Promise.all([
          getSettings(masjidId),
          getPrayerAdjustments(masjidId),
        ]);
        await fetchPrayerTimes(userSettings, prayerTimeSettings, abortController.signal);
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
  }, [enabled, fetchPrayerTimes, masjidId]);

  return {
    isLoading,
    errorMessage,
    prayerTimes,
    prayerTimeSettings,
  };
}
