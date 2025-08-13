import {
  isFriday,
  getCurrentDay,
  getAdjustedPrayerTime,
  isPrayerAdjusted,
  getAdjustmentLabel,
} from '@/utils';
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
}

type JummaPrayer = 'jumma1' | 'jumma2' | 'jumma3';

const currentDay = getCurrentDay();

/**
 * Renders a comprehensive prayer times table with monthly data, adjustments, and special Jumma timings
 */
export function PrayerTimesTable({ prayerTimes, savedSettings }: PrayerTimesTableProps) {
  const isJummaAdjusted = (jumma: JummaPrayer): boolean => {
    return isPrayerAdjusted(jumma, savedSettings);
  };

  const getJummaColumnHeader = (jumma: JummaPrayer, label: string): React.ReactElement => {
    return (
      <TableHead className='text-center font-medium'>
        <div className='flex flex-col items-center'>
          <span className='font-semibold'>{label}</span>
          {isPrayerAdjusted(jumma, savedSettings) && (
            <span className='text-xs text-muted-foreground mt-0.5'>
              {getAdjustmentLabel(jumma, savedSettings, true)}
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
        {isJummaDay ? getAdjustedPrayerTime(jumma, day.timings.Dhuhr, savedSettings) : '—'}
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
                  {isPrayerAdjusted('fajr', savedSettings) && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('fajr', savedSettings, true)}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Sunrise</span>
                  {isPrayerAdjusted('sunrise', savedSettings) && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('sunrise', savedSettings, true)}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Dhuhr</span>
                  {isPrayerAdjusted('dhuhr', savedSettings) && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('dhuhr', savedSettings, true)}
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
                  {isPrayerAdjusted('asr', savedSettings) && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('asr', savedSettings, true)}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Maghrib</span>
                  {isPrayerAdjusted('maghrib', savedSettings) && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('maghrib', savedSettings, true)}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Isha</span>
                  {isPrayerAdjusted('isha', savedSettings) && (
                    <span className='text-xs text-muted-foreground mt-0.5'>
                      {getAdjustmentLabel('isha', savedSettings, true)}
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
                    {getAdjustedPrayerTime('fajr', day.timings.Fajr, savedSettings)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {getAdjustedPrayerTime('sunrise', day.timings.Sunrise, savedSettings)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {getAdjustedPrayerTime('dhuhr', day.timings.Dhuhr, savedSettings)}
                  </TableCell>
                  {isJummaAdjusted('jumma1') && getJummaTimeCell(day, 'jumma1')}
                  {isJummaAdjusted('jumma2') && getJummaTimeCell(day, 'jumma2')}
                  {isJummaAdjusted('jumma3') && getJummaTimeCell(day, 'jumma3')}
                  <TableCell className='text-center'>
                    {getAdjustedPrayerTime('asr', day.timings.Asr, savedSettings)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {getAdjustedPrayerTime('maghrib', day.timings.Maghrib, savedSettings)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {getAdjustedPrayerTime('isha', day.timings.Isha, savedSettings)}
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
