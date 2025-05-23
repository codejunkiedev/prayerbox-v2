import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { CalendarIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrayerTimingsModal } from '@/components/modals';
import { getMasjidProfile, getPrayerTimeSettings } from '@/lib/supabase/services';
import { fetchPrayerTimesForDate } from '@/api';
import { toast } from 'sonner';
import type { PrayerTimes, PrayerTimesForDate } from '@/types';
import { useTrigger } from '@/hooks';
import { AppRoutes, CalculationMethod, JuristicSchool } from '@/constants';
import { Link } from 'react-router';

export default function SalahTimings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesForDate | null>(null);
  const [masjidCoordinates, setMasjidCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [savedSettings, setSavedSettings] = useState<PrayerTimes | null>(null);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(true);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);

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
    async function fetchPrayerTimes() {
      if (!masjidCoordinates) return;

      try {
        setIsFetchingTimes(true);
        const savedSettings = await getPrayerTimeSettings();
        if (savedSettings) {
          setSavedSettings(savedSettings);
        }

        const today = format(new Date(), 'dd-MM-yyyy');
        const response = await fetchPrayerTimesForDate({
          date: today,
          latitude: masjidCoordinates.latitude,
          longitude: masjidCoordinates.longitude,
          method: savedSettings?.calculation_method || CalculationMethod.Muslim_World_League,
          school: savedSettings?.juristic_school || JuristicSchool.Shafi,
        });

        setPrayerTimes(response.data);
        toast.success('Fetched prayer times successfully');
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        toast.error('Failed to fetch prayer times');
      } finally {
        setIsFetchingTimes(false);
      }
    }

    fetchPrayerTimes();
  }, [masjidCoordinates, trigger]);

  const formatTime = (timeString: string) => {
    try {
      return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Prayer Times</h1>
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-2'
          onClick={() => setIsModalOpen(true)}
        >
          <Settings size={16} />
          Settings
        </Button>
      </div>

      {isFetchingCoordinates ? (
        <div className='flex justify-center p-8'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
          <span className='sr-only'>Loading...</span>
        </div>
      ) : !masjidCoordinates ? (
        <div className='text-center py-8'>
          <p className='text-lg mb-4'>Please set your masjid location in the profile page</p>
          <Link to={AppRoutes.Profile}>
            <Button variant='default'>Go to Profile</Button>
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {isFetchingTimes ? (
            <div className='col-span-full flex justify-center p-8'>
              <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
              <span className='sr-only'>Fetching prayer times...</span>
            </div>
          ) : prayerTimes ? (
            <>
              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle className='flex justify-between items-center'>
                    <span>Fajr</span>
                    <span className='text-sm font-normal flex items-center gap-1'>
                      <CalendarIcon size={14} />
                      {prayerTimes.date.readable}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>{formatTime(prayerTimes.timings.Fajr)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Sunrise</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>{formatTime(prayerTimes.timings.Sunrise)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Dhuhr</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>{formatTime(prayerTimes.timings.Dhuhr)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Asr</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>{formatTime(prayerTimes.timings.Asr)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Maghrib</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>{formatTime(prayerTimes.timings.Maghrib)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Isha</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>{formatTime(prayerTimes.timings.Isha)}</p>
                </CardContent>
              </Card>

              <Card className='md:col-span-2 lg:col-span-3'>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Calculation Method</CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='font-semibold'>Method:</p>
                      <p>{prayerTimes.meta.method.name}</p>
                    </div>
                    <div>
                      <p className='font-semibold'>School:</p>
                      <p>{prayerTimes.meta.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className='col-span-full text-center py-8'>
              <p className='text-lg mb-4'>Click on Settings to configure and fetch prayer times</p>
              <Button onClick={() => setIsModalOpen(true)}>Configure Prayer Times</Button>
            </div>
          )}
        </div>
      )}
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
