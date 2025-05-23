import { useState, useEffect, useMemo } from 'react';
import { format, parse, addMinutes } from 'date-fns';
import { CalendarIcon, Settings } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
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

  // Get current month and year for the header
  const currentMonth = useMemo(() => {
    const now = new Date();
    return format(now, 'MMMM yyyy');
  }, []);

  // Check if a prayer time has been adjusted
  const isPrayerAdjusted = (prayerName: string) => {
    if (!savedSettings?.prayer_adjustments) return false;
    const prayerKey = prayerName.toLowerCase() as keyof typeof savedSettings.prayer_adjustments;
    const adjustment = savedSettings.prayer_adjustments[prayerKey];
    return adjustment && adjustment.type !== 'default';
  };

  // Get adjustment type label
  const getAdjustmentLabel = (prayerName: string) => {
    if (!savedSettings?.prayer_adjustments) return '';
    const prayerKey = prayerName.toLowerCase() as keyof typeof savedSettings.prayer_adjustments;
    const adjustment = savedSettings.prayer_adjustments[prayerKey];

    if (!adjustment || adjustment.type === 'default') return '';

    if (adjustment.type === 'offset') {
      return `(${adjustment.offset && adjustment.offset > 0 ? '+' : ''}${adjustment.offset} min)`;
    } else if (adjustment.type === 'manual') {
      return '(manual)';
    }

    return '';
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
        <div>
          {isFetchingTimes ? (
            <div className='flex justify-center p-8'>
              <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
              <span className='sr-only'>Fetching prayer times...</span>
            </div>
          ) : prayerTimes && prayerTimes.length > 0 ? (
            <div className='space-y-6'>
              <Card>
                <CardHeader className='bg-primary/5'>
                  <CardTitle className='flex justify-between items-center'>
                    <span>Prayer Times for {currentMonth}</span>
                    <div className='flex items-center gap-2'>
                      <CalendarIcon size={16} />
                      <span className='text-sm'>
                        {prayerTimes[0].date.gregorian.month.en}{' '}
                        {prayerTimes[0].date.gregorian.year}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0 overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[80px]'>Date</TableHead>
                        <TableHead>
                          Fajr{' '}
                          {isPrayerAdjusted('fajr') && (
                            <span className='text-xs text-muted-foreground'>
                              {getAdjustmentLabel('fajr')}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>
                          Sunrise{' '}
                          {isPrayerAdjusted('sunrise') && (
                            <span className='text-xs text-muted-foreground'>
                              {getAdjustmentLabel('sunrise')}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>
                          Dhuhr{' '}
                          {isPrayerAdjusted('dhuhr') && (
                            <span className='text-xs text-muted-foreground'>
                              {getAdjustmentLabel('dhuhr')}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>
                          Asr{' '}
                          {isPrayerAdjusted('asr') && (
                            <span className='text-xs text-muted-foreground'>
                              {getAdjustmentLabel('asr')}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>
                          Maghrib{' '}
                          {isPrayerAdjusted('maghrib') && (
                            <span className='text-xs text-muted-foreground'>
                              {getAdjustmentLabel('maghrib')}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>
                          Isha{' '}
                          {isPrayerAdjusted('isha') && (
                            <span className='text-xs text-muted-foreground'>
                              {getAdjustmentLabel('isha')}
                            </span>
                          )}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prayerTimes.map((day, index) => (
                        <TableRow
                          key={day.date.gregorian.date}
                          className={index === currentDay ? 'bg-primary/10' : ''}
                        >
                          <TableCell className='font-medium'>{day.date.gregorian.day}</TableCell>
                          <TableCell>
                            {formatTime(getAdjustedPrayerTime('Fajr', day.timings.Fajr))}
                          </TableCell>
                          <TableCell>
                            {formatTime(getAdjustedPrayerTime('Sunrise', day.timings.Sunrise))}
                          </TableCell>
                          <TableCell>
                            {formatTime(getAdjustedPrayerTime('Dhuhr', day.timings.Dhuhr))}
                          </TableCell>
                          <TableCell>
                            {formatTime(getAdjustedPrayerTime('Asr', day.timings.Asr))}
                          </TableCell>
                          <TableCell>
                            {formatTime(getAdjustedPrayerTime('Maghrib', day.timings.Maghrib))}
                          </TableCell>
                          <TableCell>
                            {formatTime(getAdjustedPrayerTime('Isha', day.timings.Isha))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
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
            </div>
          ) : (
            <div className='text-center py-8'>
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
