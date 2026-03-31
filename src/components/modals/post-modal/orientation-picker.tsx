import { Button, DialogFooter } from '@/components/ui';
import { Monitor, Smartphone } from 'lucide-react';
import type { PostOrientation } from '@/types';
import { ModalError } from './modal-error';

type OrientationPickerProps = {
  onSelect: (orientation: PostOrientation) => void;
  onCancel: () => void;
  error?: string | null;
};

export function OrientationPicker({ onSelect, onCancel, error }: OrientationPickerProps) {
  return (
    <div className='space-y-4 pt-4'>
      <ModalError message={error} />

      <p className='text-sm text-muted-foreground text-center'>
        What type of screen will this post be displayed on?
      </p>

      <div className='grid grid-cols-2 gap-4'>
        <Button
          type='button'
          variant='outline'
          className='h-auto min-h-28 py-6 flex-col gap-3 items-center justify-center'
          onClick={() => onSelect('landscape')}
        >
          <Monitor className='w-10 h-10 text-primary' />
          <div className='text-center space-y-1'>
            <div className='font-medium'>Landscape</div>
            <div className='text-xs text-muted-foreground'>16:9 · Horizontal screen</div>
          </div>
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-auto min-h-28 py-6 flex-col gap-3 items-center justify-center'
          onClick={() => onSelect('portrait')}
        >
          <Smartphone className='w-10 h-10 text-primary' />
          <div className='text-center space-y-1'>
            <div className='font-medium'>Portrait</div>
            <div className='text-xs text-muted-foreground'>9:16 · Vertical screen</div>
          </div>
        </Button>
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </div>
  );
}
