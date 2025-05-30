import { formatTime, isPrayerAdjusted } from '@/utils';
import type { PrayerTimes } from '@/types';
import { PrayerTimeRow } from './prayer-time-row';

interface JummaPrayersListProps {
  dhuhrTime: string;
  prayerTimeSettings: PrayerTimes | null;
}

export function JummaPrayersList({ dhuhrTime, prayerTimeSettings }: JummaPrayersListProps) {
  const hasAnyJummaAdjustments =
    isPrayerAdjusted('jumma1', prayerTimeSettings) ||
    isPrayerAdjusted('jumma2', prayerTimeSettings) ||
    isPrayerAdjusted('jumma3', prayerTimeSettings);

  if (!hasAnyJummaAdjustments) {
    return (
      <>
        <div className='flex justify-between items-center'>
          <div className='text-base xs:text-lg sm:text-xl font-medium text-white'>
            {formatTime(dhuhrTime)}
          </div>
          <div className='text-base xs:text-lg sm:text-xl font-semibold text-white'>جمعة</div>
        </div>
        <hr className='border-white/20' />
      </>
    );
  }

  return (
    <>
      {isPrayerAdjusted('jumma1', prayerTimeSettings) && (
        <PrayerTimeRow
          prayerName='jumma1'
          arabicName='جمعة ١'
          originalTime={formatTime(dhuhrTime)}
          prayerTimeSettings={prayerTimeSettings}
        />
      )}

      {isPrayerAdjusted('jumma2', prayerTimeSettings) && (
        <PrayerTimeRow
          prayerName='jumma2'
          arabicName='جمعة ٢'
          originalTime={formatTime(dhuhrTime)}
          prayerTimeSettings={prayerTimeSettings}
        />
      )}

      {isPrayerAdjusted('jumma3', prayerTimeSettings) && (
        <PrayerTimeRow
          prayerName='jumma3'
          arabicName='جمعة ٣'
          originalTime={formatTime(dhuhrTime)}
          prayerTimeSettings={prayerTimeSettings}
        />
      )}
    </>
  );
}
