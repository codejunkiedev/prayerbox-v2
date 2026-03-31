import { Badge } from '@/components/ui';
import { Monitor, Smartphone } from 'lucide-react';
import type { PostOrientation } from '@/types';

type OrientationBadgeProps = {
  orientation: PostOrientation;
  showEditNote?: boolean;
};

export function OrientationBadge({ orientation, showEditNote }: OrientationBadgeProps) {
  const isPortrait = orientation === 'portrait';

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground'>Orientation:</span>
      <Badge variant='outline' className='gap-1'>
        {isPortrait ? (
          <>
            <Smartphone className='w-3 h-3' />
            Portrait
          </>
        ) : (
          <>
            <Monitor className='w-3 h-3' />
            Landscape
          </>
        )}
      </Badge>
      {showEditNote && (
        <span className='text-xs text-muted-foreground'>(cannot be changed after creation)</span>
      )}
    </div>
  );
}
