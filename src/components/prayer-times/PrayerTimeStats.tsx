import { useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { AlAdhanPrayerTimes } from '@/types';
import { parse, differenceInMinutes } from 'date-fns';

interface PrayerTimeStatsProps {
  prayerTimes: AlAdhanPrayerTimes[];
}

export function PrayerTimeStats({ prayerTimes }: PrayerTimeStatsProps) {
  const stats = useMemo(() => {
    if (!prayerTimes || prayerTimes.length === 0) return null;

    // Calculate average time between prayers
    let totalFajrToSunrise = 0;
    let totalSunriseToNoon = 0;
    let totalNoonToAsr = 0;
    let totalAsrToMaghrib = 0;
    let totalMaghribToIsha = 0;
    let totalNightDuration = 0;
    let totalDayDuration = 0;

    prayerTimes.forEach(day => {
      const fajr = parse(day.timings.Fajr, 'HH:mm', new Date());
      const sunrise = parse(day.timings.Sunrise, 'HH:mm', new Date());
      const dhuhr = parse(day.timings.Dhuhr, 'HH:mm', new Date());
      const asr = parse(day.timings.Asr, 'HH:mm', new Date());
      const maghrib = parse(day.timings.Maghrib, 'HH:mm', new Date());
      const isha = parse(day.timings.Isha, 'HH:mm', new Date());

      totalFajrToSunrise += differenceInMinutes(sunrise, fajr);
      totalSunriseToNoon += differenceInMinutes(dhuhr, sunrise);
      totalNoonToAsr += differenceInMinutes(asr, dhuhr);
      totalAsrToMaghrib += differenceInMinutes(maghrib, asr);
      totalMaghribToIsha += differenceInMinutes(isha, maghrib);

      // Calculate day duration (sunrise to maghrib)
      totalDayDuration += differenceInMinutes(maghrib, sunrise);

      // Calculate night duration (maghrib to next fajr)
      // This is approximate as we don't have next day's fajr
      totalNightDuration += 24 * 60 - differenceInMinutes(maghrib, sunrise);
    });

    const count = prayerTimes.length;

    return {
      fajrToSunrise: Math.round(totalFajrToSunrise / count),
      sunriseToNoon: Math.round(totalSunriseToNoon / count),
      noonToAsr: Math.round(totalNoonToAsr / count),
      asrToMaghrib: Math.round(totalAsrToMaghrib / count),
      maghribToIsha: Math.round(totalMaghribToIsha / count),
      dayDuration: Math.round(totalDayDuration / count),
      nightDuration: Math.round(totalNightDuration / count),
    };
  }, [prayerTimes]);

  if (!stats) return null;

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex items-center gap-2'>
          <BarChart2 size={18} />
          Prayer Time Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Average Day Length</p>
              <p className='text-lg font-semibold'>
                {Math.floor(stats.dayDuration / 60)}h {stats.dayDuration % 60}m
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Average Night Length</p>
              <p className='text-lg font-semibold'>
                {Math.floor(stats.nightDuration / 60)}h {stats.nightDuration % 60}m
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <p className='font-medium'>Average Time Between Prayers</p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='p-2 bg-muted/50 rounded-md'>
                <p className='text-sm'>Fajr to Sunrise</p>
                <p className='font-semibold'>
                  {Math.floor(stats.fajrToSunrise / 60)}h {stats.fajrToSunrise % 60}m
                </p>
              </div>
              <div className='p-2 bg-muted/50 rounded-md'>
                <p className='text-sm'>Sunrise to Dhuhr</p>
                <p className='font-semibold'>
                  {Math.floor(stats.sunriseToNoon / 60)}h {stats.sunriseToNoon % 60}m
                </p>
              </div>
              <div className='p-2 bg-muted/50 rounded-md'>
                <p className='text-sm'>Dhuhr to Asr</p>
                <p className='font-semibold'>
                  {Math.floor(stats.noonToAsr / 60)}h {stats.noonToAsr % 60}m
                </p>
              </div>
              <div className='p-2 bg-muted/50 rounded-md'>
                <p className='text-sm'>Asr to Maghrib</p>
                <p className='font-semibold'>
                  {Math.floor(stats.asrToMaghrib / 60)}h {stats.asrToMaghrib % 60}m
                </p>
              </div>
              <div className='p-2 bg-muted/50 rounded-md'>
                <p className='text-sm'>Maghrib to Isha</p>
                <p className='font-semibold'>
                  {Math.floor(stats.maghribToIsha / 60)}h {stats.maghribToIsha % 60}m
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
