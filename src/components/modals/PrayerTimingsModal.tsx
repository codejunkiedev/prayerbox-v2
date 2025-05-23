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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalculationMethod, JuristicSchool } from '@/constants';
import { prayerTimingsFormSchema, type PrayerTimingsData } from '@/lib/zod';
import { savePrayerTimeSettings } from '@/lib/supabase/services';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { AppRoutes } from '@/constants';

interface PrayerTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  masjidCoordinates: { latitude: number; longitude: number } | null;
  initialValues: PrayerTimingsData | null;
}

export function PrayerTimingsModal({
  isOpen,
  onClose,
  onSubmit,
  masjidCoordinates,
  initialValues,
}: PrayerTimingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue('calculation_method', initialValues.calculation_method);
      setValue('juristic_school', initialValues.juristic_school);
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

  const handleMethodChange = (value: string) => {
    setValue('calculation_method', parseInt(value));
  };

  const handleSchoolChange = (value: string) => {
    setValue('juristic_school', parseInt(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Prayer Times Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4 py-4'>
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
