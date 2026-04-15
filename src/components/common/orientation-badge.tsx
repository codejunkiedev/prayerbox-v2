import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { ScreenOrientation } from '@/types';
import { cn } from '@/utils';

interface OrientationBadgeProps {
  orientation: ScreenOrientation;
  className?: string;
}

const CONFIG: Record<ScreenOrientation, { label: string; Icon: typeof Monitor }> = {
  landscape: { label: 'Landscape', Icon: Monitor },
  portrait: { label: 'Portrait', Icon: Smartphone },
  mobile: { label: 'Mobile', Icon: Tablet },
};

export function OrientationBadge({ orientation, className }: OrientationBadgeProps) {
  const { label, Icon } = CONFIG[orientation];
  return (
    <Badge variant='outline' className={cn('gap-1', className)}>
      <Icon className='w-3 h-3' />
      {label}
    </Badge>
  );
}
