import { format, parse, addMinutes } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex justify-between items-center'>
          <span>Prayer Times for {currentMonth}</span>
          <div className='flex items-center gap-2'>
            <CalendarIcon size={16} />
            <span className='text-sm'>
              {prayerTimes[0].date.gregorian.month.en} {prayerTimes[0].date.gregorian.year}
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
                  <span className='text-xs text-muted-foreground'>{getAdjustmentLabel('asr')}</span>
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
                <TableCell>{formatTime(getAdjustedPrayerTime('Fajr', day.timings.Fajr))}</TableCell>
                <TableCell>
                  {formatTime(getAdjustedPrayerTime('Sunrise', day.timings.Sunrise))}
                </TableCell>
                <TableCell>
                  {formatTime(getAdjustedPrayerTime('Dhuhr', day.timings.Dhuhr))}
                </TableCell>
                <TableCell>{formatTime(getAdjustedPrayerTime('Asr', day.timings.Asr))}</TableCell>
                <TableCell>
                  {formatTime(getAdjustedPrayerTime('Maghrib', day.timings.Maghrib))}
                </TableCell>
                <TableCell>{formatTime(getAdjustedPrayerTime('Isha', day.timings.Isha))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
