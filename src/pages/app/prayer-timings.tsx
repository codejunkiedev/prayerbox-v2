import { useState, useEffect } from 'react';
import {
  PrayerTimingsModal,
  PrayerCalculationModal,
  SunriseSunsetModal,
  HijriModal,
} from '@/components/modals';
import {
  getMasjidProfile,
  getOrCreatePrayerAdjustments,
  getOrCreateSettings,
} from '@/lib/supabase';
import { toast } from 'sonner';
import type { AlAdhanPrayerTimes, PrayerTimes, Settings } from '@/types';
import { useTrigger } from '@/hooks';
import { fetchPrayerTimesForThisMonth } from '@/api';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui';
import { Calculator, Sunrise, Sliders, CalendarDays } from 'lucide-react';
import {
  PrayerTimesTable,
  PrayerTimesLoading,
  PrayerTimesEmpty,
  LocationNotSet,
  PrayerTimingsSettingsNotSet,
} from '@/components/prayer-times';
import { getCurrentDate, getCurrentDay, isNullOrUndefined } from '@/utils';

const currentDate = getCurrentDate();

interface MasjidCoordinates {
  latitude: number;
  longitude: number;
}

export default function PrayerTimings() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState<boolean>(false);
  const [isSunriseSunsetModalOpen, setIsSunriseSunsetModalOpen] = useState<boolean>(false);
  const [isHijriModalOpen, setIsHijriModalOpen] = useState<boolean>(false);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes[] | null>(null);
  const [masjidCoordinates, setMasjidCoordinates] = useState<MasjidCoordinates | null>(null);
  const [savedSettings, setSavedSettings] = useState<PrayerTimes | null>(null);
  const [userSettings, setUserSettings] = useState<Settings | null>(null);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState<boolean>(true);
  const [isFetchingTimes, setIsFetchingTimes] = useState<boolean>(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    async function fetchMasjidProfile() {
      try {
        setIsFetchingCoordinates(true);
        const profile = await getMasjidProfile();
        if (profile && profile.latitude && profile.longitude) {
          setMasjidCoordinates({ latitude: profile.latitude, longitude: profile.longitude });
        } else {
          toast.warning('Please set your masjid location in the profile page');
        }
      } catch (error) {
        console.error('Error fetching masjid profile:', error);
        toast.error('Failed to fetch masjid profile');
      } finally {
        setIsFetchingCoordinates(false);
      }
    }
    fetchMasjidProfile();
  }, []);

  useEffect(() => {
    if (!masjidCoordinates) return;

    const abortController = new AbortController();

    async function fetchPrayerTimes() {
      try {
        setIsFetchingTimes(true);

        if (!masjidCoordinates) return;

        const [settings, prayerSettings] = await Promise.all([
          getOrCreateSettings(),
          getOrCreatePrayerAdjustments(),
        ]);
        setUserSettings(settings);
        setSavedSettings(prayerSettings);

        if (
          isNullOrUndefined(settings?.calculation_method) ||
          isNullOrUndefined(settings?.juristic_school)
        )
          return;

        const response = await fetchPrayerTimesForThisMonth({
          date: currentDate,
          latitude: masjidCoordinates.latitude,
          longitude: masjidCoordinates.longitude,
          method: settings.calculation_method,
          school: settings.juristic_school,
          signal: abortController.signal,
        });
        setPrayerTimes(response.data);
        toast.success('Fetched prayer times successfully');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Prayer times fetch aborted');
        } else {
          console.error('Error fetching prayer times:', error);
          toast.error('Failed to fetch prayer times');
        }
      } finally {
        setIsFetchingTimes(false);
      }
    }

    fetchPrayerTimes();

    return () => {
      abortController.abort();
    };
  }, [masjidCoordinates, trigger]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (isFetchingCoordinates || isFetchingTimes) {
      return <PrayerTimesLoading />;
    }

    if (!masjidCoordinates) {
      return <LocationNotSet />;
    }

    if (
      isNullOrUndefined(userSettings?.calculation_method) ||
      isNullOrUndefined(userSettings?.juristic_school)
    ) {
      return <PrayerTimingsSettingsNotSet onConfigure={() => setIsCalculationModalOpen(true)} />;
    }

    if (prayerTimes && prayerTimes.length > 0) {
      return <PrayerTimesTable prayerTimes={prayerTimes} savedSettings={savedSettings} />;
    }

    return <PrayerTimesEmpty onConfigure={handleOpenModal} />;
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Prayer Times'
        description='View and manage prayer times for your masjid'
        showAddButton={false}
        actions={
          <>
            <Button variant='outline' onClick={() => setIsCalculationModalOpen(true)}>
              <Calculator className='mr-2 h-4 w-4' />
              Calculation
            </Button>
            <Button variant='outline' onClick={() => setIsHijriModalOpen(true)}>
              <CalendarDays className='mr-2 h-4 w-4' />
              Hijri
            </Button>
            <Button variant='outline' onClick={() => setIsSunriseSunsetModalOpen(true)}>
              <Sunrise className='mr-2 h-4 w-4' />
              Sunrise &amp; Sunset
            </Button>
            <Button onClick={handleOpenModal}>
              <Sliders className='mr-2 h-4 w-4' />
              Adjustments
            </Button>
          </>
        }
      />

      {renderContent()}

      <PrayerTimingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => forceUpdate()}
        initialValues={savedSettings}
      />
      <PrayerCalculationModal
        isOpen={isCalculationModalOpen}
        onClose={() => setIsCalculationModalOpen(false)}
        onSaved={() => forceUpdate()}
      />
      <SunriseSunsetModal
        isOpen={isSunriseSunsetModalOpen}
        onClose={() => setIsSunriseSunsetModalOpen(false)}
        settings={userSettings}
        onSettingsChange={setUserSettings}
        todaySunrise={prayerTimes?.[getCurrentDay() - 1]?.timings.Sunrise}
        todaySunset={prayerTimes?.[getCurrentDay() - 1]?.timings.Sunset}
      />
      <HijriModal
        isOpen={isHijriModalOpen}
        onClose={() => setIsHijriModalOpen(false)}
        settings={userSettings}
        onSettingsChange={setUserSettings}
      />
    </div>
  );
}
