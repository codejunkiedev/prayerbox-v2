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
import { getDisplayPayload, type TableSubscription } from '@/lib/supabase';
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
 * The display runs as `anon`, which has no read access to the content tables.
 * Everything arrives in one call to `get_display_payload`, a SECURITY DEFINER
 * function keyed by the screen's login code, so a display can only ever reach
 * the masjid its own code belongs to.
 *
 * Hydrates from localStorage cache so the screen renders offline. The network
 * fetch runs in the background; on success the cache is updated, on failure
 * the cached data keeps showing.
 *
 * Live updates come from `display_revisions`, a content-free counter that
 * triggers bump whenever anything the display renders changes. Subscribing to
 * the content tables themselves is not an option: Realtime delivers a change
 * only if the subscriber's own RLS lets it read the row, and anon's no longer
 * does. The counter is only ever a signal to refetch — its value is unused.
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
  const code = displayScreen?.code;

  const subscriptions = useMemo<TableSubscription[]>(() => {
    if (!masjidId) return [];
    return [{ table: SupabaseTables.DisplayRevisions, filter: `masjid_id=eq.${masjidId}` }];
  }, [masjidId]);

  const refreshKey = useRealtimeRefresh(
    masjidId && screenId ? `display:${screenId}` : null,
    subscriptions
  );

  useEffect(() => {
    if (!screenId || !code) return;

    let cancelled = false;
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
        const payload = await getDisplayPayload(code);
        if (cancelled) return;

        // No payload means the screen was deleted out from under the display.
        if (!payload) {
          signOut();
          return;
        }

        setDisplayScreen(payload.screen);
        if (payload.masjid_profile) setMasjidProfile(payload.masjid_profile);

        if (!payload.settings && payload.screen.show_prayer_times) {
          setErrorMessage({
            title: 'Prayer time settings are missing',
            description:
              'Prayer times are enabled for this screen but calculation method and juristic school have not been configured. Please set them in the admin panel, or disable prayer times on this screen.',
          });
          return;
        }

        setUserSettings(payload.settings);
        setOrderedContent(buildOrderedContent(payload.screen_content, payload.content));

        writeDisplayCache(screenId, {
          settings: payload.settings,
          screen: payload.screen,
          screenContent: payload.screen_content,
          contentItems: payload.content,
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching data:', error);
        if (isInitialFetch && !hasCachedData) {
          setErrorMessage({
            title: 'Unable to load display content',
            description:
              'No cached content is available and we could not reach the server. Check the internet connection and refresh.',
          });
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    req();

    return () => {
      cancelled = true;
    };
  }, [screenId, code, refreshKey]);

  return {
    isLoading: fetching,
    errorMessage,
    orderedContent,
    userSettings,
  };
}
