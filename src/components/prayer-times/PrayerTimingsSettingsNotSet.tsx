import { Button } from '@/components/ui';

interface PrayerTimingsSettingsNotSetProps {
  onConfigure: () => void;
}

export function PrayerTimingsSettingsNotSet({ onConfigure }: PrayerTimingsSettingsNotSetProps) {
  return (
    <div className='text-center py-8'>
      <p className='text-lg mb-4'>Please set your prayer time settings in the profile page</p>
      <Button onClick={onConfigure}>Configure Prayer Times</Button>
    </div>
  );
}
