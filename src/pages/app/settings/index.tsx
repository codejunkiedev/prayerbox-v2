import { Link } from 'react-router';
import { Palette, Calendar, Grid } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AppRoutes } from '@/constants';
import { PageHeader } from '@/components/common';

const settingsModules = [
  {
    title: 'Modules',
    description: 'Configure display modules, their order, and visibility',
    icon: Grid,
    route: AppRoutes.SettingsModules,
    color: 'text-blue-600',
  },
  {
    title: 'Themes',
    description: 'Choose and customize display themes',
    icon: Palette,
    route: AppRoutes.SettingsThemes,
    color: 'text-purple-600',
  },
  {
    title: 'Hijri Calendar',
    description: 'Configure Hijri date calculation and adjustments',
    icon: Calendar,
    route: AppRoutes.SettingsHijri,
    color: 'text-green-600',
  },
];

export default function SettingsIndex() {
  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Settings'
        description='Configure your application preferences and display settings'
      />

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {settingsModules.map(module => {
          const Icon = module.icon;
          return (
            <Link key={module.title} to={module.route} className='block'>
              <Card className='h-full hover:shadow-md transition-shadow cursor-pointer'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <Icon className={`h-8 w-8 ${module.color}`} />
                    <div>
                      <CardTitle className='text-lg'>{module.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm'>{module.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
