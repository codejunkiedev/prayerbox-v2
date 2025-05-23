import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import type { PrayerTimes } from '@/types';

interface PrayerAdjustmentSummaryProps {
  savedSettings: PrayerTimes | null;
}

type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export function PrayerAdjustmentSummary({ savedSettings }: PrayerAdjustmentSummaryProps) {
  if (!savedSettings?.prayer_adjustments) return null;

  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const adjustedPrayers = prayers.filter(prayer => {
    const adjustment = savedSettings.prayer_adjustments?.[prayer];
    return adjustment && adjustment.type !== 'default';
  });

  if (adjustedPrayers.length === 0) {
    return (
      <Card>
        <CardHeader className='bg-primary/5'>
          <CardTitle className='flex items-center gap-2'>
            <Settings size={18} />
            Prayer Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-4'>
          <p className='text-muted-foreground'>No prayer time adjustments have been made.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex items-center gap-2'>
          <Settings size={18} />
          Prayer Adjustments
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='space-y-4'>
          {adjustedPrayers.map(prayer => {
            const adjustment = savedSettings.prayer_adjustments?.[prayer];
            if (!adjustment || adjustment.type === 'default') return null;

            return (
              <div key={prayer} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>{PRAYER_LABELS[prayer]}</span>
                  <Badge variant={adjustment.type === 'offset' ? 'secondary' : 'outline'}>
                    {adjustment.type === 'offset' ? 'Offset' : 'Manual'}
                  </Badge>
                </div>
                <div className='text-sm'>
                  {adjustment.type === 'offset' && adjustment.offset !== undefined && (
                    <span>
                      {adjustment.offset > 0 ? '+' : ''}
                      {adjustment.offset} minutes
                    </span>
                  )}
                  {adjustment.type === 'manual' && adjustment.manual_time && (
                    <span>Set to {adjustment.manual_time}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
