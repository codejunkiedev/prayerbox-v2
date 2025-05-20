import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  DateTimePicker,
} from '@/components/ui';
import { eventSchema, type EventData } from '@/lib/zod';
import { upsertEvent } from '@/lib/supabase';
import type { Event } from '@/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Event;
}

export function EventModal({ isOpen, onClose, onSuccess, initialData }: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;
  const [dateTime, setDateTime] = useState<Date | undefined>(
    initialData?.date_time ? new Date(initialData.date_time) : undefined
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      date_time: '',
      location: '',
      chief_guest: '',
      host: '',
      qari: '',
      naat_khawn: '',
      karm_farma: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
        setDateTime(initialData.date_time ? new Date(initialData.date_time) : undefined);
      } else {
        reset({
          title: '',
          description: '',
          date_time: '',
          location: '',
          chief_guest: '',
          host: '',
          qari: '',
          naat_khawn: '',
          karm_farma: '',
        });
        setDateTime(undefined);
      }
    }
  }, [initialData, isOpen, reset]);

  // Update form value when dateTime changes
  useEffect(() => {
    if (dateTime) {
      setValue('date_time', dateTime.toISOString());
    }
  }, [dateTime, setValue]);

  const onSubmit = async (data: EventData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await upsertEvent({
        ...data,
        ...(initialData?.id && { id: initialData.id }),
      });

      reset();
      setDateTime(undefined);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
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
              placeholder='Enter event title'
              className={errors.title ? 'border-red-500' : ''}
              {...register('title')}
            />
            {errors.title && <p className='text-red-500 text-sm'>{errors.title.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Input
              id='description'
              placeholder='Enter event description'
              className={errors.description ? 'border-red-500' : ''}
              {...register('description')}
            />
            {errors.description && (
              <p className='text-red-500 text-sm'>{errors.description.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='date_time'>Date & Time</Label>
            <DateTimePicker date={dateTime} setDate={setDateTime} disabled={isSubmitting} />
            {errors.date_time && <p className='text-red-500 text-sm'>{errors.date_time.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              placeholder='Enter event location'
              className={errors.location ? 'border-red-500' : ''}
              {...register('location')}
            />
            {errors.location && <p className='text-red-500 text-sm'>{errors.location.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='chief_guest'>Chief Guest</Label>
            <Input
              id='chief_guest'
              placeholder='Enter chief guest name'
              className={errors.chief_guest ? 'border-red-500' : ''}
              {...register('chief_guest')}
            />
            {errors.chief_guest && (
              <p className='text-red-500 text-sm'>{errors.chief_guest.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='host'>Host</Label>
            <Input
              id='host'
              placeholder='Enter host name (optional)'
              className={errors.host ? 'border-red-500' : ''}
              {...register('host')}
            />
            {errors.host && <p className='text-red-500 text-sm'>{errors.host.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='qari'>Qari</Label>
            <Input
              id='qari'
              placeholder='Enter qari name'
              className={errors.qari ? 'border-red-500' : ''}
              {...register('qari')}
            />
            {errors.qari && <p className='text-red-500 text-sm'>{errors.qari.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='naat_khawn'>Naat Khawn</Label>
            <Input
              id='naat_khawn'
              placeholder='Enter naat khawn name'
              className={errors.naat_khawn ? 'border-red-500' : ''}
              {...register('naat_khawn')}
            />
            {errors.naat_khawn && (
              <p className='text-red-500 text-sm'>{errors.naat_khawn.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='karm_farma'>Karm Farma</Label>
            <Input
              id='karm_farma'
              placeholder='Enter karm farma name'
              className={errors.karm_farma ? 'border-red-500' : ''}
              {...register('karm_farma')}
            />
            {errors.karm_farma && (
              <p className='text-red-500 text-sm'>{errors.karm_farma.message}</p>
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
