import { useEffect, useMemo, useState } from 'react';
import {
  type Announcement,
  type Event,
  type Post,
  type YouTubeVideo,
  type Settings,
  type ScreenContentType,
  type AyatAndHadith,
  SupabaseTables,
} from '@/types';
import { useDisplayStore } from '@/store';
import {
  fetchContentByTableAndIds,
  getMasjidProfileByMasjidId,
  getScreenById,
  getSettings,
  getVisibleScreenContent,
  type TableSubscription,
} from '@/lib/supabase';
import type { ErrorMessage } from '@/components/display';
import { readDisplayCache, writeDisplayCache, type DisplayDataCache } from '@/utils';
import { useRealtimeRefresh } from './useRealtimeRefresh';

export type DisplayContentItem = {
  contentType: ScreenContentType;
  displayOrder: number;
  data: Announcement | Event | Post | YouTubeVideo | AyatAndHadith;
};

type ReturnType = {
  isLoading: boolean;
  errorMessage: ErrorMessage | null;
  orderedContent: DisplayContentItem[];
  userSettings: Settings | null;
};

const TABLE_MAP: Record<string, string> = {
  announcements: 'announcements',
  events: 'events',
  posts: 'posts',
  youtube_videos: 'youtube_videos',
  ayat_and_hadith: 'ayat_and_hadith',
};

type ContentRecord = (Announcement | Event | Post | YouTubeVideo | AyatAndHadith) & {
  id: string;
};

const buildOrderedContent = (
  screenContentRows: DisplayDataCache['screenContent'],
  contentItems: DisplayDataCache['contentItems']
): DisplayContentItem[] => {
  const items: DisplayContentItem[] = [];
  for (const row of screenContentRows) {
    const found = contentItems[row.content_id];
    if (found) {
      items.push({
        contentType: row.content_type as ScreenContentType,
        displayOrder: row.display_order,
        data: found,
      });
    }
  }
  return items;
};

/**
 * Custom hook to fetch display data filtered by screen content assignments.
 * Only fetches visible content, ordered by display_order.
 *
 * Hydrates from localStorage cache so the screen renders offline. The network
 * fetch runs in the background; on success the cache is updated, on failure
 * the cached data keeps showing.
 *
 * Subscribes to Supabase Realtime so admin edits (content, screen settings,
 * profile, prayer settings) propagate to the display without a reload.
 */
export function useFetchDisplayData(): ReturnType {
  const [fetching, setFetching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [orderedContent, setOrderedContent] = useState<DisplayContentItem[]>([]);
  const [userSettings, setUserSettings] = useState<Settings | null>(null);

  const { masjidProfile, displayScreen, setDisplayScreen, setMasjidProfile, signOut } =
    useDisplayStore();
  const masjidId = masjidProfile?.id;
  const screenId = displayScreen?.id;

  const subscriptions = useMemo<TableSubscription[]>(() => {
    if (!masjidId || !screenId) return [];
    const masjidFilter = `masjid_id=eq.${masjidId}`;
    return [
      { table: SupabaseTables.DisplayScreens, filter: `id=eq.${screenId}` },
      { table: SupabaseTables.ScreenContent, filter: `screen_id=eq.${screenId}` },
      { table: SupabaseTables.Settings, filter: masjidFilter },
      { table: SupabaseTables.MasjidProfiles, filter: `id=eq.${masjidId}` },
      { table: SupabaseTables.Announcements, filter: masjidFilter },
      { table: SupabaseTables.Events, filter: masjidFilter },
      { table: SupabaseTables.Posts, filter: masjidFilter },
      { table: SupabaseTables.YouTubeVideos, filter: masjidFilter },
      { table: SupabaseTables.AyatAndHadith, filter: masjidFilter },
    ];
  }, [masjidId, screenId]);

  const refreshKey = useRealtimeRefresh(
    masjidId && screenId ? `display:${screenId}` : null,
    subscriptions
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (!masjidId || !screenId) return () => abortController.abort();

    const isInitialFetch = refreshKey === 0;
    let hasCachedData = false;

    if (isInitialFetch) {
      const cached = readDisplayCache(screenId);
      if (cached) {
        hasCachedData = true;
        setUserSettings(cached.settings);
        setOrderedContent(buildOrderedContent(cached.screenContent, cached.contentItems));
        setDisplayScreen(cached.screen);
      }
    }

    const req = async () => {
      if (isInitialFetch && !hasCachedData) setFetching(true);
      setErrorMessage(null);

      try {
        const [settings, screenContentRows, latestScreen, latestProfile] = await Promise.all([
          getSettings(masjidId),
          getVisibleScreenContent(screenId),
          getScreenById(screenId),
          getMasjidProfileByMasjidId(masjidId),
        ]);

        if (!latestScreen) {
          signOut();
          return;
        }

        setDisplayScreen(latestScreen);
        if (latestProfile) setMasjidProfile(latestProfile);

        if (!settings && latestScreen.show_prayer_times) {
          setErrorMessage({
            title: 'Prayer time settings are missing',
            description:
              'Prayer times are enabled for this screen but calculation method and juristic school have not been configured. Please set them in the admin panel, or disable prayer times on this screen.',
          });
          return;
        }

        setUserSettings(settings);

        const idsByType: Record<string, string[]> = {};
        for (const row of screenContentRows) {
          if (!idsByType[row.content_type]) idsByType[row.content_type] = [];
          idsByType[row.content_type].push(row.content_id);
        }

        const fetchResults = await Promise.all(
          Object.entries(idsByType).map(async ([type, ids]) => {
            const data = await fetchContentByTableAndIds<ContentRecord>(TABLE_MAP[type], ids);
            return { type, data };
          })
        );

        const contentItems: Record<string, ContentRecord> = {};
        for (const { data } of fetchResults) {
          for (const item of data) {
            contentItems[item.id] = item;
          }
        }

        setOrderedContent(buildOrderedContent(screenContentRows, contentItems));

        writeDisplayCache(screenId, {
          settings,
          screen: latestScreen,
          screenContent: screenContentRows,
          contentItems,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error fetching data:', error);
        if (isInitialFetch && !hasCachedData) {
          setErrorMessage({
            title: 'Unable to load display content',
            description:
              'No cached content is available and we could not reach the server. Check the internet connection and refresh.',
          });
        }
      } finally {
        setFetching(false);
      }
    };
    req();

    return () => {
      abortController.abort();
    };
  }, [masjidId, screenId, refreshKey]);

  return {
    isLoading: fetching,
    errorMessage,
    orderedContent,
    userSettings,
  };
}
