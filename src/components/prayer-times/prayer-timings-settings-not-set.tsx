import { Link } from 'react-router';
import { Button } from '@/components/ui';
import { AppRoutes } from '@/constants';

/**
 * Displays a message prompting users to configure their prayer time settings
 */
export function PrayerTimingsSettingsNotSet() {
  return (
    <div className='text-center py-8'>
      <p className='text-lg mb-4'>Please configure your prayer time calculation settings</p>
      <Link to={AppRoutes.SettingsPrayerTimes}>
        <Button>Configure Prayer Times</Button>
      </Link>
    </div>
  );
}
