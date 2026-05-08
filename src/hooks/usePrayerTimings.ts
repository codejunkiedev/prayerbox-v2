import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type AlAdhanPrayerTimes, type PrayerTimes, type Settings, SupabaseTables } from '@/types';
import { useDisplayStore } from '@/store';
import { getPrayerAdjustments, getSettings, type TableSubscription } from '@/lib/supabase';
import { fetchPrayerTimesForThisMonth } from '@/api';
import {
  findTodayInMonth,
  isNullOrUndefined,
  monthCacheKeyFromDate,
  readPrayerTimesMonth,
  writePrayerTimesMonth,
} from '@/utils';
import type { ErrorMessage } from '@/components/display';
import { useRealtimeRefresh } from './useRealtimeRefresh';

type ReturnType = {
  isLoading: boolean;
  errorMessage: ErrorMessage | null;
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
};

const millisecondsUntilNextMidnight = (now: Date): number => {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 5, 0); // 5s past midnight to be safe
  return nextMidnight.getTime() - now.getTime();
};

/**
 * Custom hook to fetch and manage prayer times and settings.
 *
 * Fetches a full month from Al-Adhan and caches it in localStorage so the
 * display works offline and survives midnight rollovers without a network call.
 * On day rollover, re-picks today's row from the cached month. When the month
 * itself changes, the next render hits the network to fetch the new month.
 */
export function usePrayerTimings(enabled: boolean = true): ReturnType {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes | null>(null);
  const [prayerTimeSettings, setPrayerTimeSettings] = useState<PrayerTimes | null>(null);
  const monthDaysRef = useRef<AlAdhanPrayerTimes[] | null>(null);

  const { masjidProfile } = useDisplayStore();
  const masjidId = masjidProfile?.id;

  const subscriptions = useMemo<TableSubscription[]>(() => {
    if (!masjidId) return [];
    const masjidFilter = `masjid_id=eq.${masjidId}`;
    return [
      { table: SupabaseTables.Settings, filter: masjidFilter },
      { table: SupabaseTables.PrayerTimes, filter: masjidFilter },
    ];
  }, [masjidId]);

  const refreshKey = useRealtimeRefresh(
    enabled && masjidId ? `prayer-times:${masjidId}` : null,
    subscriptions
  );

  const fetchPrayerTimes = useCallback(
    async (
      userSettings: Settings | null,
      adjustments: PrayerTimes | null,
      signal: AbortSignal,
      hadCachedMonth: boolean
    ) => {
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

      try {
        const today = new Date();
        const response = await fetchPrayerTimesForThisMonth({
          date: today,
          latitude,
          longitude,
          method,
          school,
          signal,
        });

        if (response?.data) {
          monthDaysRef.current = response.data;
          const todayRow = findTodayInMonth(response.data, today);
          if (todayRow) setPrayerTimes(todayRow);
          setPrayerTimeSettings(adjustments);

          writePrayerTimesMonth(
            monthCacheKeyFromDate(today, latitude, longitude, method, school),
            response.data
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Keep whatever month is already on screen (cached). If we never had any
        // cached data, surface a soft error so the operator knows what's wrong.
        console.error('Failed to fetch prayer times', error);
        if (!hadCachedMonth) {
          setErrorMessage({
            title: 'Unable to load prayer times',
            description:
              'No cached prayer times are available and we could not reach the server. Check the internet connection.',
          });
        }
      }
    },
    [masjidProfile]
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (!enabled || !masjidId) return () => abortController.abort();

    const isInitialFetch = refreshKey === 0;
    let hadCachedMonth = false;

    const fetchData = async () => {
      setErrorMessage(null);

      try {
        const [userSettings, adjustments] = await Promise.all([
          getSettings(masjidId),
          getPrayerAdjustments(masjidId),
        ]);

        const { latitude, longitude } = masjidProfile || {};
        const method = userSettings?.calculation_method;
        const school = userSettings?.juristic_school;

        if (
          !isNullOrUndefined(latitude) &&
          !isNullOrUndefined(longitude) &&
          !isNullOrUndefined(method) &&
          !isNullOrUndefined(school)
        ) {
          const today = new Date();
          const cached = readPrayerTimesMonth(
            monthCacheKeyFromDate(today, latitude, longitude, method, school)
          );
          if (cached) {
            hadCachedMonth = true;
            monthDaysRef.current = cached;
            const todayRow = findTodayInMonth(cached, today);
            if (todayRow) setPrayerTimes(todayRow);
            setPrayerTimeSettings(adjustments);
          }
        }

        if (isInitialFetch && !hadCachedMonth) setIsLoading(true);

        await fetchPrayerTimes(userSettings, adjustments, abortController.signal, hadCachedMonth);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error fetching prayer times:', error);
        if (isInitialFetch && !hadCachedMonth) {
          setErrorMessage({
            title: 'Unable to load prayer times',
            description:
              'No cached prayer times are available and we could not reach the server. Check the internet connection.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [enabled, fetchPrayerTimes, masjidId, masjidProfile, refreshKey]);

  // At midnight, re-pick today's row from the cached month so prayer times
  // roll over without a network call. If the month has changed, the cached
  // data won't contain the new day — the next mount/refresh will fetch it.
  useEffect(() => {
    if (!enabled) return;

    let timeoutId = 0;
    const scheduleNext = () => {
      const delay = millisecondsUntilNextMidnight(new Date());
      timeoutId = window.setTimeout(() => {
        const days = monthDaysRef.current;
        if (days) {
          const todayRow = findTodayInMonth(days, new Date());
          if (todayRow) setPrayerTimes(todayRow);
        }
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    return () => window.clearTimeout(timeoutId);
  }, [enabled]);

  return {
    isLoading,
    errorMessage,
    prayerTimes,
    prayerTimeSettings,
  };
}
