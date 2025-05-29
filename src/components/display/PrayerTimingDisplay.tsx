import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui';
import { formatTime } from '@/utils';
import { useDisplayStore } from '@/store';
import { cn } from '@/lib/utils';
import type { AlAdhanPrayerTimes } from '@/types';

interface ClockProps {
  className?: string;
  showSeconds?: boolean;
}

function Clock({ className, showSeconds = false }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatString = showSeconds ? 'h:mm:ss a' : 'h:mm a';

  return <div className={cn('font-mono', className)}>{format(time, formatString)}</div>;
}

interface PrayerTimingDisplayProps {
  prayerTimes: AlAdhanPrayerTimes | null;
}

export function PrayerTimingDisplay({ prayerTimes }: PrayerTimingDisplayProps) {
  const { masjidProfile } = useDisplayStore();

  // Prayer times for today
  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;

  return (
    <div className='flex flex-col h-screen w-full bg-primary-foreground overflow-hidden relative'>
      {/* Background pattern - top left */}
      <div className='absolute top-0 left-0 w-48 h-48 opacity-20'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      {/* Background pattern - bottom right */}
      <div className='absolute bottom-0 right-0 w-48 h-48 opacity-20'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      {/* Main content */}
      <div className='flex flex-col items-center justify-center h-full w-full px-4 py-8 z-10'>
        {/* Current time */}
        <div className='text-center mb-6'>
          <Clock className='text-7xl font-bold text-primary mb-2' showSeconds={true} />

          {/* Date display */}
          <div className='text-center mb-4'>
            <div className='text-lg font-medium text-primary/80'>
              {date?.gregorian?.weekday?.en}, {date?.gregorian?.day} {date?.gregorian?.month?.en}{' '}
              {date?.gregorian?.year}
            </div>
            <div className='text-base text-muted-foreground rtl'>
              {date?.hijri?.day} {date?.hijri?.month?.ar} {date?.hijri?.year}هـ
            </div>
          </div>
        </div>

        {/* Prayer times card */}
        <Card className='w-full max-w-2xl bg-card/95 backdrop-blur-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-col space-y-4'>
              {/* Fajr */}
              <div className='flex justify-between items-center'>
                <div className='text-xl font-semibold'>فجر</div>
                <div className='text-xl'>{timings && formatTime(timings.Fajr)}</div>
              </div>
              <hr className='border-primary/10' />

              {/* Dhuhr */}
              <div className='flex justify-between items-center'>
                <div className='text-xl font-semibold'>ظهر</div>
                <div className='text-xl'>{timings && formatTime(timings.Dhuhr)}</div>
              </div>
              <hr className='border-primary/10' />

              {/* Asr */}
              <div className='flex justify-between items-center'>
                <div className='text-xl font-semibold'>عصر</div>
                <div className='text-xl'>{timings && formatTime(timings.Asr)}</div>
              </div>
              <hr className='border-primary/10' />

              {/* Maghrib */}
              <div className='flex justify-between items-center'>
                <div className='text-xl font-semibold'>مغرب</div>
                <div className='text-xl'>{timings && formatTime(timings.Maghrib)}</div>
              </div>
              <hr className='border-primary/10' />

              {/* Isha */}
              <div className='flex justify-between items-center'>
                <div className='text-xl font-semibold'>عشاء</div>
                <div className='text-xl'>{timings && formatTime(timings.Isha)}</div>
              </div>

              {/* Friday Prayer - Only show if today is Friday */}
              {date?.gregorian?.weekday?.en === 'Friday' && (
                <>
                  <hr className='border-primary/10' />
                  <div className='flex justify-between items-center'>
                    <div className='text-xl font-semibold'>صلاة الجمعة</div>
                    <div className='text-xl'>{timings && formatTime(timings.Dhuhr)}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Masjid name at bottom */}
        <div className='mt-6 text-center'>
          <div className='text-lg font-semibold'>{masjidProfile?.name || 'Masjid'}</div>
          <div className='text-sm text-muted-foreground'>
            {/* Display area or city name if available */}
            {masjidProfile?.latitude && masjidProfile?.longitude
              ? `${prayerTimes?.meta?.timezone || 'Local Time'}`
              : 'Location not set'}
          </div>
        </div>
      </div>
    </div>
  );
}
