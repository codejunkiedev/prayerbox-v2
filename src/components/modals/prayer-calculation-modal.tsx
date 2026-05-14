import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { AppRoutes, CalculationMethod, JuristicSchool } from '@/constants';
import { getMasjidProfile, updatePrayerCalculationSettings } from '@/lib/supabase';
import { isNullOrUndefined } from '@/utils';
import type { Settings } from '@/types';

interface PrayerCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings | null;
  onSaved?: () => void;
}

export function PrayerCalculationModal({
  isOpen,
  onClose,
  settings,
  onSaved,
}: PrayerCalculationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<number>(
    settings?.calculation_method ?? CalculationMethod.Muslim_World_League
  );
  const [juristicSchool, setJuristicSchool] = useState<number>(
    settings?.juristic_school ?? JuristicSchool.Shafi
  );
  const [masjidCoordinates, setMasjidCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!isNullOrUndefined(settings?.calculation_method)) {
      setCalculationMethod(settings.calculation_method);
    }
    if (!isNullOrUndefined(settings?.juristic_school)) {
      setJuristicSchool(settings.juristic_school);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    getMasjidProfile()
      .then(profile => {
        if (!active) return;
        if (profile?.latitude && profile?.longitude) {
          setMasjidCoordinates({ latitude: profile.latitude, longitude: profile.longitude });
        }
      })
      .catch(error => console.error('Error fetching masjid profile:', error));
    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await updatePrayerCalculationSettings(calculationMethod, juristicSchool);
      toast.success('Prayer time settings updated successfully');
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving prayer time settings:', error);
      toast.error('Failed to save prayer time settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isSubmitting && onClose()}>
      <DialogContent className='sm:max-w-[640px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Prayer Time Calculation</DialogTitle>
          <DialogDescription>
            Configure the calculation method, juristic school, and location used for prayer time
            calculations.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='block text-sm font-medium text-foreground mb-2'>
                Calculation Method
              </Label>
              <Select
                value={calculationMethod.toString()}
                onValueChange={v => setCalculationMethod(parseInt(v))}
                disabled={isSubmitting}
              >
                <SelectTrigger className='w-full'>
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
            </div>

            <div>
              <Label className='block text-sm font-medium text-foreground mb-2'>
                Juristic School
              </Label>
              <Select
                value={juristicSchool.toString()}
                onValueChange={v => setJuristicSchool(parseInt(v))}
                disabled={isSubmitting}
              >
                <SelectTrigger className='w-full'>
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
            </div>
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
                  value={masjidCoordinates?.latitude.toFixed(3) || 'Not set'}
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
                  value={masjidCoordinates?.longitude.toFixed(3) || 'Not set'}
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
              <Link to={AppRoutes.SettingsProfile} className='text-primary hover:underline'>
                Profile page
              </Link>
              .
            </p>
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
