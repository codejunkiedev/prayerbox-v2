import { Card, CardContent } from '@/components/ui';
import { formatTime, isFridayPrayer, PRAYER_NAMES } from '@/utils';
import { useDisplayStore } from '@/store';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { Clock } from '@/components/common';
import { PrayerTimeRow, DateDisplay, BackgroundPatterns, MasjidInfo, JummaPrayersList } from './';

interface PrayerTimingDisplayProps {
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
}

export function PrayerTimingDisplay({ prayerTimes, prayerTimeSettings }: PrayerTimingDisplayProps) {
  const { masjidProfile } = useDisplayStore();

  // Prayer times for today
  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;
  const isFriday = isFridayPrayer(date);

  if (!timings) return null;

  return (
    <div className='flex flex-col min-h-screen w-full bg-primary-foreground overflow-hidden relative'>
      <BackgroundPatterns />

      {/* Main content */}
      <div className='flex flex-col items-center justify-center min-h-screen w-full px-2 sm:px-4 py-4 sm:py-6 lg:py-8 z-10'>
        {/* Current time */}
        <div className='text-center mb-4 sm:mb-6'>
          <Clock
            className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-2'
            showSeconds={true}
          />
          <DateDisplay date={date} />
        </div>

        {/* Prayer times card */}
        <Card className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl bg-card/95 backdrop-blur-sm'>
          <CardContent className='p-3 sm:p-4 md:p-6'>
            <div className='flex flex-col space-y-2 sm:space-y-3 md:space-y-4'>
              {/* Fajr */}
              <PrayerTimeRow
                prayerName='fajr'
                arabicName={PRAYER_NAMES.fajr}
                originalTime={formatTime(timings.Fajr)}
                prayerTimeSettings={prayerTimeSettings}
              />

              {/* Sunrise */}
              <PrayerTimeRow
                prayerName='sunrise'
                arabicName={PRAYER_NAMES.sunrise}
                originalTime={formatTime(timings.Sunrise)}
                prayerTimeSettings={prayerTimeSettings}
              />

              {/* Dhuhr or Jumma prayers based on day */}
              {!isFriday ? (
                <PrayerTimeRow
                  prayerName='dhuhr'
                  arabicName={PRAYER_NAMES.dhuhr}
                  originalTime={formatTime(timings.Dhuhr)}
                  prayerTimeSettings={prayerTimeSettings}
                />
              ) : (
                <JummaPrayersList
                  dhuhrTime={timings.Dhuhr}
                  prayerTimeSettings={prayerTimeSettings}
                />
              )}

              {/* Asr */}
              <PrayerTimeRow
                prayerName='asr'
                arabicName={PRAYER_NAMES.asr}
                originalTime={formatTime(timings.Asr)}
                prayerTimeSettings={prayerTimeSettings}
              />

              {/* Maghrib */}
              <PrayerTimeRow
                prayerName='maghrib'
                arabicName={PRAYER_NAMES.maghrib}
                originalTime={formatTime(timings.Maghrib)}
                prayerTimeSettings={prayerTimeSettings}
              />

              {/* Isha */}
              <PrayerTimeRow
                prayerName='isha'
                arabicName={PRAYER_NAMES.isha}
                originalTime={formatTime(timings.Isha)}
                prayerTimeSettings={prayerTimeSettings}
                showDivider={false}
              />
            </div>
          </CardContent>
        </Card>

        <MasjidInfo masjidProfile={masjidProfile} prayerTimes={prayerTimes} />
      </div>
    </div>
  );
}
