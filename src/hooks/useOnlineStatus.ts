import { useEffect, useState } from 'react';
import { isOnlineNow } from '@/utils';

/**
 * Subscribes to the browser's online/offline events and returns the current
 * connectivity state. Components can use this to gate features that need a
 * live network connection (YouTube embeds, fresh API calls, etc.).
 */
export const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState<boolean>(isOnlineNow);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
};
