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
import toast from 'react-hot-toast';

export default function Profile() {
  const [masjidLogo, setMasjidLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MasjidProfileData>({
    resolver: zodResolver(masjidProfileSchema),
    defaultValues: {
      masjidName: '',
      masjidLocation: '',
    },
  });

  // Fetch existing profile data on component mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const profile = await getMasjidProfile();

        if (profile) {
          // Update form with profile data
          reset({
            masjidName: profile.masjidName,
            masjidLocation: profile.masjidLocation,
          });

          // Set logo preview if exists
          if (profile.logo_url) {
            setPreviewLogo(profile.logo_url);
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
  }, [reset]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: MasjidProfileData) => {
    try {
      setIsSaving(true);
      await upsertMasjidProfile(data, masjidLogo);
      toast.success('Masjid profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Masjid Profile</h1>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="masjidName">Masjid Name</Label>
            <Input
              id="masjidName"
              {...register('masjidName')}
              placeholder="Enter masjid name"
              className={errors.masjidName ? 'border-red-500' : ''}
            />
            {errors.masjidName && (
              <p className="text-red-500 text-sm mt-1">{errors.masjidName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="masjidLocation">Masjid Location</Label>
            <Input
              id="masjidLocation"
              {...register('masjidLocation')}
              placeholder="Enter masjid location"
              className={errors.masjidLocation ? 'border-red-500' : ''}
            />
            {errors.masjidLocation && (
              <p className="text-red-500 text-sm mt-1">{errors.masjidLocation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="masjid-logo">Masjid Logo</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="masjid-logo"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Accepted formats: JPEG, PNG, GIF, WEBP (max 5MB)
                </p>
              </div>
              {previewLogo && (
                <div className="w-24 h-24 rounded overflow-hidden border relative">
                  <button
                    type="button"
                    onClick={resetLogo}
                    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-bl-md hover:bg-opacity-70"
                    aria-label="Remove logo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <img
                    src={previewLogo}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Masjid Profile'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
