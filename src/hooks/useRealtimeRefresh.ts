import { useEffect, useState } from 'react';
import { subscribeToTableChanges, type TableSubscription } from '@/lib/supabase';

const DEFAULT_DEBOUNCE_MS = 250;

/**
 * Subscribes to Supabase Realtime changes on the given tables and returns a
 * counter that increments whenever any of them changes. Bursts of events
 * (e.g. reordering many rows) are coalesced into a single bump via debounce.
 *
 * Add the returned key to a fetch effect's dependency array to re-run the
 * fetch on every change. Pass `channelName: null` to disable subscription.
 */
export function useRealtimeRefresh(
  channelName: string | null,
  subscriptions: TableSubscription[],
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): number {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Serialize the subscription list so callers can pass an inline array
  // without re-subscribing on every render.
  const signature = JSON.stringify(subscriptions);

  useEffect(() => {
    if (!channelName) return;

    let timer = 0;
    const onChange = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setRefreshKey(k => k + 1);
      }, debounceMs);
    };

    const unsubscribe = subscribeToTableChanges(channelName, subscriptions, onChange);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
    // `signature` captures the subscriptions array contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, signature, debounceMs]);

  return refreshKey;
}
