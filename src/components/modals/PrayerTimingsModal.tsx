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
} from '@/components/ui';
import { CalculationMethod, JuristicSchool } from '@/constants';
import { prayerTimingsFormSchema, type PrayerTimingsData } from '@/lib/zod';
import { savePrayerTimeSettings } from '@/lib/supabase/services';
import { MapPin, Clock, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router';
import { AppRoutes } from '@/constants';

interface PrayerTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  masjidCoordinates: { latitude: number; longitude: number } | null;
  initialValues: PrayerTimingsData | null;
}

type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
const PRAYER_NAMES: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

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
    register,
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

  const handleMethodChange = (value: string) => {
    setValue('calculation_method', parseInt(value));
  };

  const handleSchoolChange = (value: string) => {
    setValue('juristic_school', parseInt(value));
  };

  const handlePrayerTypeChange = (prayer: PrayerName, type: 'offset' | 'manual' | 'default') => {
    setValue(`prayer_adjustments.${prayer}.type`, type);
  };

  const handleOffsetChange = (prayer: PrayerName, value: number[]) => {
    setValue(`prayer_adjustments.${prayer}.offset`, value[0]);
  };

  const renderPrayerAdjustment = (prayer: PrayerName) => {
    const type = prayerAdjustments?.[prayer]?.type || 'default';
    const offset = prayerAdjustments?.[prayer]?.offset || 0;
    const manualTime = prayerAdjustments?.[prayer]?.manual_time || '';

    return (
      <AccordionItem value={prayer} key={prayer}>
        <AccordionTrigger className='text-lg font-medium'>{PRAYER_LABELS[prayer]}</AccordionTrigger>
        <AccordionContent>
          <div className='space-y-4'>
            <RadioGroup
              value={type}
              onValueChange={value =>
                handlePrayerTypeChange(prayer, value as 'offset' | 'manual' | 'default')
              }
              className='grid grid-cols-3 gap-2'
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
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <Label>
                    Minutes to adjust ({offset > 0 ? '+' : ''}
                    {offset})
                  </Label>
                  <div className='flex items-center gap-1'>
                    <Minus className='h-4 w-4 text-muted-foreground' />
                    <span className='text-xs text-muted-foreground'>Earlier</span>
                    <span className='mx-2'>|</span>
                    <span className='text-xs text-muted-foreground'>Later</span>
                    <Plus className='h-4 w-4 text-muted-foreground' />
                  </div>
                </div>
                <Slider
                  defaultValue={[offset]}
                  min={-60}
                  max={60}
                  step={1}
                  onValueChange={value => handleOffsetChange(prayer, value)}
                />
              </div>
            )}

            {type === 'manual' && (
              <div className='space-y-2'>
                <Label htmlFor={`${prayer}-manual-time`}>Time (24h format)</Label>
                <Input
                  id={`${prayer}-manual-time`}
                  type='time'
                  {...register(`prayer_adjustments.${prayer}.manual_time`)}
                  defaultValue={manualTime}
                />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px]'>
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
                    {Object.entries(CalculationMethod).map(([key, value]) => (
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
                    {Object.entries(JuristicSchool).map(([key, value]) => (
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
                <div className='grid grid-cols-2 gap-3'>
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
              <div className='flex items-center gap-2 mb-4'>
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

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' loading={isSubmitting} disabled={!masjidCoordinates}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
