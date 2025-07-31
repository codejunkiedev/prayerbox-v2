import { useCallback, useEffect, useState } from 'react';
import type { Announcement, AyatAndHadith, Event, Post, Settings } from '@/types';
import { useDisplayStore } from '@/store';
import {
  getAnnouncements,
  getAyatAndHadith,
  getEvents,
  getPosts,
  getSettings,
} from '@/lib/supabase';
import { toast } from 'sonner';
import type { ErrorMessage } from '@/components/display';

type ReturnType = {
  isLoading: boolean;
  errorMessage: ErrorMessage | null;
  announcements: Announcement[];
  ayatAndHadith: AyatAndHadith[];
  events: Event[];
  posts: Post[];
  userSettings: Settings | null;
};

export function useFetchDisplayData(): ReturnType {
  const [fetching, setFetching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ayatAndHadith, setAyatAndHadith] = useState<AyatAndHadith[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userSettings, setUserSettings] = useState<Settings | null>(null);

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

  useEffect(() => {
    const abortController = new AbortController();

    if (!userId) return () => abortController.abort();

    const req = async () => {
      setFetching(true);
      setErrorMessage(null);

      try {
        const userSettings = await getSettings(userId);
        if (!userSettings || !userSettings?.modules?.length) {
          setErrorMessage({
            title: 'User settings are not set',
            description: 'Please set your user settings to continue',
          });
        } else {
          setUserSettings(userSettings);
          const promises: Promise<void>[] = [];
          userSettings.modules.forEach(module => {
            if (module?.enabled) {
              if (module?.id === 'announcements') promises.push(fetchAnnouncements());
              if (module?.id === 'ayat-and-hadith') promises.push(fetchAyatAndHadith());
              if (module?.id === 'events') promises.push(fetchEvents());
              if (module?.id === 'posts') promises.push(fetchPosts());
            }
          });
          await Promise.all(promises);
        }
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
  }, [fetchAnnouncements, fetchAyatAndHadith, fetchEvents, fetchPosts, userId]);

  return {
    isLoading: fetching,
    errorMessage,
    announcements,
    ayatAndHadith,
    events,
    posts,
    userSettings,
  };
}
