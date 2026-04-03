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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { prayerAdjustmentsFormSchema, type PrayerAdjustmentsFormData } from '@/lib/zod';
import { savePrayerAdjustments } from '@/lib/supabase';
import { Plus, Minus } from 'lucide-react';
import { parseTimeString, formatTimeString } from '@/utils';
import type { AdjustmentCategory, PrayerAdjustments, SingleAdjustment } from '@/types';

interface PrayerTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues: PrayerAdjustmentsFormData | null;
}

type PrayerName = keyof PrayerAdjustments;
type AdjustmentType = SingleAdjustment['type'];

const PRAYER_LIST: { name: PrayerName; label: string }[] = [
  { name: 'fajr', label: 'Fajr' },
  { name: 'sunrise', label: 'Sunrise' },
  { name: 'dhuhr', label: 'Dhuhr' },
  { name: 'jumma1', label: 'Jumma 1' },
  { name: 'jumma2', label: 'Jumma 2' },
  { name: 'jumma3', label: 'Jumma 3' },
  { name: 'asr', label: 'Asr' },
  { name: 'maghrib', label: 'Maghrib' },
  { name: 'isha', label: 'Isha' },
];

const CATEGORIES: { key: AdjustmentCategory; label: string }[] = [
  { key: 'starts', label: 'Starts' },
  { key: 'athan', label: 'Athan' },
  { key: 'iqamah', label: 'Iqamah' },
];

const DEFAULT_SINGLE = { type: 'default' as const };

const DEFAULT_ADJUSTMENT: PrayerAdjustmentsFormData['prayer_adjustments'] = {
  fajr: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  sunrise: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  dhuhr: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  asr: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  maghrib: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  isha: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  jumma1: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  jumma2: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
  jumma3: { starts: DEFAULT_SINGLE, athan: DEFAULT_SINGLE, iqamah: DEFAULT_SINGLE },
};

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
      prayer_adjustments: initialValues?.prayer_adjustments ?? DEFAULT_ADJUSTMENT,
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

  const handleTypeChange = (
    prayer: PrayerName,
    category: AdjustmentCategory,
    type: AdjustmentType
  ): void => {
    setValue(`prayer_adjustments.${prayer}.${category}.type`, type);
    if (type === 'offset') {
      setValue(`prayer_adjustments.${prayer}.${category}.manual_time`, undefined);
    } else if (type === 'manual') {
      setValue(`prayer_adjustments.${prayer}.${category}.offset`, undefined);
    } else if (type === 'default') {
      setValue(`prayer_adjustments.${prayer}.${category}.offset`, undefined);
      setValue(`prayer_adjustments.${prayer}.${category}.manual_time`, undefined);
    }
  };

  const getAdjustmentSummary = (adj: SingleAdjustment | undefined): string => {
    if (!adj || adj.type === 'default') return 'Default';
    if (adj.type === 'offset' && adj.offset !== undefined) {
      const sign = adj.offset > 0 ? '+' : adj.offset < 0 ? '-' : '';
      const abs = Math.abs(adj.offset);
      const h = Math.floor(abs / 60);
      const m = abs % 60;
      return `${sign}${h > 0 ? `${h}h ` : ''}${m}m`;
    }
    if (adj.type === 'manual' && adj.manual_time) {
      return adj.manual_time;
    }
    return 'Default';
  };

  const renderAdjustmentControls = (prayer: PrayerName, category: AdjustmentCategory) => {
    const adj = prayerAdjustments?.[prayer]?.[category];
    const type = adj?.type || 'default';
    const offset = adj?.offset || 0;
    const manualTime = adj?.manual_time || '';
    const id = `${prayer}-${category}`;

    const offsetValue = Math.abs(offset);
    const hours = Math.floor(offsetValue / 60);
    const minutes = offsetValue % 60;

    return (
      <div className='space-y-3 pt-2'>
        <RadioGroup
          value={type}
          onValueChange={value => handleTypeChange(prayer, category, value as AdjustmentType)}
          className='flex flex-row gap-4'
        >
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='default' id={`${id}-default`} />
            <Label htmlFor={`${id}-default`}>Default</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='offset' id={`${id}-offset`} />
            <Label htmlFor={`${id}-offset`}>Offset</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='manual' id={`${id}-manual`} />
            <Label htmlFor={`${id}-manual`}>Manual</Label>
          </div>
        </RadioGroup>

        {type === 'offset' && (
          <div className='space-y-3'>
            <div className='flex flex-row justify-between items-start gap-2'>
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
              onValueChange={value =>
                setValue(`prayer_adjustments.${prayer}.${category}.offset`, value[0])
              }
            />
          </div>
        )}

        {type === 'manual' && (
          <div className='space-y-2'>
            <Label htmlFor={`${id}-manual-time`}>Select Time</Label>
            <TimePicker
              time={parseTimeString(manualTime)}
              setTime={time =>
                setValue(
                  `prayer_adjustments.${prayer}.${category}.manual_time`,
                  formatTimeString(time)
                )
              }
              minuteInterval={1}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Prayer Time Adjustments</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4 py-2'>
          <Tabs defaultValue='starts' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat.key} value={cat.key}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(cat => (
              <TabsContent key={cat.key} value={cat.key} className='pt-2'>
                <Accordion type='single' collapsible className='w-full'>
                  {PRAYER_LIST.map(prayer => {
                    const adj = prayerAdjustments?.[prayer.name]?.[cat.key];
                    const summary = getAdjustmentSummary(adj);
                    const isDefault = !adj || adj.type === 'default';

                    return (
                      <AccordionItem value={prayer.name} key={prayer.name}>
                        <AccordionTrigger className='py-2.5 hover:no-underline'>
                          <div className='flex items-center justify-between w-full pr-2'>
                            <span className='text-sm font-medium'>{prayer.label}</span>
                            <span
                              className={`text-xs ${isDefault ? 'text-muted-foreground' : 'text-primary font-medium'}`}
                            >
                              {summary}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {['jumma1', 'jumma2', 'jumma3'].includes(prayer.name) && (
                            <p className='text-xs text-muted-foreground mb-2'>
                              This adjustment applies only on Fridays.
                            </p>
                          )}
                          {renderAdjustmentControls(prayer.name, cat.key)}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>

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
