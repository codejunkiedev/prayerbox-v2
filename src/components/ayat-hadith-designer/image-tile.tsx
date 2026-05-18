import { CheckCircle } from 'lucide-react';
import { RemoteImage } from '@/components/ui';
import { cn } from '@/utils';
import type { BackgroundImage } from '@/types';

interface ImageTileProps {
  image: BackgroundImage;
  selected: boolean;
  onSelect: () => void;
}

const activeRing = 'border-primary ring-2 ring-primary/40';
const inactiveRing = 'border-transparent hover:border-muted-foreground/50';

export function ImageTile({ image, selected, onSelect }: ImageTileProps) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'relative aspect-video rounded border-2 overflow-hidden transition cursor-pointer',
        selected ? activeRing : inactiveRing
      )}
      title={image.name}
    >
      <RemoteImage src={image.url} alt={image.name} containerClassName='absolute inset-0' />
      {selected && (
        <div className='absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow z-10'>
          <CheckCircle className='h-3.5 w-3.5' />
        </div>
      )}
    </button>
  );
}
