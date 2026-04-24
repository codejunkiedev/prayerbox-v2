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
import { toast } from 'sonner';
import type { ErrorMessage } from '@/components/display';

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

/**
 * Custom hook to fetch display data filtered by screen content assignments.
 * Only fetches visible content, ordered by display_order.
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

    const req = async () => {
      setFetching(true);
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

        // Group content IDs by type
        const idsByType: Record<string, string[]> = {};
        for (const row of screenContentRows) {
          if (!idsByType[row.content_type]) idsByType[row.content_type] = [];
          idsByType[row.content_type].push(row.content_id);
        }

        type ContentRecord = (Announcement | Event | Post | AyatAndHadith) & { id: string };

        // Fetch all content in parallel
        const fetchResults = await Promise.all(
          Object.entries(idsByType).map(async ([type, ids]) => {
            const data = await fetchContentByTableAndIds<ContentRecord>(TABLE_MAP[type], ids);
            const dataMap = new Map<string, ContentRecord>();
            for (const item of data) {
              dataMap.set(item.id, item);
            }
            return { type, dataMap };
          })
        );

        // Build a lookup: contentId -> fetched data
        const contentDataMap = new Map<string, ContentRecord>();
        for (const { dataMap } of fetchResults) {
          for (const [id, data] of dataMap) {
            contentDataMap.set(id, data);
          }
        }

        // Build ordered content list following screen_content display_order
        const items: DisplayContentItem[] = [];
        for (const row of screenContentRows) {
          const found = contentDataMap.get(row.content_id);
          if (found) {
            items.push({
              contentType: row.content_type as ScreenContentType,
              displayOrder: row.display_order,
              data: found,
            });
          }
        }

        setOrderedContent(items);
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
  }, [masjidId, screenId]);

  return {
    isLoading: fetching,
    errorMessage,
    orderedContent,
    userSettings,
  };
}
