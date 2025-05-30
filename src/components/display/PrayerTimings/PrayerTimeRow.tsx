import { getAdjustedPrayerTime } from '@/utils';
import type { PrayerTimes, PrayerAdjustments } from '@/types';
import { motion } from 'framer-motion';

interface PrayerTimeRowProps {
  prayerName: keyof PrayerAdjustments;
  arabicName: string;
  originalTime: string;
  prayerTimeSettings: PrayerTimes | null;
  showDivider?: boolean;
  animationDelay?: number;
}

export function PrayerTimeRow({
  prayerName,
  arabicName,
  originalTime,
  prayerTimeSettings,
  showDivider = true,
  animationDelay = 0,
}: PrayerTimeRowProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: animationDelay }}
        className='flex justify-between items-center'
      >
        <div className='text-base xs:text-lg sm:text-xl font-medium text-white'>
          {getAdjustedPrayerTime(prayerName, originalTime, prayerTimeSettings)}
        </div>
        <div className='text-base xs:text-lg sm:text-xl font-semibold text-white'>{arabicName}</div>
      </motion.div>
      {showDivider && (
        <motion.hr
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: animationDelay + 0.1 }}
          className='border-white/20'
        />
      )}
    </>
  );
}
