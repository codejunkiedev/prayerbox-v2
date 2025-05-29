import type { AlAdhanPrayerTimes, MasjidProfile } from '@/types';

interface MasjidInfoProps {
  masjidProfile: MasjidProfile | null;
  prayerTimes: AlAdhanPrayerTimes | null;
}

export function MasjidInfo({ masjidProfile, prayerTimes }: MasjidInfoProps) {
  return (
    <div className='mt-4 sm:mt-6 text-center'>
      <div className='text-base sm:text-lg font-semibold'>{masjidProfile?.name || 'Masjid'}</div>
      <div className='text-xs sm:text-sm text-muted-foreground'>
        {/* Display area or city name if available */}
        {masjidProfile?.latitude && masjidProfile?.longitude
          ? `${prayerTimes?.meta?.timezone || 'Local Time'}`
          : 'Location not set'}
      </div>
    </div>
  );
}
