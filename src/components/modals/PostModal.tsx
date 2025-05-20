import { useState } from 'react';
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
} from '@/components/ui';
import { z } from 'zod';
import { postSchema } from '@/lib/zod';
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
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: initialData?.title || '' },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    try {
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
            <Label htmlFor='image'>Image</Label>
            <Input
              id='image'
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='cursor-pointer'
            />
            {initialData?.image_url && !imageFile && (
              <div className='mt-2'>
                <p className='text-sm text-gray-500 mb-2'>Current image:</p>
                <img
                  src={initialData.image_url}
                  alt={initialData.title}
                  className='max-h-40 rounded-md'
                />
              </div>
            )}
            {imageFile && (
              <div className='mt-2'>
                <p className='text-sm text-gray-500 mb-2'>New image preview:</p>
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt='Preview'
                  className='max-h-40 rounded-md'
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
