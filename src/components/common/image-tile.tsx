import { CheckCircle, Trash2 } from 'lucide-react';
import { RemoteImage } from '@/components/ui';
import { cn } from '@/utils';
import type { BackgroundImage } from '@/types';

interface ImageTileProps {
  image: BackgroundImage;
  selected: boolean;
  onSelect: () => void;
  /** When provided, renders a delete button overlay (e.g. for user uploads). */
  onDelete?: () => void;
}

const activeRing = 'border-primary ring-2 ring-primary/40';
const inactiveRing = 'border-transparent hover:border-muted-foreground/50';

export function ImageTile({ image, selected, onSelect, onDelete }: ImageTileProps) {
  return (
    <div
      className={cn(
        'group relative aspect-video rounded border-2 overflow-hidden transition',
        selected ? activeRing : inactiveRing
      )}
      title={image.name}
    >
      <button type='button' onClick={onSelect} className='absolute inset-0 cursor-pointer'>
        <RemoteImage src={image.url} alt={image.name} containerClassName='absolute inset-0' />
      </button>
      {selected && (
        <div className='absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow z-10'>
          <CheckCircle className='h-3.5 w-3.5' />
        </div>
      )}
      {onDelete && (
        <button
          type='button'
          onClick={onDelete}
          aria-label='Delete image'
          className='absolute top-1 left-1 z-10 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-destructive focus-visible:opacity-100'
        >
          <Trash2 className='h-3.5 w-3.5' />
        </button>
      )}
    </div>
  );
}
