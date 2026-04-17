import { useEffect } from 'react';

export function useWakeLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          lock.release().catch(error => {
            console.warn('Failed to release wake lock', error);
          });
          return;
        }
        sentinel = lock;
        sentinel.addEventListener('release', () => {
          sentinel = null;
        });
      } catch (error) {
        if ((error as Error)?.name === 'NotAllowedError') return;
        console.warn('Failed to acquire wake lock', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinel) request();
    };

    request();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sentinel?.release().catch(error => {
        console.warn('Failed to release wake lock', error);
      });
      sentinel = null;
    };
  }, [enabled]);
}
