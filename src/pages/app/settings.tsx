import { useState, useEffect } from 'react';
import { getOrCreateSettings } from '@/lib/supabase';
import type { Settings } from '@/types';
import { ThemeSection, ModulesSection } from '@/components/settings';
import { toast } from 'sonner';

export default function Settings() {
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

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <ModulesSection settings={settings} onSettingsChange={setSettings} isLoading={isLoading} />
      <ThemeSection settings={settings} onSettingsChange={setSettings} />
    </div>
  );
}
