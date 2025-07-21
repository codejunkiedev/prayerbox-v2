import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { updateTheme } from '@/lib/supabase';
import type { Settings } from '@/types';
import { Theme } from '@/types';

interface ThemeSectionProps {
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
}

export function ThemeSection({ settings, onSettingsChange }: ThemeSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>(settings?.theme);

  const themeImageMap: Record<Theme, string> = {
    [Theme.Theme1]: new URL('@/assets/themes/backgrounds/theme-1.jpg', import.meta.url).href,
    [Theme.Theme2]: new URL('@/assets/themes/backgrounds/theme-2.jpg', import.meta.url).href,
  };

  const themeOptions = Object.values(Theme);

  useEffect(() => {
    if (settings?.theme) {
      setSelectedTheme(settings.theme);
    }
  }, [settings]);

  const handleThemeSelect = async (theme: Theme) => {
    if (!settings) return;
    try {
      setIsSaving(true);
      setSelectedTheme(theme);
      const updatedSettings = await updateTheme(theme);
      onSettingsChange(updatedSettings);
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prayer Timings Theme</CardTitle>
        <CardDescription>
          Select a background theme for the prayer timings screen of the app. Your choice will be
          saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-row gap-4'>
          {themeOptions.map(theme => {
            const themeKey = theme as Theme;
            const themeName = themeKey.replace(/-/g, ' ');
            return (
              <button
                key={themeKey}
                className={clsx(
                  'border-2 rounded-lg overflow-hidden p-1 transition-all',
                  selectedTheme === themeKey
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-200',
                  isSaving && 'opacity-50 pointer-events-none'
                )}
                onClick={() => handleThemeSelect(themeKey)}
                disabled={isSaving}
                type='button'
                aria-label={`Select ${themeName}`}
              >
                <img
                  src={themeImageMap[themeKey]}
                  alt={themeName}
                  className='w-32 h-20 object-cover'
                />
                <div className='mt-2 text-center text-xs font-medium text-gray-700 truncate w-32 capitalize'>
                  {themeName}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
