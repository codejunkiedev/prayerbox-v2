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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { ayatAndHadithSchema, type AyatAndHadithData } from '@/lib/zod';
import { upsertAyatAndHadith } from '@/lib/supabase';
import type { AyatAndHadith } from '@/types';

interface AyatAndHadithModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AyatAndHadith;
}

export function AyatAndHadithModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AyatAndHadithModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AyatAndHadithData>({
    resolver: zodResolver(ayatAndHadithSchema),
    defaultValues: initialData || { text: '', translation: '', reference: '', type: 'ayat' },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) reset(initialData);
      else reset({ text: '', translation: '', reference: '', type: 'ayat' });
    }
  }, [initialData, isOpen, reset]);

  const selectedType = watch('type');

  const onSubmit = async (data: AyatAndHadithData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await upsertAyatAndHadith(data);
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving ayat/hadith:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} Ayat or Hadith</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='type'>Type</Label>
            <Select
              defaultValue={selectedType}
              onValueChange={value => setValue('type', value as 'ayat' | 'hadith')}
              value={selectedType}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ayat'>Ayat</SelectItem>
                <SelectItem value='hadith'>Hadith</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className='text-red-500 text-sm'>{errors.type.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='text'>{selectedType === 'ayat' ? 'Ayat' : 'Hadith'}</Label>
            <Textarea
              id='text'
              placeholder='Enter original text'
              {...register('text')}
              className={errors.text ? 'border-red-500' : ''}
            />
            {errors.text && <p className='text-red-500 text-sm'>{errors.text.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='translation'>Translation</Label>
            <Textarea
              id='translation'
              placeholder='Enter translation'
              {...register('translation')}
              className={errors.translation ? 'border-red-500' : ''}
            />
            {errors.translation && (
              <p className='text-red-500 text-sm'>{errors.translation.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='reference'>Reference</Label>
            <Input
              id='reference'
              placeholder='Enter reference (e.g., Surah Al-Baqarah 2:255)'
              {...register('reference')}
              className={errors.reference ? 'border-red-500' : ''}
            />
            {errors.reference && <p className='text-red-500 text-sm'>{errors.reference.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AyatAndHadithModal;
