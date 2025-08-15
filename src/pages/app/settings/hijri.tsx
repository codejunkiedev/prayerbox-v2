import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { HijriSection } from '@/components/settings';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui';
import { AppRoutes } from '@/constants';
import { useSettings } from '@/hooks';

export default function HijriSettings() {
  const { settings, setSettings, isLoading } = useSettings();

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex items-center gap-4'>
        <Link to={AppRoutes.Settings}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Settings
          </Button>
        </Link>
      </div>
      <PageHeader
        title='Hijri Settings'
        description='Configure Hijri calendar calculation method and adjustments'
      />
      <HijriSection settings={settings} onSettingsChange={setSettings} isLoading={isLoading} />
    </div>
  );
}
