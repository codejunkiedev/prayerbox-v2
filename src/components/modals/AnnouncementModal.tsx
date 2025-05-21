import { useState } from 'react';
import {
  Button,
  Textarea,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui';
import { announcementSchema, type AnnouncementData } from '@/lib/zod';
import { upsertAnnouncement } from '@/lib/supabase';
import type { Announcement } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui';

type AnnouncementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Announcement;
};

export function AnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AnnouncementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: initialData || { description: '' },
  });

  const onSubmit = async (data: AnnouncementData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await upsertAnnouncement({
        ...data,
        ...(initialData?.id && { id: initialData.id }),
      });

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError('Failed to save announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Enter announcement details here...'
              className={`resize-none h-40 ${errors.description ? 'border-red-500' : ''}`}
              {...register('description')}
            />
            {errors.description && (
              <p className='text-red-500 text-sm'>{errors.description.message}</p>
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
