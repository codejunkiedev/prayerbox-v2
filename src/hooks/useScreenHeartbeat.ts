import { useEffect } from 'react';
import { recordScreenHeartbeat } from '@/lib/supabase';

const HEARTBEAT_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Reports that this display is still alive by refreshing the screen's
 * last_seen_at every 15 minutes.
 *
 * Displays stay logged in indefinitely, so the login timestamp alone can't tell
 * an admin whether a screen is still plugged in — the heartbeat can. It beats
 * once on mount and then on the interval; a beat that fails (offline display,
 * flaky network) is ignored so the next one can simply take over.
 */
export function useScreenHeartbeat(code: string | undefined) {
  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    const beat = () => {
      if (cancelled) return;
      recordScreenHeartbeat(code).catch(error => {
        console.warn('Failed to record screen heartbeat', error);
      });
    };

    beat();
    const timer = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [code]);
}
