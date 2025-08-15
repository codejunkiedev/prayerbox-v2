import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';
import { HijriCalculationMethod } from '@/constants';
import { updateHijriSettings } from '@/lib/supabase';
import { useAdjustedHijriDate } from '@/hooks';
import type { Settings } from '@/types';

interface HijriSectionProps {
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
  isLoading: boolean;
}

export function HijriSection({ settings, onSettingsChange, isLoading }: HijriSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<HijriCalculationMethod>(
    settings?.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura
  );
  const [selectedOffset, setSelectedOffset] = useState<number>(settings?.hijri_offset || 0);

  const { adjustedHijriDate, isLoading: isLoadingAdjustedHijriDate } = useAdjustedHijriDate({
    calculationMethod: selectedMethod,
    offset: selectedOffset,
  });

  const offsetOptions = [
    { value: -2, label: '-2 days' },
    { value: -1, label: '-1 day' },
    { value: 0, label: '0 days' },
    { value: 1, label: '+1 day' },
    { value: 2, label: '+2 days' },
  ];

  useEffect(() => {
    if (isLoading) return;

    if (settings?.hijri_calculation_method) {
      setSelectedMethod(settings.hijri_calculation_method);
    }
    if (settings?.hijri_offset !== undefined) {
      setSelectedOffset(settings.hijri_offset);
    }
  }, [settings, isLoading]);

  const handleAutoSave = async (method: HijriCalculationMethod, offset: number) => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const updatedSettings = await updateHijriSettings(method, offset);
      onSettingsChange(updatedSettings);
      toast.success('Hijri settings updated successfully');
    } catch (error) {
      console.error('Error updating Hijri settings:', error);
      toast.error('Failed to update Hijri settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMethodChange = (value: HijriCalculationMethod) => {
    if (value === selectedMethod) return;
    setSelectedMethod(value);
    handleAutoSave(value, selectedOffset);
  };

  const handleOffsetChange = (value: string) => {
    const offset = parseInt(value);
    if (offset === selectedOffset) return;
    setSelectedOffset(offset);
    handleAutoSave(selectedMethod, offset);
  };

  if (isLoading) return <div className='animate-pulse bg-muted rounded-lg h-48'></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hijri Date Adjustment</CardTitle>
        <CardDescription>
          Configure the Hijri calendar calculation method and date offset for accurate Islamic
          dates.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              Current Hijri Date
            </label>
            <div className='p-3 bg-muted rounded-lg border'>
              {isLoadingAdjustedHijriDate ? (
                <div className='text-muted-foreground flex items-center gap-2'>
                  <div className='animate-spin h-4 w-4 border-2 border-muted border-t-foreground rounded-full'></div>
                  Calculating...
                </div>
              ) : (
                <div className='font-semibold text-foreground'>
                  {adjustedHijriDate || 'Unable to fetch date'}
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Calculation Method
              </label>
              <Select value={selectedMethod} onValueChange={handleMethodChange} disabled={isSaving}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HijriCalculationMethod).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>Date Offset</label>
              <Select
                value={selectedOffset.toString()}
                onValueChange={handleOffsetChange}
                disabled={isSaving}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {offsetOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isSaving && (
          <div className='flex items-center justify-center py-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <div className='animate-spin h-4 w-4 border-2 border-muted border-t-foreground rounded-full'></div>
              Saving settings...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
