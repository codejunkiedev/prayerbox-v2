import type { AlAdhanPrayerTimes } from '@/types';

interface DateDisplayProps {
  date: AlAdhanPrayerTimes['date'] | undefined;
}

export function DateDisplay({ date }: DateDisplayProps) {
  if (!date) return null;

  return (
    <div className='text-center mb-1 sm:mb-2'>
      <div className='text-xs xs:text-sm sm:text-base md:text-lg font-medium text-white'>
        {date.gregorian?.weekday?.en}, {date.gregorian?.day} {date.gregorian?.month?.en}{' '}
        {date.gregorian?.year}
      </div>
      <div className='text-xs xs:text-sm sm:text-base text-white/80 rtl'>
        {date.hijri?.day} {date.hijri?.month?.ar} {date.hijri?.year}هـ
      </div>
    </div>
  );
}
