import { format, parse, addMinutes } from 'date-fns';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';

interface TodayPrayerTimesProps {
  prayerTimes: AlAdhanPrayerTimes | null;
  savedSettings: PrayerTimes | null;
}

type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export function TodayPrayerTimes({ prayerTimes, savedSettings }: TodayPrayerTimesProps) {
  if (!prayerTimes) return null;

  // Helper function to format prayer times
  const formatTime = (timeString: string) => {
    try {
      return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  // Get adjusted prayer time based on settings
  const getAdjustedPrayerTime = (prayerName: PrayerName, originalTime: string) => {
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

  // Get the next prayer time
  const getNextPrayer = () => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const prayers: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const prayer of prayers) {
      const prayerTime = getAdjustedPrayerTime(prayer, prayerTimes.timings[prayer]);
      if (prayerTime > currentTime) {
        return prayer;
      }
    }

    return 'Fajr'; // Default to Fajr if all prayers have passed
  };

  const nextPrayer = getNextPrayer();

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex items-center gap-2'>
          <Clock size={18} />
          Today's Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='grid grid-cols-2 gap-4'>
          {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map(prayer => (
            <div
              key={prayer}
              className={`p-3 rounded-md ${prayer === nextPrayer ? 'bg-primary/10 border border-primary/20' : ''}`}
            >
              <div className='flex justify-between items-center'>
                <p className='font-medium'>{prayer}</p>
                {isPrayerAdjusted(prayer.toLowerCase()) && (
                  <span className='text-xs px-1.5 py-0.5 bg-muted rounded-full'>Adjusted</span>
                )}
              </div>
              <p className='text-lg font-semibold'>
                {formatTime(getAdjustedPrayerTime(prayer, prayerTimes.timings[prayer]))}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
