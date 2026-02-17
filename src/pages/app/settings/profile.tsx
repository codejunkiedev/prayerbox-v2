import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import {
  masjidProfileSchema,
  type MasjidProfileData,
  VALID_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/zod';
import { getMasjidProfile, upsertMasjidProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { Copy, MapPin, ArrowLeft, X } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { MapModal } from '@/components/modals';
import { PageHeader } from '@/components/common';
import { AppRoutes } from '@/constants';

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
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex items-center gap-4'>
        <Link to={AppRoutes.Settings}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Settings
          </Button>
        </Link>
      </div>
      <PageHeader
        title='Masjid Profile'
        description='Manage masjid profile information, logo, and location'
      />

      {isLoading ? (
        <div className='animate-pulse bg-muted rounded-lg h-96'></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Manage your masjid's profile information, logo, and location settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div
                className={`grid gap-4 ${masjidCode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
              >
                {masjidCode && (
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-foreground'>Masjid Code</label>
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
                  <label htmlFor='name' className='block text-sm font-medium text-foreground'>
                    Masjid Name
                  </label>
                  <Input
                    id='name'
                    {...register('name')}
                    placeholder='Enter masjid name'
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <label htmlFor='location' className='block text-sm font-medium text-foreground'>
                  Masjid Location
                </label>
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
                <label htmlFor='masjid-logo' className='block text-sm font-medium text-foreground'>
                  Masjid Logo
                </label>
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
                    <p className='text-sm text-muted-foreground mt-1'>
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
                        <X size={16} />
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

              <div className='flex items-center gap-4'>
                <Button type='submit' loading={isSaving} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
                {isSaving && (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <div className='animate-spin h-4 w-4 border-2 border-muted border-t-foreground rounded-full'></div>
                    Saving settings...
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
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
