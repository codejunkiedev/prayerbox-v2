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
} from '@/components/ui';
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
    } else if (!initialData) {
      // Reset when opening in add mode (no initial data)
      resetValidation();
    }
  }, [isOpen, initialData, resetValidation]);

  const handleClose = useCallback(() => {
    // Reset form and image state when closing
    reset();
    resetValidation();
    setError(null);
    onClose();
  }, [reset, resetValidation, onClose]);

  const onSubmit = async (data: PostData) => {
    try {
      if (!imageFile && !initialData?.image_url) {
        setError('Image is required');
        return;
      }

      // Prevent submission if new image fails validation
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
      await upsertPost({ ...data, ...(initialData?.id && { id: initialData.id }) }, imageFile);
      toast.success(`Post ${isEdit ? 'updated' : 'created'} successfully`);

      reset();
      resetValidation();
      setError(null);
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
              for full-screen display. Minimum HD quality: 1280×720px.
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
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
