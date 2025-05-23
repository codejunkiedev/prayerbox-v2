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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  RadioGroup,
  RadioGroupItem,
  Slider,
  TimePicker,
} from '@/components/ui';
import { CalculationMethod, JuristicSchool } from '@/constants';
import { prayerTimingsFormSchema, type PrayerTimingsData } from '@/lib/zod';
import { savePrayerTimeSettings } from '@/lib/supabase';
import { MapPin, Clock, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router';
import { AppRoutes } from '@/constants';
import { format, parse } from 'date-fns';
import type { PrayerAdjustments } from '@/types';

interface PrayerTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  masjidCoordinates: { latitude: number; longitude: number } | null;
  initialValues: PrayerTimingsData | null;
}

type PrayerName = keyof PrayerAdjustments;
type PrayerAdjustmentType = PrayerAdjustments[PrayerName]['type'];
const PRAYER_NAMES: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function PrayerTimingsModal({
  isOpen,
  onClose,
  onSubmit,
  masjidCoordinates,
  initialValues,
}: PrayerTimingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PrayerTimingsData>({
    resolver: zodResolver(prayerTimingsFormSchema),
    defaultValues: {
      calculation_method:
        initialValues?.calculation_method ?? CalculationMethod.Muslim_World_League,
      juristic_school: initialValues?.juristic_school ?? JuristicSchool.Shafi,
      prayer_adjustments: initialValues?.prayer_adjustments ?? {
        fajr: { type: 'default' },
        sunrise: { type: 'default' },
        dhuhr: { type: 'default' },
        asr: { type: 'default' },
        maghrib: { type: 'default' },
        isha: { type: 'default' },
      },
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue('calculation_method', initialValues.calculation_method);
      setValue('juristic_school', initialValues.juristic_school);

      if (initialValues.prayer_adjustments) {
        setValue('prayer_adjustments', initialValues.prayer_adjustments);
      }
    }
  }, [initialValues, setValue]);

  const onFormSubmit = async (data: PrayerTimingsData) => {
    if (!masjidCoordinates) {
      toast.error('Please set masjid coordinates in your profile first');
      return;
    }

    try {
      setIsSubmitting(true);
      await savePrayerTimeSettings(data);

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

  const calculationMethod = watch('calculation_method');
  const juristicSchool = watch('juristic_school');
  const prayerAdjustments = watch('prayer_adjustments');

  const handleMethodChange = (value: string): void => {
    setValue('calculation_method', parseInt(value));
  };

  const handleSchoolChange = (value: string): void => {
    setValue('juristic_school', parseInt(value));
  };

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

    const getTimeFromString = (timeString: string): Date | undefined => {
      if (!timeString) return undefined;
      try {
        return parse(timeString, 'HH:mm', new Date());
      } catch {
        return undefined;
      }
    };

    const getStringFromTime = (time: Date): string => {
      return format(time, 'HH:mm');
    };

    const timeValue = getTimeFromString(manualTime);

    const handleTimeChange = (time: Date): void => {
      setValue(`prayer_adjustments.${prayer}.manual_time`, getStringFromTime(time));
    };

    return (
      <AccordionItem value={prayer} key={prayer}>
        <AccordionTrigger className='text-sm font-medium py-2 capitalize'>
          {prayer}
        </AccordionTrigger>
        <AccordionContent>
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
                    {hours}h {minutes}m
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
      <DialogContent className='sm:max-w-[500px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Prayer Times Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4 py-4'>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='adjustments'>Adjustments</TabsTrigger>
            </TabsList>
            <TabsContent value='general' className='space-y-4 pt-4'>
              <div className='space-y-2'>
                <Label htmlFor='calculation_method'>Calculation Method</Label>
                <Select onValueChange={handleMethodChange} value={calculationMethod?.toString()}>
                  <SelectTrigger id='calculation_method' className='w-full'>
                    <SelectValue placeholder='Select calculation method' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CalculationMethod)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => (
                        <SelectItem key={key} value={value.toString()}>
                          {key.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.calculation_method && (
                  <p className='text-red-500 text-sm mt-1'>{errors.calculation_method.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='juristic_school'>Juristic School</Label>
                <Select onValueChange={handleSchoolChange} value={juristicSchool?.toString()}>
                  <SelectTrigger id='juristic_school' className='w-full'>
                    <SelectValue placeholder='Select juristic school' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(JuristicSchool)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => (
                        <SelectItem key={key} value={value.toString()}>
                          {key}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.juristic_school && (
                  <p className='text-red-500 text-sm mt-1'>{errors.juristic_school.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <MapPin size={16} />
                  <Label>Masjid Location</Label>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <Label htmlFor='latitude' className='text-xs text-muted-foreground'>
                      Latitude
                    </Label>
                    <Input
                      id='latitude'
                      value={masjidCoordinates?.latitude.toFixed(6) || 'Not set'}
                      readOnly
                      className='bg-muted cursor-not-allowed'
                      autoFocus={false}
                    />
                  </div>
                  <div>
                    <Label htmlFor='longitude' className='text-xs text-muted-foreground'>
                      Longitude
                    </Label>
                    <Input
                      id='longitude'
                      value={masjidCoordinates?.longitude.toFixed(6) || 'Not set'}
                      readOnly
                      className='bg-muted cursor-not-allowed'
                      autoFocus={false}
                    />
                  </div>
                </div>

                <p className='text-xs text-muted-foreground mt-1'>
                  {masjidCoordinates
                    ? 'To update these coordinates, please visit the'
                    : 'To set these coordinates, please visit the'}{' '}
                  <Link to={AppRoutes.Profile} className='text-primary hover:underline'>
                    Profile page
                  </Link>
                  .
                </p>
              </div>
            </TabsContent>

            <TabsContent value='adjustments' className='space-y-4 pt-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Clock size={16} />
                <h3 className='font-medium'>Prayer Time Adjustments</h3>
              </div>

              <p className='text-sm text-muted-foreground mb-4'>
                Adjust prayer times by setting an offset (minutes earlier/later) or manually
                entering a specific time.
              </p>

              <Accordion type='single' collapsible className='w-full'>
                {PRAYER_NAMES.map(prayer => renderPrayerAdjustment(prayer))}
              </Accordion>
            </TabsContent>
          </Tabs>

          <DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-0'>
            <Button type='button' variant='outline' onClick={onClose} className='w-full sm:w-auto'>
              Cancel
            </Button>
            <Button
              type='submit'
              loading={isSubmitting}
              disabled={!masjidCoordinates}
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
