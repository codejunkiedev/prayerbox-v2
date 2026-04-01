import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
  Label,
  Switch,
} from '@/components/ui';
import { youtubeVideoSchema, type YouTubeVideoData } from '@/lib/zod';
import { upsertYouTubeVideo } from '@/lib/supabase';
import type { YouTubeVideo } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

type YouTubeVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: YouTubeVideo;
};

export function YouTubeVideoModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: YouTubeVideoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<YouTubeVideoData>({
    resolver: zodResolver(youtubeVideoSchema),
    defaultValues: initialData || { title: '', youtube_url: '', loop_video: false },
  });

  const youtubeUrl = watch('youtube_url');
  const thumbnailVideoId = useMemo(() => extractVideoId(youtubeUrl || ''), [youtubeUrl]);

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { title: '', youtube_url: '', loop_video: false });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: YouTubeVideoData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await upsertYouTubeVideo({ ...data, ...(initialData?.id && { id: initialData.id }) });
      toast.success(`YouTube video ${isEdit ? 'updated' : 'created'} successfully`);

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving YouTube video:', error);
      setError('Failed to save YouTube video. Please try again.');
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} YouTube video, please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit YouTube Video' : 'Add YouTube Video'}</DialogTitle>
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
              placeholder='Enter a title for this video'
              className={errors.title ? 'border-destructive' : ''}
              {...register('title')}
            />
            {errors.title && <p className='text-destructive text-sm'>{errors.title.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='youtube_url'>YouTube URL</Label>
            <Input
              id='youtube_url'
              placeholder='https://www.youtube.com/watch?v=...'
              className={errors.youtube_url ? 'border-destructive' : ''}
              {...register('youtube_url')}
            />
            {errors.youtube_url && (
              <p className='text-destructive text-sm'>{errors.youtube_url.message}</p>
            )}
            <p className='text-xs text-muted-foreground'>
              Paste a YouTube video URL (e.g. youtube.com/watch?v=... or youtu.be/...)
            </p>
            {thumbnailVideoId && (
              <div className='relative rounded-lg overflow-hidden border bg-black'>
                <img
                  src={`https://img.youtube.com/vi/${thumbnailVideoId}/hqdefault.jpg`}
                  alt='Video thumbnail'
                  className='w-full h-auto object-cover'
                />
              </div>
            )}
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label htmlFor='loop_video'>Loop Video</Label>
              <p className='text-xs text-muted-foreground'>
                When enabled, video replays on completion. When disabled, slideshow advances to next
                slide.
              </p>
            </div>
            <Controller
              name='loop_video'
              control={control}
              render={({ field }) => (
                <Switch id='loop_video' checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
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
