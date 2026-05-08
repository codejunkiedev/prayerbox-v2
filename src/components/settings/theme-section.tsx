import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { updateScreenTheme } from '@/lib/supabase';
import type { DisplayScreen } from '@/types';
import { Theme } from '@/types';

interface ThemeSectionProps {
  screen: DisplayScreen;
  onScreenChange: (screen: DisplayScreen) => void;
}

/**
 * Per-screen background theme picker for the prayer timings display.
 * Saves immediately on selection.
 */
export function ThemeSection({ screen, onScreenChange }: ThemeSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(screen.theme);

  const themeImageMap: Record<Theme, string> = {
    [Theme.Theme1]: new URL('@/assets/themes/theme-1/background.jpg', import.meta.url).href,
    [Theme.Theme2]: new URL('@/assets/themes/theme-2/background.jpg', import.meta.url).href,
    [Theme.Theme3]: new URL('@/assets/themes/theme-3/background.png', import.meta.url).href,
  };

  const themeOptions = Object.values(Theme);

  useEffect(() => {
    setSelectedTheme(screen.theme);
  }, [screen.theme]);

  const handleThemeSelect = async (theme: Theme) => {
    if (theme === selectedTheme) return;

    const previous = selectedTheme;
    try {
      setIsSaving(true);
      setSelectedTheme(theme);
      const updated = await updateScreenTheme(screen.id, theme);
      onScreenChange(updated);
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      setSelectedTheme(previous);
      toast.error('Failed to update theme');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prayer Timings Display Theme</CardTitle>
        <CardDescription>
          Select a background theme for this screen's prayer timings display. Each screen can have
          its own theme. Your choice is saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
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
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border',
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
                  <div className='mt-2 text-center text-xs font-medium text-foreground truncate w-32 capitalize'>
                    {themeName}
                  </div>
                </button>
              );
            })}
          </div>

          {isSaving && (
            <div className='flex items-center justify-center py-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <div className='animate-spin h-4 w-4 border-2 border-muted border-t-foreground rounded-full'></div>
                Saving theme...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
