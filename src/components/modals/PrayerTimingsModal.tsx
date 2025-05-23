import { useState } from 'react';
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
import { CalculationMethod, CalculationSchool } from '@/constants/config';
import { prayerTimingsFormSchema, type PrayerTimingsFormData } from '@/lib/zod';
import { fetchPrayerTimesForDate } from '@/api';
import type { PrayerTimesForDate } from '@/types';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { AppRoutes } from '@/constants';
import { format } from 'date-fns';

interface PrayerTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrayerTimesForDate) => void;
  masjidCoordinates: { latitude: number; longitude: number } | null;
}

export function PrayerTimingsModal({
  isOpen,
  onClose,
  onSubmit,
  masjidCoordinates,
}: PrayerTimingsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PrayerTimingsFormData>({
    resolver: zodResolver(prayerTimingsFormSchema),
    defaultValues: {
      method: CalculationMethod.Muslim_World_League,
      school: CalculationSchool.Shafi,
    },
  });

  const onFormSubmit = async (data: PrayerTimingsFormData) => {
    if (!masjidCoordinates) {
      toast.error('Please set masjid coordinates in your profile first');
      return;
    }

    try {
      setIsLoading(true);
      const today = format(new Date(), 'dd-MM-yyyy');

      const response = await fetchPrayerTimesForDate({
        date: today,
        latitude: masjidCoordinates.latitude,
        longitude: masjidCoordinates.longitude,
        method: data.method,
        school: data.school,
      });
      onSubmit(response.data);
      onClose();
      toast.success('Prayer times fetched successfully');
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      toast.error('Failed to fetch prayer times');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (value: string) => {
    setValue('method', parseInt(value));
  };

  const handleSchoolChange = (value: string) => {
    setValue('school', parseInt(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Prayer Times Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='method'>Calculation Method</Label>
            <Select
              onValueChange={handleMethodChange}
              defaultValue={CalculationMethod.Muslim_World_League.toString()}
            >
              <SelectTrigger id='method' className='w-full'>
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
            {errors.method && <p className='text-red-500 text-sm mt-1'>{errors.method.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='school'>Juristic School</Label>
            <Select
              onValueChange={handleSchoolChange}
              defaultValue={CalculationSchool.Shafi.toString()}
            >
              <SelectTrigger id='school' className='w-full'>
                <SelectValue placeholder='Select juristic school' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CalculationSchool).map(([key, value]) => (
                  <SelectItem key={key} value={value.toString()}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.school && <p className='text-red-500 text-sm mt-1'>{errors.school.message}</p>}
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
            {!masjidCoordinates && (
              <p className='text-amber-500 text-sm mt-1'>
                Please set your masjid location in the profile page
              </p>
            )}
            <p className='text-xs text-muted-foreground mt-1'>
              To update these coordinates, please visit the{' '}
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
            <Button type='submit' loading={isLoading} disabled={!masjidCoordinates}>
              {isLoading ? 'Fetching...' : 'Fetch Prayer Times'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
