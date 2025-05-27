import { formatTime, addTimeMinutes, isFriday, getCurrentDay } from '@/utils';
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
}

type PrayerName = keyof PrayerAdjustments;
type JummaPrayer = 'jumma1' | 'jumma2' | 'jumma3';

const currentDay = getCurrentDay();

export function PrayerTimesTable({ prayerTimes, savedSettings }: PrayerTimesTableProps) {
  const getAdjustedPrayerTime = (prayerName: PrayerName, originalTime: string): string => {
    const timeOnly = originalTime.split(' ')[0];
    if (!savedSettings?.prayer_adjustments) return timeOnly;

    const adjustment = savedSettings.prayer_adjustments[prayerName];
    if (!adjustment) return timeOnly;

    if (adjustment.type === 'default') {
      return timeOnly;
    } else if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
      return addTimeMinutes(timeOnly, adjustment.offset);
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
      return `(${offsetDirection}${hours > 0 ? `${hours.toString().padStart(2, '0')}h ` : ''}${minutes.toString().padStart(2, '0')}m)`;
    } else if (adjustment.type === 'manual' && adjustment.manual_time !== undefined) {
      return '(manual)';
    }

    return '';
  };

  const isJummaAdjusted = (jumma: JummaPrayer): boolean => {
    return isPrayerAdjusted(jumma);
  };

  const getJummaColumnHeader = (jumma: JummaPrayer, label: string): React.ReactElement => {
    return (
      <TableHead className='text-center font-medium'>
        <div className='flex flex-col items-center'>
          <span className='font-semibold'>{label}</span>
          {isPrayerAdjusted(jumma) && (
            <span className='text-xs text-muted-foreground mt-0.5'>
              {getAdjustmentLabel(jumma)}
            </span>
          )}
        </div>
      </TableHead>
    );
  };

  const getJummaTimeCell = (day: AlAdhanPrayerTimes, jumma: JummaPrayer): React.ReactElement => {
    const dateStr = `${day.date.gregorian.year}-${day.date.gregorian.month.number.toString().padStart(2, '0')}-${day.date.gregorian.day}`;
    const isJummaDay = isFriday(dateStr);
    return (
      <TableCell className='text-center'>
        {isJummaDay ? formatTime(getAdjustedPrayerTime(jumma, day.timings.Dhuhr)) : '—'}
      </TableCell>
    );
  };

  const currentMonth = prayerTimes[0]?.date?.gregorian?.month?.en;
  const currentYear = prayerTimes[0]?.date?.gregorian?.year;

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex justify-between items-center mt-2'>
          <span>
            Prayer Times for {currentMonth}, {currentYear}
          </span>
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
              {isJummaAdjusted('jumma1') && getJummaColumnHeader('jumma1', 'Jumma 1')}
              {isJummaAdjusted('jumma2') && getJummaColumnHeader('jumma2', 'Jumma 2')}
              {isJummaAdjusted('jumma3') && getJummaColumnHeader('jumma3', 'Jumma 3')}
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
            {prayerTimes.map((day, index) => {
              const dateStr = `${day.date.gregorian.year}-${day.date.gregorian.month.number.toString().padStart(2, '0')}-${day.date.gregorian.day}`;
              const isJummaDay = isFriday(dateStr);

              return (
                <TableRow
                  key={day.date.gregorian.date}
                  className={
                    index + 1 === currentDay ? 'bg-primary/10' : isJummaDay ? 'bg-secondary/10' : ''
                  }
                >
                  <TableCell className='font-medium text-center'>
                    {day.date.gregorian.day}
                    {isJummaDay && <span className='ml-1 text-xs text-primary'>(Fri)</span>}
                  </TableCell>
                  <TableCell className='text-center'>
                    {formatTime(getAdjustedPrayerTime('fajr', day.timings.Fajr))}
                  </TableCell>
                  <TableCell className='text-center'>
                    {formatTime(getAdjustedPrayerTime('sunrise', day.timings.Sunrise))}
                  </TableCell>
                  <TableCell className='text-center'>
                    {formatTime(getAdjustedPrayerTime('dhuhr', day.timings.Dhuhr))}
                  </TableCell>
                  {isJummaAdjusted('jumma1') && getJummaTimeCell(day, 'jumma1')}
                  {isJummaAdjusted('jumma2') && getJummaTimeCell(day, 'jumma2')}
                  {isJummaAdjusted('jumma3') && getJummaTimeCell(day, 'jumma3')}
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
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
