import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { PrayerTimingsModal } from '@/components/modals';
import { getMasjidProfile, getPrayerTimeSettings } from '@/lib/supabase/services';
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

export default function SalahTimings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<AlAdhanPrayerTimes[] | null>(null);
  const [masjidCoordinates, setMasjidCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [savedSettings, setSavedSettings] = useState<PrayerTimes | null>(null);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(true);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentDay = useMemo(() => selectedDate.getDate() - 1, [selectedDate]);
  const currentMonth = useMemo(() => format(selectedDate, 'MMMM yyyy'), [selectedDate]);

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
          date: selectedDate,
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
  }, [masjidCoordinates, selectedDate, trigger]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handlePreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
    setPrayerTimes(null);
  };

  const handleNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
    setPrayerTimes(null);
  };

  const handleResetToCurrentMonth = () => {
    setSelectedDate(new Date());
    setPrayerTimes(null);
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

      <div className='grid grid-cols-3 items-center my-6'>
        <div className='justify-self-start'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handlePreviousMonth}
            className='flex items-center gap-1'
          >
            <ChevronLeft size={16} />
            Previous Month
          </Button>
        </div>
        <div className='flex flex-col items-center justify-self-center'>
          <h2 className='text-xl font-medium'>{currentMonth}</h2>
          {format(selectedDate, 'MMMM yyyy') !== format(new Date(), 'MMMM yyyy') && (
            <Button variant='link' size='sm' onClick={handleResetToCurrentMonth}>
              Reset to current month
            </Button>
          )}
        </div>
        <div className='justify-self-end'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleNextMonth}
            className='flex items-center gap-1'
          >
            Next Month
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

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
