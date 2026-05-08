import supabase from './index';
import type { SupabaseTables } from '@/types';

export type TableSubscription = {
  table: SupabaseTables | string;
  /**
   * Postgres changes filter, e.g. `id=eq.${id}` or `masjid_id=eq.${masjidId}`.
   * Omit to receive every row change on the table (RLS still applies).
   */
  filter?: string;
};

/**
 * Subscribes to row-level changes on one or more tables and fires a single
 * `onChange` callback for any of them. Returns a cleanup function that
 * unsubscribes from the channel.
 *
 * The channel name must be unique within the page; reuse will silently
 * replace the previous subscription. Caller is responsible for invoking
 * the cleanup on unmount.
 */
export function subscribeToTableChanges(
  channelName: string,
  subscriptions: TableSubscription[],
  onChange: () => void
): () => void {
  const channel = supabase.channel(channelName);
  for (const sub of subscriptions) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: sub.table, filter: sub.filter },
      onChange
    );
  }
  channel.subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
