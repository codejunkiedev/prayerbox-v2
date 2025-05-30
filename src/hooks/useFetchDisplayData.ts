import { useCallback, useEffect, useState } from 'react';
import type {
  AlAdhanPrayerTimes,
  Announcement,
  AyatAndHadith,
  Event,
  Post,
  PrayerTimes,
} from '@/types';
import { useDisplayStore } from '@/store';
import {
  getAnnouncements,
  getAyatAndHadith,
  getEvents,
  getPosts,
  getPrayerTimeSettings,
  getSettings,
} from '@/lib/supabase';
import { toast } from 'sonner';
import { fetchPrayerTimesForDate } from '@/api';
import { isNullOrUndefined } from '@/utils';
import type { ErrorMessage } from '@/components/display';

type ReturnType = {
  isLoading: boolean;
  errorMessage: ErrorMessage | null;
  announcements: Announcement[];
  ayatAndHadith: AyatAndHadith[];
  events: Event[];
  posts: Post[];
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
};

export function useFetchDisplayData(): ReturnType {
  const [fetching, setFetching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ayatAndHadith, setAyatAndHadith] = useState<AyatAndHadith[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes | null>(null);
  const [prayerTimeSettings, setPrayerTimeSettings] = useState<PrayerTimes | null>(null);

  const { masjidProfile } = useDisplayStore();
  const userId = masjidProfile?.user_id;

  const fetchAnnouncements = useCallback(async () => {
    try {
      const announcements = await getAnnouncements(userId);
      if (announcements?.length) setAnnouncements(announcements);
    } catch (error) {
      console.error('Failed to fetch announcements', error);
      toast.error('Failed to fetch announcements');
    }
  }, [userId]);

  const fetchAyatAndHadith = useCallback(async () => {
    try {
      const ayatAndHadith = await getAyatAndHadith(userId);
      if (ayatAndHadith?.length) setAyatAndHadith(ayatAndHadith);
    } catch (error) {
      console.error('Failed to fetch ayat and hadith', error);
      toast.error('Failed to fetch ayat and hadith');
    }
  }, [userId]);

  const fetchEvents = useCallback(async () => {
    try {
      const events = await getEvents(userId);
      if (events?.length) setEvents(events);
    } catch (error) {
      console.error('Failed to fetch events', error);
      toast.error('Failed to fetch events');
    }
  }, [userId]);

  const fetchPosts = useCallback(async () => {
    try {
      const posts = await getPosts(userId);
      if (posts?.length) setPosts(posts);
    } catch (error) {
      console.error('Failed to fetch posts', error);
      toast.error('Failed to fetch posts');
    }
  }, [userId]);

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
          date: new Date('2025-05-30'),
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
          console.log('Fetch aborted');
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

    const req = async () => {
      setFetching(true);
      setErrorMessage(null);

      try {
        const prayerTimes = await getPrayerTimeSettings(userId);
        const promises: Promise<void>[] = [fetchPrayerTimes(prayerTimes, abortController.signal)];
        const userSettings = await getSettings(userId);
        if (!userSettings || !userSettings?.modules?.length) {
          setErrorMessage({
            title: 'User settings are not set',
            description: 'Please set your user settings to continue',
          });
        } else {
          userSettings.modules.forEach(module => {
            if (module?.enabled) {
              if (module?.id === 'announcements') promises.push(fetchAnnouncements());
              if (module?.id === 'ayat-and-hadith') promises.push(fetchAyatAndHadith());
              if (module?.id === 'events') promises.push(fetchEvents());
              if (module?.id === 'posts') promises.push(fetchPosts());
            }
          });
        }
        await Promise.all(promises);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setFetching(false);
      }
    };
    req();

    return () => {
      abortController.abort();
    };
  }, [fetchAnnouncements, fetchAyatAndHadith, fetchEvents, fetchPosts, fetchPrayerTimes, userId]);

  return {
    isLoading: fetching,
    errorMessage,
    announcements,
    ayatAndHadith,
    events,
    posts,
    prayerTimes,
    prayerTimeSettings,
  };
}
