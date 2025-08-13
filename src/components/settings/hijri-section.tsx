import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui';
import { fetchHijriDate } from '@/api/aladhan';
import { HijriCalculationMethod } from '@/constants';
import { updateHijriSettings } from '@/lib/supabase';
import type { Settings } from '@/types';
import { addOrSubtractDays } from '@/utils';

interface HijriSectionProps {
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
}

export function HijriSection({ settings, onSettingsChange }: HijriSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHijriDate, setIsLoadingHijriDate] = useState(false);
  const [currentHijriDate, setCurrentHijriDate] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<HijriCalculationMethod>(
    settings?.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura
  );
  const [selectedOffset, setSelectedOffset] = useState<number>(settings?.hijri_offset || 0);

  const offsetOptions = [
    { value: -2, label: '-2 days' },
    { value: -1, label: '-1 day' },
    { value: 0, label: '0 days' },
    { value: 1, label: '+1 day' },
    { value: 2, label: '+2 days' },
  ];

  const fetchHijriDateWithOffset = useCallback(async () => {
    try {
      setIsLoadingHijriDate(true);

      // Calculate the target date (today + offset) using date-fns
      const today = new Date();
      const targetDate = addOrSubtractDays(today, selectedOffset);

      // Make a single API call for the target date
      const response = await fetchHijriDate({
        date: targetDate,
        method: selectedMethod,
      });

      if (response.data?.hijri) {
        const hijriData = response.data.hijri;
        const displayDate = `${hijriData.day} ${hijriData.month.en}, ${hijriData.year}`;
        setCurrentHijriDate(displayDate);
      }
    } catch (error) {
      console.error('Error fetching Hijri date:', error);
      toast.error('Failed to fetch current Hijri date');
    } finally {
      setIsLoadingHijriDate(false);
    }
  }, [selectedMethod, selectedOffset]);

  useEffect(() => {
    if (settings?.hijri_calculation_method) {
      setSelectedMethod(settings.hijri_calculation_method);
    }
    if (settings?.hijri_offset !== undefined) {
      setSelectedOffset(settings.hijri_offset);
    }
  }, [settings]);

  useEffect(() => {
    fetchHijriDateWithOffset();
  }, [fetchHijriDateWithOffset]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const updatedSettings = await updateHijriSettings(selectedMethod, selectedOffset);
      onSettingsChange(updatedSettings);
      toast.success('Hijri settings updated successfully');
    } catch (error) {
      console.error('Error updating Hijri settings:', error);
      toast.error('Failed to update Hijri settings');
    } finally {
      setIsSaving(false);
    }
  };

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
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Current Hijri Date
            </label>
            <div className='p-3 bg-gray-50 rounded-lg border'>
              {isLoadingHijriDate ? (
                <div className='text-gray-500 flex items-center gap-2'>
                  <div className='animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full'></div>
                  Calculating...
                </div>
              ) : (
                <div className='font-semibold text-gray-900'>
                  {currentHijriDate || 'Unable to fetch date'}
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Calculation Method
              </label>
              <Select
                value={selectedMethod}
                onValueChange={(value: HijriCalculationMethod) => setSelectedMethod(value)}
              >
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
              <label className='block text-sm font-medium text-gray-700 mb-2'>Date Offset</label>
              <Select
                value={selectedOffset.toString()}
                onValueChange={(value: string) => setSelectedOffset(parseInt(value))}
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

        <div className='flex justify-end'>
          <Button onClick={handleSave} disabled={isSaving} loading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
