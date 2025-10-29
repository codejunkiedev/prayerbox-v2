import { Button } from '@/components/ui';
import { AppRoutes } from '@/constants';
import { Link } from 'react-router';

/**
 * Displays a message prompting users to set their masjid location with a link to the profile page
 */
export function LocationNotSet() {
  return (
    <div className='text-center py-8'>
      <p className='text-lg mb-4'>Please set your masjid location in the profile page</p>
      <Link to={AppRoutes.SettingsProfile}>
        <Button variant='default'>Go to Profile</Button>
      </Link>
    </div>
  );
}
