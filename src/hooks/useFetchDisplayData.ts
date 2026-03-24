import { useCallback, useEffect, useState } from 'react';
import type { Announcement, AyatAndHadith, Event, Post, Settings } from '@/types';
import { useDisplayStore } from '@/store';
import { getSettings, getScreenContent } from '@/lib/supabase';
import { toast } from 'sonner';
import type { ErrorMessage } from '@/components/display';
import supabase from '@/lib/supabase/index';

type ReturnType = {
  isLoading: boolean;
  errorMessage: ErrorMessage | null;
  announcements: Announcement[];
  ayatAndHadith: AyatAndHadith[];
  events: Event[];
  posts: Post[];
  userSettings: Settings | null;
};

/**
 * Custom hook to fetch display data filtered by screen content assignments
 */
export function useFetchDisplayData(): ReturnType {
  const [fetching, setFetching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ayatAndHadith, setAyatAndHadith] = useState<AyatAndHadith[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userSettings, setUserSettings] = useState<Settings | null>(null);

  const { masjidProfile, displayScreen } = useDisplayStore();
  const userId = masjidProfile?.user_id;
  const screenId = displayScreen?.id;

  const fetchContentByIds = useCallback(async <T>(table: string, ids: string[]): Promise<T[]> => {
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .in('id', ids)
      .eq('archived', false);
    if (error) throw error;
    return data as T[];
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    if (!userId || !screenId) return () => abortController.abort();

    const req = async () => {
      setFetching(true);
      setErrorMessage(null);

      try {
        const [settings, screenContentRows] = await Promise.all([
          getSettings(userId),
          getScreenContent(screenId),
        ]);

        if (!settings) {
          setErrorMessage({
            title: 'User settings are not set',
            description: 'Please set your user settings to continue',
          });
          return;
        }

        setUserSettings(settings);

        // Group content IDs by type
        const idsByType: Record<string, string[]> = {};
        for (const row of screenContentRows) {
          if (!idsByType[row.content_type]) idsByType[row.content_type] = [];
          idsByType[row.content_type].push(row.content_id);
        }

        const [fetchedAnnouncements, fetchedAyatAndHadith, fetchedEvents, fetchedPosts] =
          await Promise.all([
            fetchContentByIds<Announcement>('announcements', idsByType['announcements'] || []),
            fetchContentByIds<AyatAndHadith>('ayat_and_hadith', idsByType['ayat_and_hadith'] || []),
            fetchContentByIds<Event>('events', idsByType['events'] || []),
            fetchContentByIds<Post>('posts', idsByType['posts'] || []),
          ]);

        setAnnouncements(fetchedAnnouncements);
        setAyatAndHadith(fetchedAyatAndHadith);
        setEvents(fetchedEvents);
        setPosts(fetchedPosts);
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
  }, [userId, screenId, fetchContentByIds]);

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
