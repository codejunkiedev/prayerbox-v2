import { Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers';

/**
 * Component that allows users to select the app's color theme (light, dark, or system)
 */
export function AppThemeSection() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      description: 'Light mode with bright backgrounds',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      description: 'Dark mode with dark backgrounds',
      icon: Moon,
    },
    {
      value: 'system' as const,
      label: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Theme</CardTitle>
        <CardDescription>
          Choose your preferred color theme for the application interface. This affects the overall
          appearance of menus, buttons, and backgrounds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3'>
          {themeOptions.map(option => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <Button
                key={option.value}
                variant={isSelected ? 'default' : 'outline'}
                className='justify-start h-auto p-4 text-left'
                onClick={() => setTheme(option.value)}
              >
                <div className='flex items-center gap-3'>
                  <Icon className='h-5 w-5' />
                  <div className='flex-1'>
                    <div className='font-medium'>{option.label}</div>
                    <div
                      className={`text-sm ${
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
