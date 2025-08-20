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
  Textarea,
} from '@/components/ui';
import { eventSchema, type EventData } from '@/lib/zod';
import { upsertEvent } from '@/lib/supabase';
import type { Event } from '@/types';
import { toast } from 'sonner';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Event;
}

/**
 * Modal component for creating and editing events with details like title, date, location, and participants
 */
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

  useEffect(() => {
    if (dateTime) {
      setValue('date_time', dateTime.toISOString());
    }
  }, [dateTime, setValue]);

  const onSubmit = async (data: EventData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await upsertEvent({ ...data, ...(initialData?.id && { id: initialData.id }) });
      toast.success(`Event ${isEdit ? 'updated' : 'created'} successfully`);

      reset();
      setDateTime(undefined);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event. Please try again.');
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} event, please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[850px] max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-4'>
          {error && (
            <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-500'>Basic Information</h3>

            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                placeholder='Enter event title'
                className={errors.title ? 'border-destructive' : ''}
                {...register('title')}
              />
              {errors.title && <p className='text-destructive text-sm'>{errors.title.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Enter event description'
                className={`resize-none h-24 ${errors.description ? 'border-destructive' : ''}`}
                {...register('description')}
              />
              {errors.description && (
                <p className='text-destructive text-sm'>{errors.description.message}</p>
              )}
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date_time'>Date & Time</Label>
                <DateTimePicker date={dateTime} setDate={setDateTime} disabled={isSubmitting} />
                {errors.date_time && (
                  <p className='text-destructive text-sm'>{errors.date_time.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='location'>Location</Label>
                <Input
                  id='location'
                  placeholder='Enter event location'
                  className={errors.location ? 'border-destructive' : ''}
                  {...register('location')}
                />
                {errors.location && (
                  <p className='text-destructive text-sm'>{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className='border-t border-gray-200'></div>

          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-500'>Participants</h3>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='chief_guest'>Chief Guest</Label>
                <Input
                  id='chief_guest'
                  placeholder='Enter chief guest name'
                  className={errors.chief_guest ? 'border-destructive' : ''}
                  {...register('chief_guest')}
                />
                {errors.chief_guest && (
                  <p className='text-destructive text-sm'>{errors.chief_guest.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='host'>Host</Label>
                <Input
                  id='host'
                  placeholder='Enter host name (optional)'
                  className={errors.host ? 'border-destructive' : ''}
                  {...register('host')}
                />
                {errors.host && <p className='text-destructive text-sm'>{errors.host.message}</p>}
              </div>
            </div>

            <div className='grid md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='qari'>Qari</Label>
                <Input
                  id='qari'
                  placeholder='Enter qari name'
                  className={errors.qari ? 'border-destructive' : ''}
                  {...register('qari')}
                />
                {errors.qari && <p className='text-destructive text-sm'>{errors.qari.message}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='naat_khawn'>Naat Khawn</Label>
                <Input
                  id='naat_khawn'
                  placeholder='Enter naat khawn name'
                  className={errors.naat_khawn ? 'border-destructive' : ''}
                  {...register('naat_khawn')}
                />
                {errors.naat_khawn && (
                  <p className='text-destructive text-sm'>{errors.naat_khawn.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='karm_farma'>Karm Farma</Label>
                <Input
                  id='karm_farma'
                  placeholder='Enter karm farma name'
                  className={errors.karm_farma ? 'border-destructive' : ''}
                  {...register('karm_farma')}
                />
                {errors.karm_farma && (
                  <p className='text-destructive text-sm'>{errors.karm_farma.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className='mt-6'>
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
