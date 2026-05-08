import { useEffect, useState } from 'react';
import {
  type Announcement,
  type Event,
  type Post,
  type YouTubeVideo,
  type Settings,
  type ScreenContentType,
  type AyatAndHadith,
} from '@/types';
import { useDisplayStore } from '@/store';
import {
  getSettings,
  getVisibleScreenContent,
  fetchContentByTableAndIds,
  getScreenById,
} from '@/lib/supabase';
import type { ErrorMessage } from '@/components/display';
import { readDisplayCache, writeDisplayCache, type DisplayDataCache } from '@/utils';

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
 */
export function useFetchDisplayData(): ReturnType {
  const [fetching, setFetching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [orderedContent, setOrderedContent] = useState<DisplayContentItem[]>([]);
  const [userSettings, setUserSettings] = useState<Settings | null>(null);

  const { masjidProfile, displayScreen, setDisplayScreen, signOut } = useDisplayStore();
  const masjidId = masjidProfile?.id;
  const screenId = displayScreen?.id;

  useEffect(() => {
    const abortController = new AbortController();

    if (!masjidId || !screenId) return () => abortController.abort();

    let hasCachedData = false;
    const cached = readDisplayCache(screenId);
    if (cached) {
      hasCachedData = true;
      setUserSettings(cached.settings);
      setOrderedContent(buildOrderedContent(cached.screenContent, cached.contentItems));
      setDisplayScreen(cached.screen);
    }

    const req = async () => {
      if (!hasCachedData) setFetching(true);
      setErrorMessage(null);

      try {
        const [settings, screenContentRows, latestScreen] = await Promise.all([
          getSettings(masjidId),
          getVisibleScreenContent(screenId),
          getScreenById(screenId),
        ]);

        // If screen was deleted, sign out so the display redirects to login
        if (!latestScreen) {
          signOut();
          return;
        }

        // Update screen settings in store if changed
        setDisplayScreen(latestScreen);

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
        // Keep showing cached data if we have it; otherwise surface a soft error.
        if (!hasCachedData) {
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
  }, [masjidId, screenId]);

  return {
    isLoading: fetching,
    errorMessage,
    orderedContent,
    userSettings,
  };
}
