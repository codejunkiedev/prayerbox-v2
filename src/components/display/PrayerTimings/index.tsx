import { formatTime, isFridayPrayer, PRAYER_NAMES } from '@/utils';
import { useDisplayStore } from '@/store';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { Clock } from '@/components/common';
import { DateDisplay } from './DateDisplay';
import { PrayerTimeRow } from './PrayerTimeRow';
import { JummaPrayersList } from './JummaPrayersList';
import { MasjidInfo } from './MasjidInfo';
import bgImage from '@/assets/backgrounds/05.jpeg';
import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className='absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm z-0'
      ></motion.div>

      <div className='flex flex-col items-center justify-between min-h-screen w-full px-2 sm:px-4 py-2 sm:py-4 lg:py-6 z-10 overflow-y-auto text-white'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-2 sm:mb-4 pt-2 sm:pt-4'
        >
          <Clock
            className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2'
            showSeconds={true}
          />
          <DateDisplay date={date} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='w-full max-w-[90%] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-10'
        >
          <motion.div
            initial={{ boxShadow: '0 0 0 rgba(255,255,255,0)' }}
            animate={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className='p-2 xs:p-3 sm:p-4 md:p-6 bg-black/20 backdrop-blur-md rounded-xl'
          >
            <div className='flex flex-col space-y-1 xs:space-y-2 sm:space-y-3 md:space-y-4'>
              <PrayerTimeRow
                prayerName='fajr'
                arabicName={PRAYER_NAMES.fajr}
                originalTime={formatTime(timings.Fajr)}
                prayerTimeSettings={prayerTimeSettings}
                animationDelay={0.1}
              />

              <PrayerTimeRow
                prayerName='sunrise'
                arabicName={PRAYER_NAMES.sunrise}
                originalTime={formatTime(timings.Sunrise)}
                prayerTimeSettings={prayerTimeSettings}
                animationDelay={0.2}
              />

              {!isFriday ? (
                <PrayerTimeRow
                  prayerName='dhuhr'
                  arabicName={PRAYER_NAMES.dhuhr}
                  originalTime={formatTime(timings.Dhuhr)}
                  prayerTimeSettings={prayerTimeSettings}
                  animationDelay={0.3}
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
                animationDelay={0.4}
              />

              <PrayerTimeRow
                prayerName='maghrib'
                arabicName={PRAYER_NAMES.maghrib}
                originalTime={formatTime(timings.Maghrib)}
                prayerTimeSettings={prayerTimeSettings}
                animationDelay={0.5}
              />

              <PrayerTimeRow
                prayerName='isha'
                arabicName={PRAYER_NAMES.isha}
                originalTime={formatTime(timings.Isha)}
                prayerTimeSettings={prayerTimeSettings}
                showDivider={false}
                animationDelay={0.6}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <MasjidInfo masjidProfile={masjidProfile} />
        </motion.div>
      </div>
    </div>
  );
}
