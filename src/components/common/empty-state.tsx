import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
};

/**
 * Empty state component displaying a message when no data is available
 * Includes optional action button for creating new content
 * @param props Component props containing icon, title, description, and optional action
 */
export function EmptyState({
  icon,
  title,
  description,
  actionText = 'Add New',
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className='text-center py-12 px-4'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='rounded-full bg-muted p-3'>{icon}</div>
        <h3 className='text-lg font-medium'>{title}</h3>
        <p className='text-muted-foreground max-w-sm'>{description}</p>
        {onActionClick && (
          <Button onClick={onActionClick} variant='outline'>
            <Plus className='mr-2 h-4 w-4' /> {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
