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

type ReturnType = {
  isLoading: boolean;
  announcements: Announcement[];
  ayatAndHadith: AyatAndHadith[];
  events: Event[];
  posts: Post[];
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
};

export function useFetchDisplayData(): ReturnType {
  const [fetching, setFetching] = useState<boolean>(false);
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
    async (prayerTimeSettings: PrayerTimes) => {
      try {
        const { latitude, longitude } = masjidProfile || {};

        if (isNullOrUndefined(latitude) || isNullOrUndefined(longitude)) {
          toast.error('Masjid profile is not set');
          return;
        }

        const { calculation_method: method, juristic_school: school } = prayerTimeSettings || {};

        if (isNullOrUndefined(method) || isNullOrUndefined(school)) {
          toast.error('Prayer time settings are not set');
          return;
        }

        const response = await fetchPrayerTimesForDate({
          date: new Date(),
          latitude,
          longitude,
          method,
          school,
        });
        if (response?.data) setPrayerTimes(response.data);
      } catch (error) {
        console.error('Failed to fetch prayer times', error);
        toast.error('Failed to fetch prayer times');
      }
    },
    [masjidProfile]
  );

  useEffect(() => {
    const req = async () => {
      setFetching(true);
      try {
        if (userId) {
          const promises: Promise<void>[] = [];

          const prayerTimes = await getPrayerTimeSettings(userId);
          if (prayerTimes) {
            setPrayerTimeSettings(prayerTimes);
            promises.push(fetchPrayerTimes(prayerTimes));
          }

          const userSettings = await getSettings(userId);
          if (userSettings) {
            if (!userSettings?.modules?.length) return;
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
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Failed to fetch data');
      } finally {
        setFetching(false);
      }
    };
    req();
  }, [fetchAnnouncements, fetchAyatAndHadith, fetchEvents, fetchPosts, fetchPrayerTimes, userId]);

  return {
    isLoading: fetching,
    announcements,
    ayatAndHadith,
    events,
    posts,
    prayerTimes,
    prayerTimeSettings,
  };
}
