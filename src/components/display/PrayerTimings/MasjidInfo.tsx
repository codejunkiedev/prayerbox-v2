import { useState, useEffect } from 'react';
import type { MasjidProfile } from '@/types';
import { reverseGeocode } from '@/api';
import { toast } from 'sonner';

interface MasjidInfoProps {
  masjidProfile: MasjidProfile | null;
}

export function MasjidInfo({ masjidProfile }: MasjidInfoProps) {
  const [location, setLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLocation = async () => {
      if (!masjidProfile?.latitude || !masjidProfile?.longitude) return;

      setIsLoading(true);
      try {
        const response = await reverseGeocode({
          latitude: masjidProfile.latitude,
          longitude: masjidProfile.longitude,
          signal: controller.signal,
        });
        if (response) {
          const feature = response.features[0];
          if (feature) {
            const props = feature?.properties;
            setLocation(props?.formatted || '');
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Failed to fetch location', error);
          toast.error('Failed to fetch location');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();

    return () => {
      controller.abort();
    };
  }, [masjidProfile?.latitude, masjidProfile?.longitude]);

  return (
    <div className='mt-4 sm:mt-6 text-center'>
      <div className='text-base sm:text-lg font-semibold'>{masjidProfile?.name || 'Masjid'}</div>
      <div className='text-xs sm:text-sm text-muted-foreground'>
        {isLoading ? 'Loading location...' : location || 'Location not set'}
      </div>
    </div>
  );
}
