import { format, parse, addMinutes } from 'date-fns';
import { CalendarDays } from 'lucide-react';
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

interface WeeklyPrayerTimesProps {
  prayerTimes: AlAdhanPrayerTimes[];
  savedSettings: PrayerTimes | null;
  currentDay: number;
}

export function WeeklyPrayerTimes({
  prayerTimes,
  savedSettings,
  currentDay,
}: WeeklyPrayerTimesProps) {
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

  // Get the current week's prayer times (7 days)
  const weeklyTimes = prayerTimes.slice(
    Math.max(0, currentDay - 3),
    Math.min(prayerTimes.length, currentDay + 4)
  );

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex items-center gap-2'>
          <CalendarDays size={18} />
          This Week's Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0 overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Fajr</TableHead>
              <TableHead>Sunrise</TableHead>
              <TableHead>Dhuhr</TableHead>
              <TableHead>Asr</TableHead>
              <TableHead>Maghrib</TableHead>
              <TableHead>Isha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyTimes.map(day => {
              const isToday = day.date.gregorian.day === prayerTimes[currentDay].date.gregorian.day;
              return (
                <TableRow key={day.date.gregorian.date} className={isToday ? 'bg-primary/10' : ''}>
                  <TableCell className='font-medium'>
                    {format(
                      parse(
                        `${day.date.gregorian.day}-${day.date.gregorian.month.number}-${day.date.gregorian.year}`,
                        'd-M-yyyy',
                        new Date()
                      ),
                      'EEE, MMM d'
                    )}
                  </TableCell>
                  <TableCell className={isPrayerAdjusted('fajr') ? 'text-primary font-medium' : ''}>
                    {formatTime(getAdjustedPrayerTime('Fajr', day.timings.Fajr))}
                  </TableCell>
                  <TableCell
                    className={isPrayerAdjusted('sunrise') ? 'text-primary font-medium' : ''}
                  >
                    {formatTime(getAdjustedPrayerTime('Sunrise', day.timings.Sunrise))}
                  </TableCell>
                  <TableCell
                    className={isPrayerAdjusted('dhuhr') ? 'text-primary font-medium' : ''}
                  >
                    {formatTime(getAdjustedPrayerTime('Dhuhr', day.timings.Dhuhr))}
                  </TableCell>
                  <TableCell className={isPrayerAdjusted('asr') ? 'text-primary font-medium' : ''}>
                    {formatTime(getAdjustedPrayerTime('Asr', day.timings.Asr))}
                  </TableCell>
                  <TableCell
                    className={isPrayerAdjusted('maghrib') ? 'text-primary font-medium' : ''}
                  >
                    {formatTime(getAdjustedPrayerTime('Maghrib', day.timings.Maghrib))}
                  </TableCell>
                  <TableCell className={isPrayerAdjusted('isha') ? 'text-primary font-medium' : ''}>
                    {formatTime(getAdjustedPrayerTime('Isha', day.timings.Isha))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
