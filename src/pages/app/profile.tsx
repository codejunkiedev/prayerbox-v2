import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  masjidProfileSchema,
  type MasjidProfileData,
  VALID_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/zod';
import { getMasjidProfile, upsertMasjidProfile } from '@/lib/supabase/services';
import { toast } from 'sonner';
import { Copy, MapPin } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { MapModal } from '@/components/modals';

export default function Profile() {
  const [masjidLogo, setMasjidLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [masjidCode, setMasjidCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [trigger, triggerUpdate] = useTrigger();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MasjidProfileData>({
    resolver: zodResolver(masjidProfileSchema),
    defaultValues: { name: '', latitude: 0, longitude: 0 },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const coordinates = latitude && longitude ? { latitude, longitude } : null;

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const profile = await getMasjidProfile();

        if (profile) {
          reset({
            name: profile.name,
            latitude: profile.latitude || 0,
            longitude: profile.longitude || 0,
          });
          setMasjidCode(profile.code);

          if (profile.logo_url) {
            setPreviewLogo(profile.logo_url);
            setLogoRemoved(false);
          } else {
            setPreviewLogo(null);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [reset, trigger]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(masjidCode);
      setIsCopied(true);
      toast.success('Masjid code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 5MB limit');
        return;
      }

      setMasjidLogo(file);
      if (logoRemoved) setLogoRemoved(false);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = () => {
    setMasjidLogo(null);
    setPreviewLogo(null);
    setLogoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCoordinatesSelect = (latitude: number, longitude: number) => {
    setValue('latitude', latitude);
    setValue('longitude', longitude);
  };

  const onSubmit = async (data: MasjidProfileData) => {
    try {
      setIsSaving(true);
      await upsertMasjidProfile(data, masjidLogo, logoRemoved);
      toast.success('Masjid profile saved successfully');
      triggerUpdate();
      if (logoRemoved) setLogoRemoved(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-2xl font-bold mb-6'>Masjid Profile</h1>

      {isLoading ? (
        <div className='flex justify-center p-8'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
          <span className='sr-only'>Loading...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div
            className={`grid gap-4 ${masjidCode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
          >
            {masjidCode && (
              <div className='space-y-2'>
                <Label htmlFor='code'>Masjid Code</Label>
                <div className='flex relative'>
                  <Input
                    id='code'
                    value={masjidCode}
                    readOnly
                    className='bg-muted cursor-not-allowed pr-10'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={handleCopyCode}
                    className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                    title='Copy masjid code'
                  >
                    <Copy size={16} className={isCopied ? 'text-green-500' : ''} />
                    <span className='sr-only'>Copy masjid code</span>
                  </Button>
                </div>
                <p className='text-sm text-muted-foreground'>
                  This code was automatically generated and cannot be changed.
                </p>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='name'>Masjid Name</Label>
              <Input
                id='name'
                {...register('name')}
                placeholder='Enter masjid name'
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='location'>Masjid Location</Label>
            <div className='flex gap-2'>
              <Input
                id='location'
                placeholder='Select location on map'
                readOnly
                value={
                  coordinates
                    ? `${coordinates.latitude.toFixed(3)}, ${coordinates.longitude.toFixed(3)}`
                    : ''
                }
                className='bg-muted cursor-not-allowed flex-1'
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsMapModalOpen(true)}
                className='flex items-center gap-2'
              >
                <MapPin size={16} />
                {coordinates ? 'Change Location' : 'Set Location'}
              </Button>
            </div>
            {(errors.latitude || errors.longitude) && (
              <p className='text-red-500 text-sm mt-1'>Masjid location is required</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='masjid-logo'>Masjid Logo</Label>
            <div className='flex items-start gap-4'>
              <div className='flex-1'>
                <Input
                  id='masjid-logo'
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleLogoChange}
                  className='cursor-pointer'
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Accepted formats: JPEG, PNG, GIF, WEBP (max 5MB)
                </p>
              </div>
              {previewLogo && (
                <div className='w-24 h-24 rounded overflow-hidden border relative'>
                  <button
                    type='button'
                    onClick={resetLogo}
                    className='absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-bl-md hover:bg-opacity-70'
                    aria-label='Remove logo'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <line x1='18' y1='6' x2='6' y2='18'></line>
                      <line x1='6' y1='6' x2='18' y2='18'></line>
                    </svg>
                  </button>
                  <img
                    src={previewLogo}
                    alt='Logo preview'
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
            </div>
          </div>

          <Button type='submit' loading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Masjid Profile'}
          </Button>
        </form>
      )}

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onCoordinatesSelect={handleCoordinatesSelect}
        coordinates={coordinates}
      />
    </div>
  );
}
