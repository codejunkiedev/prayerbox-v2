import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ImageUpload,
} from '@/components/ui';
import { postSchema, type PostData } from '@/lib/zod';
import { upsertPost } from '@/lib/supabase';
import type { Post } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type PostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Post;
};

export function PostModal({ isOpen, onClose, onSuccess, initialData }: PostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const isEdit = !!initialData;

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
      setImageError(null);
    }
  }, [initialData]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImageError(file ? null : 'Image is required');
  };

  const onSubmit = async (data: PostData) => {
    try {
      if (!imageFile && !initialData?.image_url) {
        setImageError('Image is required');
        return;
      }

      setIsSubmitting(true);
      setError(null);
      await upsertPost(
        {
          ...data,
          ...(initialData?.id && { id: initialData.id }),
        },
        imageFile
      );

      reset();
      setImageFile(null);
      setImageError(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Post' : 'Add New Post'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              placeholder='Enter post title'
              className={errors.title ? 'border-red-500' : ''}
              {...register('title')}
            />
            {errors.title && <p className='text-red-500 text-sm'>{errors.title.message}</p>}
          </div>

          <div className='space-y-2'>
            <ImageUpload
              label='Image'
              onChange={handleImageChange}
              value={initialData?.image_url}
              disabled={isSubmitting}
            />
            {imageError && <p className='text-red-500 text-sm'>{imageError}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
