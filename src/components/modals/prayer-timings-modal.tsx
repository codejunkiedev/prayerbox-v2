import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  RadioGroup,
  RadioGroupItem,
  Slider,
  TimePicker,
} from '@/components/ui';
import { prayerAdjustmentsFormSchema, type PrayerAdjustmentsFormData } from '@/lib/zod';
import { savePrayerAdjustments } from '@/lib/supabase';
import { Plus, Minus } from 'lucide-react';
import { parseTimeString, formatTimeString } from '@/utils';
import type { PrayerAdjustments } from '@/types';

interface PrayerTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues: PrayerAdjustmentsFormData | null;
}

type PrayerName = keyof PrayerAdjustments;
type PrayerAdjustmentType = PrayerAdjustments[PrayerName]['type'];
const PRAYER_NAMES: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'jumma1',
  'jumma2',
  'jumma3',
  'asr',
  'maghrib',
  'isha',
];

/**
 * Modal component for configuring prayer time settings including calculation methods, juristic schools, and individual prayer adjustments
 */
export function PrayerTimingsModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: PrayerTimingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, setValue, watch } = useForm<PrayerAdjustmentsFormData>({
    resolver: zodResolver(prayerAdjustmentsFormSchema),
    defaultValues: {
      prayer_adjustments: initialValues?.prayer_adjustments ?? {
        fajr: { type: 'default' },
        sunrise: { type: 'default' },
        dhuhr: { type: 'default' },
        asr: { type: 'default' },
        maghrib: { type: 'default' },
        isha: { type: 'default' },
        jumma1: { type: 'default' },
        jumma2: { type: 'default' },
        jumma3: { type: 'default' },
      },
    },
  });

  useEffect(() => {
    if (initialValues?.prayer_adjustments) {
      setValue('prayer_adjustments', initialValues.prayer_adjustments);
    }
  }, [initialValues, setValue]);

  const onFormSubmit = async (data: PrayerAdjustmentsFormData) => {
    try {
      setIsSubmitting(true);
      await savePrayerAdjustments(data);

      onSubmit();
      onClose();
      toast.success('Prayer time settings saved successfully');
    } catch (error) {
      console.error('Error saving prayer time settings:', error);
      toast.error('Failed to save prayer time settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prayerAdjustments = watch('prayer_adjustments');

  const handlePrayerTypeChange = (prayer: PrayerName, type: PrayerAdjustmentType): void => {
    setValue(`prayer_adjustments.${prayer}.type`, type);
    if (type === 'offset') {
      setValue(`prayer_adjustments.${prayer}.manual_time`, undefined);
    } else if (type === 'manual') {
      setValue(`prayer_adjustments.${prayer}.offset`, undefined);
    } else if (type === 'default') {
      setValue(`prayer_adjustments.${prayer}.offset`, undefined);
      setValue(`prayer_adjustments.${prayer}.manual_time`, undefined);
    }
  };

  const handleOffsetChange = (prayer: PrayerName, value: number[]): void => {
    setValue(`prayer_adjustments.${prayer}.offset`, value[0]);
  };

  const renderPrayerAdjustment = (prayer: PrayerName) => {
    const type = prayerAdjustments?.[prayer]?.type || 'default';
    const offset = prayerAdjustments?.[prayer]?.offset || 0;
    const manualTime = prayerAdjustments?.[prayer]?.manual_time || '';

    const offsetValue = Math.abs(offset);
    const hours = Math.floor(offsetValue / 60);
    const minutes = offsetValue % 60;

    const getStringFromTime = (time: Date): string => {
      return formatTimeString(time);
    };

    const timeValue = parseTimeString(manualTime);

    const handleTimeChange = (time: Date): void => {
      setValue(`prayer_adjustments.${prayer}.manual_time`, getStringFromTime(time));
    };

    const getJummaLabel = () => {
      if (prayer === 'jumma1') return 'Jumma 1';
      if (prayer === 'jumma2') return 'Jumma 2';
      if (prayer === 'jumma3') return 'Jumma 3';
      return prayer;
    };

    const isJummaPrayer = ['jumma1', 'jumma2', 'jumma3'].includes(prayer);

    return (
      <AccordionItem value={prayer} key={prayer}>
        <AccordionTrigger className='text-sm font-medium py-2 capitalize'>
          {isJummaPrayer ? getJummaLabel() : prayer}
        </AccordionTrigger>
        <AccordionContent>
          {isJummaPrayer && (
            <p className='text-xs text-muted-foreground mb-3'>
              This adjustment applies only on Fridays.
            </p>
          )}
          <div className='space-y-4'>
            <RadioGroup
              value={type}
              onValueChange={value => handlePrayerTypeChange(prayer, value as PrayerAdjustmentType)}
              className='flex flex-row gap-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='default' id={`${prayer}-default`} />
                <Label htmlFor={`${prayer}-default`}>Default</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='offset' id={`${prayer}-offset`} />
                <Label htmlFor={`${prayer}-offset`}>Offset</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='manual' id={`${prayer}-manual`} />
                <Label htmlFor={`${prayer}-manual`}>Manual</Label>
              </div>
            </RadioGroup>

            {type === 'offset' && (
              <div className='space-y-3'>
                <div className='flex flex-row xs:flex-row justify-between items-start xs:items-center gap-2'>
                  <Label>
                    {offset > 0 ? '+' : offset < 0 ? '-' : ''}
                    {hours > 0 ? `${hours.toString().padStart(2, '0')}h ` : ''}
                    {minutes.toString().padStart(2, '0')}m
                  </Label>
                  <div className='flex items-center gap-1 text-xs'>
                    <Minus className='h-3 w-3 text-muted-foreground' />
                    <span className='text-muted-foreground'>Earlier</span>
                    <span className='mx-1'>|</span>
                    <span className='text-muted-foreground'>Later</span>
                    <Plus className='h-3 w-3 text-muted-foreground' />
                  </div>
                </div>
                <Slider
                  defaultValue={[offset]}
                  min={-120}
                  max={120}
                  step={1}
                  onValueChange={value => handleOffsetChange(prayer, value)}
                />
              </div>
            )}

            {type === 'manual' && (
              <div className='space-y-2'>
                <Label htmlFor={`${prayer}-manual-time`}>Select Time</Label>
                <TimePicker time={timeValue} setTime={handleTimeChange} minuteInterval={1} />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Prayer Time Adjustments</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4 py-4'>
          <p className='text-sm text-muted-foreground'>
            Adjust prayer times by setting an offset (minutes earlier/later) or manually entering a
            specific time.
          </p>

          <Accordion type='single' collapsible className='w-full'>
            {PRAYER_NAMES.map(prayer => renderPrayerAdjustment(prayer))}
          </Accordion>

          <DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-0'>
            <Button type='button' variant='outline' onClick={onClose} className='w-full sm:w-auto'>
              Cancel
            </Button>
            <Button
              type='submit'
              loading={isSubmitting}
              disabled={isSubmitting}
              className='w-full sm:w-auto'
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
