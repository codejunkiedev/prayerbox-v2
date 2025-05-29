import type { AlAdhanPrayerTimes } from '@/types';

interface DateDisplayProps {
  date: AlAdhanPrayerTimes['date'] | undefined;
}

export function DateDisplay({ date }: DateDisplayProps) {
  if (!date) return null;

  return (
    <div className='text-center mb-2 sm:mb-4'>
      <div className='text-sm sm:text-base md:text-lg font-medium text-primary/80'>
        {date.gregorian?.weekday?.en}, {date.gregorian?.day} {date.gregorian?.month?.en}{' '}
        {date.gregorian?.year}
      </div>
      <div className='text-xs sm:text-sm md:text-base text-muted-foreground rtl'>
        {date.hijri?.day} {date.hijri?.month?.ar} {date.hijri?.year}هـ
      </div>
    </div>
  );
}
