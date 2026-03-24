import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Checkbox,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui';
import { screenSchema, type ScreenData } from '@/lib/zod';
import { createScreen, updateScreen } from '@/lib/supabase';
import type { DisplayScreen } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

type ScreenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: DisplayScreen;
};

export function ScreenModal({ isOpen, onClose, onSuccess, initialData }: ScreenModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScreenData>({
    resolver: zodResolver(screenSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          orientation: initialData.orientation,
          show_prayer_times: initialData.show_prayer_times,
          show_weather: initialData.show_weather,
        }
      : {
          name: '',
          orientation: 'landscape',
          show_prayer_times: true,
          show_weather: true,
        },
  });

  const showPrayerTimes = watch('show_prayer_times');
  const showWeather = watch('show_weather');

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              name: initialData.name,
              orientation: initialData.orientation,
              show_prayer_times: initialData.show_prayer_times,
              show_weather: initialData.show_weather,
            }
          : {
              name: '',
              orientation: 'landscape',
              show_prayer_times: true,
              show_weather: true,
            }
      );
      setIsCopied(false);
    }
  }, [isOpen, initialData, reset]);

  const handleCopyCode = async () => {
    if (!initialData?.code) return;
    try {
      await navigator.clipboard.writeText(initialData.code);
      setIsCopied(true);
      toast.success('Screen code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const onSubmit = async (data: ScreenData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEdit && initialData) {
        await updateScreen(initialData.id, data);
      } else {
        await createScreen(data);
      }

      toast.success(`Screen ${isEdit ? 'updated' : 'created'} successfully`);
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving screen:', err);
      setError('Failed to save screen. Please try again.');
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} screen, please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Screen' : 'Add New Screen'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
          {error && (
            <div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          {isEdit && initialData?.code && (
            <div className='space-y-2'>
              <Label>Screen Code</Label>
              <div className='flex relative'>
                <Input
                  value={initialData.code}
                  readOnly
                  className='bg-muted cursor-not-allowed pr-10'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={handleCopyCode}
                  className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
                  title='Copy screen code'
                >
                  <Copy size={16} className={isCopied ? 'text-green-500' : ''} />
                </Button>
              </div>
              <p className='text-sm text-muted-foreground'>
                Use this code to connect a display to this screen.
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              placeholder='e.g. Main Hall, Entrance'
              className={errors.name ? 'border-destructive' : ''}
              {...register('name')}
            />
            {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='orientation'>Orientation</Label>
            <select
              id='orientation'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              {...register('orientation')}
            >
              <option value='landscape'>Landscape</option>
              <option value='portrait'>Portrait</option>
              <option value='mobile'>Mobile</option>
            </select>
          </div>

          <div className='space-y-3'>
            <Label>Default Slides</Label>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='show_prayer_times'
                checked={showPrayerTimes}
                onCheckedChange={checked => setValue('show_prayer_times', !!checked)}
              />
              <label htmlFor='show_prayer_times' className='text-sm cursor-pointer'>
                Show Prayer Times
              </label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='show_weather'
                checked={showWeather}
                onCheckedChange={checked => setValue('show_weather', !!checked)}
              />
              <label htmlFor='show_weather' className='text-sm cursor-pointer'>
                Show Weather
              </label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
