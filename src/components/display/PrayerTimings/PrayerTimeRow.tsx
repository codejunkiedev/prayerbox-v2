import { getAdjustedPrayerTime } from '@/utils';
import type { PrayerTimes, PrayerAdjustments } from '@/types';

interface PrayerTimeRowProps {
  prayerName: keyof PrayerAdjustments;
  arabicName: string;
  originalTime: string;
  prayerTimeSettings: PrayerTimes | null;
  showDivider?: boolean;
}

export function PrayerTimeRow({
  prayerName,
  arabicName,
  originalTime,
  prayerTimeSettings,
  showDivider = true,
}: PrayerTimeRowProps) {
  return (
    <>
      <div className='flex justify-between items-center'>
        <div className='text-base xs:text-lg sm:text-xl font-medium text-white'>
          {getAdjustedPrayerTime(prayerName, originalTime, prayerTimeSettings)}
        </div>
        <div className='text-base xs:text-lg sm:text-xl font-semibold text-white'>{arabicName}</div>
      </div>
      {showDivider && <hr className='border-white/20' />}
    </>
  );
}
