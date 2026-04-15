import { OrientationBadge as SharedOrientationBadge } from '@/components/common';
import type { PostOrientation } from '@/types';

type OrientationBadgeProps = {
  orientation: PostOrientation;
  showEditNote?: boolean;
};

export function OrientationBadge({ orientation, showEditNote }: OrientationBadgeProps) {
  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground'>Orientation:</span>
      <SharedOrientationBadge orientation={orientation} />
      {showEditNote && (
        <span className='text-xs text-muted-foreground'>(cannot be changed after creation)</span>
      )}
    </div>
  );
}
