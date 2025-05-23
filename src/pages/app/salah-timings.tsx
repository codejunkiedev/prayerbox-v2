import { useState, useEffect, useMemo } from 'react';
import { format, parse, addMinutes } from 'date-fns';
import { CalendarIcon, Settings } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PrayerTimingsModal } from '@/components/modals';
import { getMasjidProfile, getPrayerTimeSettings } from '@/lib/supabase/services';
import { toast } from 'sonner';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { useTrigger } from '@/hooks';
import { AppRoutes, CalculationMethod, JuristicSchool } from '@/constants';
import { Link } from 'react-router';
import { fetchPrayerTimesForThisMonth } from '@/api';

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
  const [currentDay, setCurrentDay] = useState(0); // Index of the current day in the prayer times array

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

        const response = await fetchPrayerTimesForThisMonth({
          date: new Date(),
          latitude: masjidCoordinates.latitude,
          longitude: masjidCoordinates.longitude,
          method: savedSettings?.calculation_method ?? CalculationMethod.Shia_Ithna_Ashari,
          school: savedSettings?.juristic_school ?? JuristicSchool.Shafi,
        });

        setPrayerTimes(response.data);

        // Set current day to today's index in the month
        const today = new Date().getDate() - 1; // 0-indexed
        setCurrentDay(today);

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

  // Get adjusted prayer time based on settings
  const getAdjustedPrayerTime = (prayerName: string, originalTime: string) => {
    if (!savedSettings?.prayer_adjustments) return originalTime;

    const prayerKey = prayerName.toLowerCase() as keyof typeof savedSettings.prayer_adjustments;
    const adjustment = savedSettings.prayer_adjustments[prayerKey];

    if (!adjustment) return originalTime;

    if (adjustment.type === 'default') {
      return originalTime;
    } else if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
      try {
        const parsedTime = parse(originalTime, 'HH:mm', new Date());
        const adjustedTime = addMinutes(parsedTime, adjustment.offset);
        return format(adjustedTime, 'HH:mm');
      } catch {
        return originalTime;
      }
    } else if (adjustment.type === 'manual' && adjustment.manual_time) {
      return adjustment.manual_time;
    }

    return originalTime;
  };

  const calculationMethod = useMemo(() => {
    type CalculationMethodType = keyof typeof CalculationMethod;
    const method = Object.keys(CalculationMethod).find(
      key => CalculationMethod[key as CalculationMethodType] === savedSettings?.calculation_method
    );
    return method?.replace(/_/g, ' ');
  }, [savedSettings?.calculation_method]);

  const juristicSchool = useMemo(() => {
    type JuristicSchoolType = keyof typeof JuristicSchool;
    const school = Object.keys(JuristicSchool).find(
      key => JuristicSchool[key as JuristicSchoolType] === savedSettings?.juristic_school
    );
    return school?.replace(/_/g, ' ');
  }, [savedSettings?.juristic_school]);

  // Get current day's prayer times
  const todayPrayerTimes = useMemo(() => {
    if (!prayerTimes || !prayerTimes[currentDay]) return null;
    return prayerTimes[currentDay];
  }, [prayerTimes, currentDay]);

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
          ) : todayPrayerTimes ? (
            <>
              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle className='flex justify-between items-center'>
                    <span>Fajr</span>
                    <span className='text-sm font-normal flex items-center gap-1'>
                      <CalendarIcon size={14} />
                      {todayPrayerTimes.date.readable}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>
                    {formatTime(getAdjustedPrayerTime('Fajr', todayPrayerTimes.timings.Fajr))}
                  </p>
                  {savedSettings?.prayer_adjustments?.fajr?.type !== 'default' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {savedSettings?.prayer_adjustments?.fajr?.type === 'offset'
                        ? `Adjusted by ${savedSettings.prayer_adjustments.fajr.offset} minutes`
                        : 'Manually set'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Sunrise</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>
                    {formatTime(todayPrayerTimes.timings.Sunrise)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Dhuhr</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>
                    {formatTime(getAdjustedPrayerTime('Dhuhr', todayPrayerTimes.timings.Dhuhr))}
                  </p>
                  {savedSettings?.prayer_adjustments?.dhuhr?.type !== 'default' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {savedSettings?.prayer_adjustments?.dhuhr?.type === 'offset'
                        ? `Adjusted by ${savedSettings.prayer_adjustments.dhuhr.offset} minutes`
                        : 'Manually set'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Asr</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>
                    {formatTime(getAdjustedPrayerTime('Asr', todayPrayerTimes.timings.Asr))}
                  </p>
                  {savedSettings?.prayer_adjustments?.asr?.type !== 'default' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {savedSettings?.prayer_adjustments?.asr?.type === 'offset'
                        ? `Adjusted by ${savedSettings.prayer_adjustments.asr.offset} minutes`
                        : 'Manually set'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Maghrib</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>
                    {formatTime(getAdjustedPrayerTime('Maghrib', todayPrayerTimes.timings.Maghrib))}
                  </p>
                  {savedSettings?.prayer_adjustments?.maghrib?.type !== 'default' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {savedSettings?.prayer_adjustments?.maghrib?.type === 'offset'
                        ? `Adjusted by ${savedSettings.prayer_adjustments.maghrib.offset} minutes`
                        : 'Manually set'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='bg-primary/5 pb-2'>
                  <CardTitle>Isha</CardTitle>
                </CardHeader>
                <CardContent className='pt-4 text-center'>
                  <p className='text-3xl font-bold'>
                    {formatTime(getAdjustedPrayerTime('Isha', todayPrayerTimes.timings.Isha))}
                  </p>
                  {savedSettings?.prayer_adjustments?.isha?.type !== 'default' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {savedSettings?.prayer_adjustments?.isha?.type === 'offset'
                        ? `Adjusted by ${savedSettings.prayer_adjustments.isha.offset} minutes`
                        : 'Manually set'}
                    </p>
                  )}
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
                      <p>{calculationMethod}</p>
                    </div>
                    <div>
                      <p className='font-semibold'>School:</p>
                      <p>{juristicSchool?.replace(/_/g, ' ')}</p>
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
