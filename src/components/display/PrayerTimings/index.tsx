import { formatTime, isFridayPrayer, PRAYER_NAMES } from '@/utils';
import { useDisplayStore } from '@/store';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { Clock } from '@/components/common';
import { DateDisplay } from './DateDisplay';
import { PrayerTimeRow } from './PrayerTimeRow';
import { JummaPrayersList } from './JummaPrayersList';
import { MasjidInfo } from './MasjidInfo';
import bgImage from '@/assets/backgrounds/05.jpeg';

interface PrayerTimingDisplayProps {
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
}

export function PrayerTimingDisplay({ prayerTimes, prayerTimeSettings }: PrayerTimingDisplayProps) {
  const { masjidProfile } = useDisplayStore();

  const timings = prayerTimes?.timings;
  const date = prayerTimes?.date;
  const isFriday = isFridayPrayer(date);

  if (!timings) return null;

  return (
    <div
      className='flex flex-col min-h-screen w-full overflow-hidden relative bg-cover bg-center'
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm z-0'></div>
      <div className='flex flex-col items-center justify-between min-h-screen w-full px-2 sm:px-4 py-2 sm:py-4 lg:py-6 z-10 overflow-y-auto text-white'>
        <div className='text-center mb-2 sm:mb-4 pt-2 sm:pt-4'>
          <Clock
            className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2'
            showSeconds={true}
          />
          <DateDisplay date={date} />
        </div>

        <div className='w-full max-w-[90%] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-10'>
          <div className='p-2 xs:p-3 sm:p-4 md:p-6'>
            <div className='flex flex-col space-y-1 xs:space-y-2 sm:space-y-3 md:space-y-4'>
              <PrayerTimeRow
                prayerName='fajr'
                arabicName={PRAYER_NAMES.fajr}
                originalTime={formatTime(timings.Fajr)}
                prayerTimeSettings={prayerTimeSettings}
              />

              <PrayerTimeRow
                prayerName='sunrise'
                arabicName={PRAYER_NAMES.sunrise}
                originalTime={formatTime(timings.Sunrise)}
                prayerTimeSettings={prayerTimeSettings}
              />

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

              <PrayerTimeRow
                prayerName='asr'
                arabicName={PRAYER_NAMES.asr}
                originalTime={formatTime(timings.Asr)}
                prayerTimeSettings={prayerTimeSettings}
              />

              <PrayerTimeRow
                prayerName='maghrib'
                arabicName={PRAYER_NAMES.maghrib}
                originalTime={formatTime(timings.Maghrib)}
                prayerTimeSettings={prayerTimeSettings}
              />

              <PrayerTimeRow
                prayerName='isha'
                arabicName={PRAYER_NAMES.isha}
                originalTime={formatTime(timings.Isha)}
                prayerTimeSettings={prayerTimeSettings}
                showDivider={false}
              />
            </div>
          </div>
        </div>

        <MasjidInfo masjidProfile={masjidProfile} />
      </div>
    </div>
  );
}
