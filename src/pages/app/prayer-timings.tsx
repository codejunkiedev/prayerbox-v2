import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { PrayerTimingsModal } from '@/components/modals';
import { getMasjidProfile, getPrayerTimeSettings } from '@/lib/supabase';
import { toast } from 'sonner';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { useTrigger } from '@/hooks';
import { CalculationMethod, JuristicSchool } from '@/constants';
import { fetchPrayerTimesForThisMonth } from '@/api';
import { PageHeader } from '@/components/common/PageHeader';
import {
  PrayerTimesTable,
  PrayerTimesLoading,
  PrayerTimesEmpty,
  LocationNotSet,
} from '@/components/prayer-times';

const currentDate = new Date();

interface MasjidCoordinates {
  latitude: number;
  longitude: number;
}

export default function PrayerTimings() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes[] | null>(null);
  const [masjidCoordinates, setMasjidCoordinates] = useState<MasjidCoordinates | null>(null);
  const [savedSettings, setSavedSettings] = useState<PrayerTimes | null>(null);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState<boolean>(true);
  const [isFetchingTimes, setIsFetchingTimes] = useState<boolean>(false);

  const currentDay = useMemo(() => currentDate.getDate() - 1, []);
  const currentMonth = useMemo(() => format(currentDate, 'MMMM yyyy'), []);

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
        const savedSettings = await getPrayerTimeSettings();
        if (savedSettings) setSavedSettings(savedSettings);

        if (!masjidCoordinates) return;

        const response = await fetchPrayerTimesForThisMonth({
          date: currentDate,
          latitude: masjidCoordinates.latitude,
          longitude: masjidCoordinates.longitude,
          method: savedSettings?.calculation_method ?? CalculationMethod.Shia_Ithna_Ashari,
          school: savedSettings?.juristic_school ?? JuristicSchool.Shafi,
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
    if (isFetchingCoordinates) {
      return <PrayerTimesLoading />;
    }

    if (!masjidCoordinates) {
      return <LocationNotSet />;
    }

    if (isFetchingTimes) {
      return <PrayerTimesLoading />;
    }

    if (prayerTimes && prayerTimes.length > 0) {
      return (
        <div className='space-y-6'>
          <PrayerTimesTable
            prayerTimes={prayerTimes}
            savedSettings={savedSettings}
            currentDay={currentDay}
            currentMonth={currentMonth}
          />
        </div>
      );
    }

    return <PrayerTimesEmpty onConfigure={handleOpenModal} />;
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Prayer Times'
        description='View and manage prayer times for your masjid'
        showAddButton={false}
        showSettingsButton={true}
        onSettingsClick={handleOpenModal}
      />

      {renderContent()}

      <PrayerTimingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => forceUpdate()}
        masjidCoordinates={masjidCoordinates}
        initialValues={savedSettings}
      />
    </div>
  );
}
