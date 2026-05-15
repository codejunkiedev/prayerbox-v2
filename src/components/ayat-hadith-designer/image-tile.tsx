import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import type { BackgroundImage } from './use-background-images';

interface ImageTileProps {
  image: BackgroundImage;
  selected: boolean;
  onSelect: () => void;
}

const activeRing = 'border-primary ring-2 ring-primary/40';
const inactiveRing = 'border-transparent hover:border-muted-foreground/50';

export function ImageTile({ image, selected, onSelect }: ImageTileProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'relative aspect-video rounded border-2 overflow-hidden bg-muted transition cursor-pointer',
        selected ? activeRing : inactiveRing
      )}
      title={image.name}
    >
      <img
        src={image.url}
        alt={image.name}
        loading='lazy'
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity',
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        )}
      />
      {status === 'loading' && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
        </div>
      )}
      {status === 'error' && (
        <div className='absolute inset-0 flex items-center justify-center text-[10px] text-destructive px-1 text-center'>
          Failed to load
        </div>
      )}
      {selected && (
        <div className='absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow'>
          <CheckCircle className='h-3.5 w-3.5' />
        </div>
      )}
    </button>
  );
}
