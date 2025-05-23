import { format, parse, addMinutes } from 'date-fns';
import { useMemo } from 'react';
import { Info } from 'lucide-react';
import {
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
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { CalculationMethod, JuristicSchool } from '@/constants';

interface PrayerTimesTableProps {
  prayerTimes: AlAdhanPrayerTimes[];
  savedSettings: PrayerTimes | null;
  currentDay: number;
  currentMonth: string;
}

export function PrayerTimesTable({
  prayerTimes,
  savedSettings,
  currentDay,
  currentMonth,
}: PrayerTimesTableProps) {
  // Helper function to format prayer times
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

  // Check if a prayer time has been adjusted
  const isPrayerAdjusted = (prayerName: string) => {
    if (!savedSettings?.prayer_adjustments) return false;
    const prayerKey = prayerName.toLowerCase() as keyof typeof savedSettings.prayer_adjustments;
    const adjustment = savedSettings.prayer_adjustments[prayerKey];
    return adjustment && adjustment.type !== 'default';
  };

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

  const calculationMethod = useMemo(() => {
    type CalculationMethodType = keyof typeof CalculationMethod;
    const method = Object.keys(CalculationMethod).find(
      key => CalculationMethod[key as CalculationMethodType] === savedSettings?.calculation_method
    );
    return method?.replace(/_/g, ' ') || 'Not set';
  }, [savedSettings?.calculation_method]);

  const juristicSchool = useMemo(() => {
    type JuristicSchoolType = keyof typeof JuristicSchool;
    const school = Object.keys(JuristicSchool).find(
      key => JuristicSchool[key as JuristicSchoolType] === savedSettings?.juristic_school
    );
    return school;
  }, [savedSettings?.juristic_school]);

  return (
    <Card>
      <CardHeader className='bg-primary/5 py-5'>
        <CardTitle className='flex justify-between items-center'>
          <span>Prayer Times for {currentMonth}</span>
        </CardTitle>
        <div className='flex flex-wrap items-center gap-1 text-sm '>
          <div className='flex items-center gap-1'>
            <Info size={14} />
            <span>Method: {calculationMethod}</span>
          </div>
          <span className='hidden sm:inline'>•</span>
          <div>
            <span>School: {juristicSchool}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0 overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-[80px] text-center font-medium py-3'>Date</TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Fajr</span>
                  {isPrayerAdjusted('fajr') && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('fajr')}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Sunrise</span>
                  {isPrayerAdjusted('sunrise') && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('sunrise')}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Dhuhr</span>
                  {isPrayerAdjusted('dhuhr') && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('dhuhr')}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Asr</span>
                  {isPrayerAdjusted('asr') && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('asr')}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Maghrib</span>
                  {isPrayerAdjusted('maghrib') && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('maghrib')}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Isha</span>
                  {isPrayerAdjusted('isha') && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('isha')}
                    </span>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prayerTimes.map((day, index) => (
              <TableRow
                key={day.date.gregorian.date}
                className={index === currentDay ? 'bg-primary/10' : ''}
              >
                <TableCell className='font-medium text-center'>{day.date.gregorian.day}</TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('Fajr', day.timings.Fajr))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('Sunrise', day.timings.Sunrise))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('Dhuhr', day.timings.Dhuhr))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('Asr', day.timings.Asr))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('Maghrib', day.timings.Maghrib))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('Isha', day.timings.Isha))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
