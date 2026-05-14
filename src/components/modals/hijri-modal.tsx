import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { HijriCalculationMethod } from '@/constants';
import { updateHijriSettings } from '@/lib/supabase';
import { useAdjustedHijriDate } from '@/hooks';
import type { Settings } from '@/types';

interface HijriModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
}

const OFFSET_OPTIONS = [
  { value: -2, label: '-2 days' },
  { value: -1, label: '-1 day' },
  { value: 0, label: '0 days' },
  { value: 1, label: '+1 day' },
  { value: 2, label: '+2 days' },
];

export function HijriModal({ isOpen, onClose, settings, onSettingsChange }: HijriModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<HijriCalculationMethod>(
    settings?.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura
  );
  const [selectedOffset, setSelectedOffset] = useState<number>(settings?.hijri_offset ?? 0);

  const { adjustedHijriDate, isLoading: isLoadingAdjustedHijriDate } = useAdjustedHijriDate({
    calculationMethod: selectedMethod,
    offset: selectedOffset,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (settings?.hijri_calculation_method) {
      setSelectedMethod(settings.hijri_calculation_method);
    }
    if (settings?.hijri_offset !== undefined) {
      setSelectedOffset(settings.hijri_offset);
    }
  }, [isOpen, settings]);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const updated = await updateHijriSettings(selectedMethod, selectedOffset);
      onSettingsChange(updated);
      toast.success('Hijri settings updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating Hijri settings:', error);
      toast.error('Failed to update Hijri settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isSubmitting && onClose()}>
      <DialogContent className='sm:max-w-[640px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Hijri Date Adjustment</DialogTitle>
          <DialogDescription>
            Configure the Hijri calendar calculation method and date offset for accurate Islamic
            dates.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div>
            <Label className='block text-sm font-medium text-foreground mb-2'>
              Current Hijri Date
            </Label>
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
              <Label className='block text-sm font-medium text-foreground mb-2'>
                Calculation Method
              </Label>
              <Select
                value={selectedMethod}
                onValueChange={v => setSelectedMethod(v as HijriCalculationMethod)}
                disabled={isSubmitting}
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
              <Label className='block text-sm font-medium text-foreground mb-2'>Date Offset</Label>
              <Select
                value={selectedOffset.toString()}
                onValueChange={v => setSelectedOffset(parseInt(v))}
                disabled={isSubmitting}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OFFSET_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
