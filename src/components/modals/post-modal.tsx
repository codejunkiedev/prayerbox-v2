import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ImageUpload,
  ValidationFeedback,
  PredesignedImageSelector,
} from '@/components/ui';
import { Images, Upload } from 'lucide-react';
import { postSchema, type PostData } from '@/lib/zod';
import { upsertPost } from '@/lib/supabase';
import { useImageValidation } from '@/hooks/useImageValidation';
import type { Post } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

type PostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Post;
};

/**
 * Modal component for creating and editing posts with title and image upload with 16:9 aspect ratio validation
 */
export function PostModal({ isOpen, onClose, onSuccess, initialData }: PostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'predesigned' | 'upload' | null>(null);
  const [selectedPredesignedImage, setSelectedPredesignedImage] = useState<string | null>(null);

  const {
    imageFile,
    imageError,
    validationState,
    isValidating,
    handleImageChange,
    resetValidation,
  } = useImageValidation();

  const isEdit = useMemo(() => !!initialData, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<PostData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || { title: '' },
  });

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
    }
  }, [initialData, setValue]);

  useEffect(() => {
    if (initialData?.image_url) {
      resetValidation();
    }
  }, [initialData, resetValidation]);

  // Reset image state when modal is opened/closed or when switching between add/edit modes
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      resetValidation();
      setImageSource(null);
      setSelectedPredesignedImage(null);
    } else if (!initialData) {
      // Reset when opening in add mode (no initial data)
      resetValidation();
      setImageSource(null);
      setSelectedPredesignedImage(null);
    }
  }, [isOpen, initialData, resetValidation]);

  const handleClose = useCallback(() => {
    // Reset form and image state when closing
    reset();
    resetValidation();
    setError(null);
    setImageSource(null);
    setSelectedPredesignedImage(null);
    onClose();
  }, [reset, resetValidation, onClose]);

  const onSubmit = async (data: PostData) => {
    try {
      // Check if we have an image (either uploaded, predesigned, or existing for edit)
      if (!imageFile && !selectedPredesignedImage && !initialData?.image_url) {
        setError('Image is required');
        return;
      }

      // Prevent submission if new image fails validation (only for uploaded files)
      if (imageFile && validationState && !validationState.isValid) {
        setError('Please upload a valid image that can be properly displayed full-screen');
        return;
      }

      if (imageError) {
        setError(imageError);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // Handle predesigned image by converting path to a URL that can be used
      let imageToUse = imageFile;
      if (selectedPredesignedImage && !imageFile) {
        // For predesigned images, we need to fetch and convert to File
        const response = await fetch(selectedPredesignedImage);
        const blob = await response.blob();
        const fileName = selectedPredesignedImage.split('/').pop() || 'predesigned-image.jpg';
        imageToUse = new File([blob], fileName, { type: blob.type });
      }

      await upsertPost({ ...data, ...(initialData?.id && { id: initialData.id }) }, imageToUse);
      toast.success(`Post ${isEdit ? 'updated' : 'created'} successfully`);

      reset();
      resetValidation();
      setError(null);
      setImageSource(null);
      setSelectedPredesignedImage(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Failed to save post. Please try again.');
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} post, please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Post' : 'Add New Post'}</DialogTitle>
        </DialogHeader>

        {/* Show image source selection for new posts */}
        {!isEdit && !imageSource && (
          <div className='space-y-4 pt-4'>
            {error && (
              <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4'>
                {error}
              </div>
            )}

            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground text-center'>
                Choose how you'd like to add an image for your post:
              </p>

              <div className='grid grid-cols-1 gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='h-auto min-h-20 py-4 px-4 text-left justify-start items-center gap-4 whitespace-normal'
                  onClick={() => setImageSource('predesigned')}
                >
                  <div className='flex-shrink-0'>
                    <Images className='w-8 h-8 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0 space-y-1'>
                    <div className='font-medium'>Select from Predesigned Images</div>
                    <div className='text-xs text-muted-foreground leading-relaxed break-words'>
                      Choose from our curated collection of community post templates
                    </div>
                  </div>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  className='h-auto min-h-20 py-4 px-4 text-left justify-start items-center gap-4 whitespace-normal'
                  onClick={() => setImageSource('upload')}
                >
                  <div className='flex-shrink-0'>
                    <Upload className='w-8 h-8 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0 space-y-1'>
                    <div className='font-medium'>Upload Your Own Image</div>
                    <div className='text-xs text-muted-foreground leading-relaxed break-words'>
                      Upload a custom image with 16:9 aspect ratio
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Show predesigned image selection */}
        {!isEdit && imageSource === 'predesigned' && (
          <div className='space-y-4 pt-4'>
            {error && (
              <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label>Select a Predesigned Image</Label>
              <PredesignedImageSelector
                selectedImage={selectedPredesignedImage}
                onImageSelect={setSelectedPredesignedImage}
              />
            </div>

            {selectedPredesignedImage && (
              <div className='space-y-2'>
                <Label htmlFor='title'>Post Title</Label>
                <Input
                  id='title'
                  placeholder='Enter post title'
                  className={errors.title ? 'border-destructive' : ''}
                  {...register('title')}
                />
                {errors.title && <p className='text-destructive text-sm'>{errors.title.message}</p>}
              </div>
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setImageSource(null)}>
                Back
              </Button>
              {selectedPredesignedImage && (
                <Button
                  type='button'
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Post'}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* Show existing form for edit mode or upload mode */}
        {(isEdit || imageSource === 'upload') && (
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
            {error && (
              <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                placeholder='Enter post title'
                className={errors.title ? 'border-destructive' : ''}
                {...register('title')}
              />
              {errors.title && <p className='text-destructive text-sm'>{errors.title.message}</p>}
            </div>

            <div className='space-y-2'>
              <ImageUpload
                label='Image (Full-Screen Display)'
                onChange={handleImageChange}
                value={initialData?.image_url}
                disabled={isSubmitting}
              />

              {/* Image validation feedback */}
              {(validationState || isValidating) && (
                <ValidationFeedback
                  isValid={validationState?.isValid ?? false}
                  dimensions={validationState?.dimensions}
                  recommendation={validationState?.recommendation}
                  isLoading={isValidating}
                />
              )}

              {imageError && <p className='text-destructive text-sm'>{imageError}</p>}

              {/* Help text */}
              <p className='text-xs text-muted-foreground'>
                <strong>Strict requirement:</strong> Only 16:9 aspect ratio images accepted. Perfect
                for full-screen display.
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Need to resize your image? Try{' '}
                <a
                  href='https://imageresizer.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  imageresizer.com
                </a>
              </p>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={isEdit ? handleClose : () => setImageSource(null)}
              >
                {isEdit ? 'Cancel' : 'Back'}
              </Button>
              <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
