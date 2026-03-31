import { Button, DialogFooter } from '@/components/ui';
import { Images, Upload } from 'lucide-react';
import { ModalError } from './modal-error';

type ImageSourcePickerProps = {
  onSelect: (source: 'predesigned' | 'upload') => void;
  onBack: () => void;
  error?: string | null;
};

export function ImageSourcePicker({ onSelect, onBack, error }: ImageSourcePickerProps) {
  return (
    <div className='space-y-4 pt-4'>
      <ModalError message={error} />

      <p className='text-sm text-muted-foreground text-center'>
        Choose how you'd like to add an image for your post:
      </p>

      <div className='grid grid-cols-1 gap-4'>
        <Button
          type='button'
          variant='outline'
          className='h-auto min-h-20 py-4 px-4 text-left justify-start items-center gap-4 whitespace-normal'
          onClick={() => onSelect('predesigned')}
        >
          <div className='flex-shrink-0'>
            <Images className='w-8 h-8 text-primary' />
          </div>
          <div className='flex-1 min-w-0 space-y-1'>
            <div className='font-medium'>Select from Predesigned Images</div>
            <div className='text-xs text-muted-foreground leading-relaxed break-words'>
              Choose from our curated collection of community post templates
            </div>
          </div>
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-auto min-h-20 py-4 px-4 text-left justify-start items-center gap-4 whitespace-normal'
          onClick={() => onSelect('upload')}
        >
          <div className='flex-shrink-0'>
            <Upload className='w-8 h-8 text-primary' />
          </div>
          <div className='flex-1 min-w-0 space-y-1'>
            <div className='font-medium'>Upload Your Own Image</div>
            <div className='text-xs text-muted-foreground leading-relaxed break-words'>
              Upload a custom landscape image with 16:9 aspect ratio
            </div>
          </div>
        </Button>
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onBack}>
          Back
        </Button>
      </DialogFooter>
    </div>
  );
}
