import { useState } from 'react';
import { isFriday, getCurrentDay, getAdjustedPrayerTime } from '@/utils';
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import type {
  AdjustmentCategory,
  AlAdhanPrayerTimes,
  PrayerAdjustments,
  PrayerTimes,
} from '@/types';

interface PrayerTimesTableProps {
  prayerTimes: AlAdhanPrayerTimes[];
  savedSettings: PrayerTimes | null;
}

type JummaPrayer = 'jumma1' | 'jumma2' | 'jumma3';

type PrayerColumn = {
  name: keyof PrayerAdjustments;
  label: string;
  getTime: (day: AlAdhanPrayerTimes) => string;
};

const currentDay = getCurrentDay();

export function PrayerTimesTable({ prayerTimes, savedSettings }: PrayerTimesTableProps) {
  const [category, setCategory] = useState<AdjustmentCategory>('starts');

  const isJummaActive = (jumma: JummaPrayer): boolean => {
    const adj = savedSettings?.prayer_adjustments?.[jumma];
    if (!adj) return false;
    return (
      adj.starts?.type !== 'default' ||
      adj.athan?.type !== 'default' ||
      adj.iqamah?.type !== 'default'
    );
  };

  const basePrayers: PrayerColumn[] = [
    { name: 'fajr', label: 'Fajr', getTime: d => d.timings.Fajr },
    { name: 'sunrise', label: 'Sunrise', getTime: d => d.timings.Sunrise },
    { name: 'dhuhr', label: 'Dhuhr', getTime: d => d.timings.Dhuhr },
  ];

  const jummaColumns: PrayerColumn[] = (['jumma1', 'jumma2', 'jumma3'] as JummaPrayer[])
    .filter(j => isJummaActive(j))
    .map((j, i) => ({
      name: j,
      label: `Jumma ${i + 1}`,
      getTime: (d: AlAdhanPrayerTimes) => d.timings.Dhuhr,
    }));

  const restPrayers: PrayerColumn[] = [
    { name: 'asr', label: 'Asr', getTime: d => d.timings.Asr },
    { name: 'maghrib', label: 'Maghrib', getTime: d => d.timings.Maghrib },
    { name: 'isha', label: 'Isha', getTime: d => d.timings.Isha },
  ];

  const columns = [...basePrayers, ...jummaColumns, ...restPrayers];

  const currentMonth = prayerTimes[0]?.date?.gregorian?.month?.en;
  const currentYear = prayerTimes[0]?.date?.gregorian?.year;

  return (
    <Card className='gap-0 py-0'>
      <CardHeader className='bg-primary/5 py-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base'>
            Prayer Times for {currentMonth}, {currentYear}
          </CardTitle>
          <Tabs value={category} onValueChange={v => setCategory(v as AdjustmentCategory)}>
            <TabsList>
              <TabsTrigger value='starts'>Starts</TabsTrigger>
              <TabsTrigger value='athan'>Athan</TabsTrigger>
              <TabsTrigger value='iqamah'>Iqamah</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className='p-0 overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-[80px] text-center font-medium py-3'>Date</TableHead>
              {columns.map(col => (
                <TableHead key={col.name} className='text-center font-semibold'>
                  {col.label}
                </TableHead>
              ))}
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
                  {columns.map(col => {
                    const isJumma = ['jumma1', 'jumma2', 'jumma3'].includes(col.name);
                    return (
                      <TableCell key={col.name} className='text-center'>
                        {isJumma && !isJummaDay
                          ? '—'
                          : getAdjustedPrayerTime(
                              col.name,
                              col.getTime(day),
                              savedSettings,
                              category
                            )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
