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
  Label,
  Input,
} from '@/components/ui';
import { CalculationMethod, JuristicSchool, AppRoutes } from '@/constants';
import {
  getOrCreateSettings,
  updatePrayerCalculationSettings,
  getMasjidProfile,
} from '@/lib/supabase';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { isNullOrUndefined } from '@/utils';

export function PrayerTimesSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<number>(
    CalculationMethod.Muslim_World_League
  );
  const [juristicSchool, setJuristicSchool] = useState<number>(JuristicSchool.Shafi);
  const [masjidCoordinates, setMasjidCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [settings, profile] = await Promise.all([getOrCreateSettings(), getMasjidProfile()]);

        if (settings && !isNullOrUndefined(settings.calculation_method)) {
          setCalculationMethod(settings.calculation_method);
        }
        if (settings && !isNullOrUndefined(settings.juristic_school)) {
          setJuristicSchool(settings.juristic_school);
        }

        if (profile && profile.latitude && profile.longitude) {
          setMasjidCoordinates({ latitude: profile.latitude, longitude: profile.longitude });
        }
      } catch (error) {
        console.error('Error fetching prayer time settings:', error);
        toast.error('Failed to load prayer time settings');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (method: number, school: number) => {
    try {
      setIsSaving(true);
      await updatePrayerCalculationSettings(method, school);
      toast.success('Prayer time settings updated successfully');
    } catch (error) {
      console.error('Error saving prayer time settings:', error);
      toast.error('Failed to save prayer time settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMethodChange = (value: string) => {
    const method = parseInt(value);
    if (method === calculationMethod) return;
    setCalculationMethod(method);
    handleSave(method, juristicSchool);
  };

  const handleSchoolChange = (value: string) => {
    const school = parseInt(value);
    if (school === juristicSchool) return;
    setJuristicSchool(school);
    handleSave(calculationMethod, school);
  };

  if (isLoading) return <div className='animate-pulse bg-muted rounded-lg h-48'></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prayer Time Calculation</CardTitle>
        <CardDescription>
          Configure the calculation method, juristic school, and location used for prayer time
          calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              Calculation Method
            </label>
            <Select
              onValueChange={handleMethodChange}
              value={calculationMethod.toString()}
              disabled={isSaving}
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
            <label className='block text-sm font-medium text-foreground mb-2'>
              Juristic School
            </label>
            <Select
              onValueChange={handleSchoolChange}
              value={juristicSchool.toString()}
              disabled={isSaving}
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
