import { useState, useEffect } from 'react';
import { getOrCreateSettings } from '@/lib/supabase';
import type { Settings } from '@/types';
import { toast } from 'sonner';

interface UseSettingsReturn {
  settings: Settings | null;
  setSettings: (settings: Settings | null) => void;
  isLoading: boolean;
}

/**
 * Custom hook to manage settings state and loading
 * Automatically loads settings on mount and provides loading state
 */
export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const userSettings = await getOrCreateSettings();
        if (userSettings) setSettings(userSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  return { settings, setSettings, isLoading };
};
