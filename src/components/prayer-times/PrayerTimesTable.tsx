import { format, parse, addMinutes } from 'date-fns';
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
import type { AlAdhanPrayerTimes, PrayerAdjustments, PrayerTimes } from '@/types';

interface PrayerTimesTableProps {
  prayerTimes: AlAdhanPrayerTimes[];
  savedSettings: PrayerTimes | null;
  currentDay: number;
  currentMonth: string;
}

type PrayerName = keyof PrayerAdjustments;

export function PrayerTimesTable({
  prayerTimes,
  savedSettings,
  currentDay,
  currentMonth,
}: PrayerTimesTableProps) {
  const formatTime = (timeString: string): string => {
    try {
      return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getAdjustedPrayerTime = (prayerName: PrayerName, originalTime: string): string => {
    const timeOnly = originalTime.split(' ')[0];
    if (!savedSettings?.prayer_adjustments) return timeOnly;

    const adjustment = savedSettings.prayer_adjustments[prayerName];
    if (!adjustment) return timeOnly;

    if (adjustment.type === 'default') {
      return timeOnly;
    } else if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
      try {
        const parsedTime = parse(timeOnly, 'HH:mm', new Date());
        const adjustedTime = addMinutes(parsedTime, adjustment.offset);
        return format(adjustedTime, 'HH:mm');
      } catch {
        return timeOnly;
      }
    } else if (adjustment.type === 'manual' && adjustment.manual_time) {
      return adjustment.manual_time;
    }

    return timeOnly;
  };

  const isPrayerAdjusted = (prayerName: PrayerName): boolean => {
    if (!savedSettings?.prayer_adjustments) return false;
    const adjustment = savedSettings.prayer_adjustments[prayerName];
    return adjustment && adjustment.type !== 'default';
  };

  const getAdjustmentLabel = (prayerName: PrayerName): string => {
    if (!savedSettings?.prayer_adjustments) return '';
    const adjustment = savedSettings.prayer_adjustments[prayerName];

    if (!adjustment || adjustment.type === 'default') return '';

    if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
      const offset = adjustment.offset;
      const offsetDirection = offset > 0 ? '+' : offset < 0 ? '-' : '';
      const offsetValue = Math.abs(offset);
      const hours = Math.floor(offsetValue / 60);
      const minutes = offsetValue % 60;
      return `(${offsetDirection}${hours}h ${minutes}m)`;
    } else if (adjustment.type === 'manual' && adjustment.manual_time !== undefined) {
      return '(manual)';
    }

    return '';
  };

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex justify-between items-center mt-2'>
          <span>Prayer Times for {currentMonth}</span>
        </CardTitle>
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
                  {formatTime(getAdjustedPrayerTime('fajr', day.timings.Fajr))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('sunrise', day.timings.Sunrise))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('dhuhr', day.timings.Dhuhr))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('asr', day.timings.Asr))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('maghrib', day.timings.Maghrib))}
                </TableCell>
                <TableCell className='text-center'>
                  {formatTime(getAdjustedPrayerTime('isha', day.timings.Isha))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
