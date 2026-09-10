import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type AlAdhanPrayerTimes, type PrayerTimes, type Settings, SupabaseTables } from '@/types';
import { useDisplayStore } from '@/store';
import { getDisplayPrayerSettings, type TableSubscription } from '@/lib/supabase';
import { fetchPrayerTimesForThisMonth } from '@/api';
import {
  findTodayInMonth,
  instantOnZonedDay,
  isNullOrUndefined,
  monthCacheKeyFromDate,
  nowInTimeZone,
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

/**
 * Time until the *masjid's* next midnight. Rolling over on the device's would
 * change the day at the wrong moment for anyone viewing from another zone.
 */
const millisecondsUntilNextMidnight = (timeZone: string | null | undefined): number => {
  const zonedNow = nowInTimeZone(timeZone);
  const tomorrow = new Date(zonedNow);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 5s past midnight to be safe.
  const nextMidnight = instantOnZonedDay(tomorrow, 0, 0, timeZone).getTime() + 5000;
  return nextMidnight - Date.now();
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

  const { masjidProfile, displayScreen } = useDisplayStore();
  const masjidId = masjidProfile?.id;
  const timeZone = masjidProfile?.timezone ?? null;
  const code = displayScreen?.code;

  // `settings` and `prayer_times` aren't readable by anon any more, so the
  // display watches the content-free revision counter instead and refetches
  // through the code-keyed RPC when it moves.
  const subscriptions = useMemo<TableSubscription[]>(() => {
    if (!masjidId) return [];
    return [{ table: SupabaseTables.DisplayRevisions, filter: `masjid_id=eq.${masjidId}` }];
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
        const today = nowInTimeZone(timeZone);
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
    [masjidProfile, timeZone]
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (!enabled || !code) return () => abortController.abort();

    const isInitialFetch = refreshKey === 0;
    let hadCachedMonth = false;

    const fetchData = async () => {
      setErrorMessage(null);

      try {
        const { settings: userSettings, prayer_times: adjustments } =
          await getDisplayPrayerSettings(code);

        const { latitude, longitude } = masjidProfile || {};
        const method = userSettings?.calculation_method;
        const school = userSettings?.juristic_school;

        if (
          !isNullOrUndefined(latitude) &&
          !isNullOrUndefined(longitude) &&
          !isNullOrUndefined(method) &&
          !isNullOrUndefined(school)
        ) {
          const today = nowInTimeZone(timeZone);
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
  }, [enabled, fetchPrayerTimes, code, masjidProfile, timeZone, refreshKey]);

  // At midnight, re-pick today's row from the cached month so prayer times
  // roll over without a network call. If the month has changed, the cached
  // data won't contain the new day — the next mount/refresh will fetch it.
  useEffect(() => {
    if (!enabled) return;

    let timeoutId = 0;
    const scheduleNext = () => {
      const delay = millisecondsUntilNextMidnight(timeZone);
      timeoutId = window.setTimeout(() => {
        const days = monthDaysRef.current;
        if (days) {
          const todayRow = findTodayInMonth(days, nowInTimeZone(timeZone));
          if (todayRow) setPrayerTimes(todayRow);
        }
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    return () => window.clearTimeout(timeoutId);
  }, [enabled, timeZone]);

  return {
    isLoading,
    errorMessage,
    prayerTimes,
    prayerTimeSettings,
  };
}
