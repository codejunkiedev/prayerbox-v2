import { Button } from '@/components/ui';

interface PrayerTimesEmptyProps {
  onConfigure: () => void;
}

export function PrayerTimesEmpty({ onConfigure }: PrayerTimesEmptyProps) {
  return (
    <div className='text-center py-8'>
      <p className='text-lg mb-4'>Click on Settings to configure and fetch prayer times</p>
      <Button onClick={onConfigure}>Configure Prayer Times</Button>
    </div>
  );
}
