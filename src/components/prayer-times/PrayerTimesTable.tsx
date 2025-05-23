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
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';

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
  const formatTime = (timeString: string) => {
    try {
      return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getAdjustedPrayerTime = (prayerName: string, originalTime: string) => {
    if (!savedSettings?.prayer_adjustments) return originalTime;

    const timeOnly = originalTime.split(' ')[0];

    const prayerKey = prayerName.toLowerCase() as keyof typeof savedSettings.prayer_adjustments;
    const adjustment = savedSettings.prayer_adjustments[prayerKey];

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
