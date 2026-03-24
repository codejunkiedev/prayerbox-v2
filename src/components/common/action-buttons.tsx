import { Button } from '@/components/ui';
import { Edit, Trash2, Monitor } from 'lucide-react';

type ActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
  onScreens?: () => void;
  centered?: boolean;
};

/**
 * Renders action buttons for editing, deleting, and optionally assigning to screens
 */
export function ActionButtons({
  onEdit,
  onDelete,
  onScreens,
  centered = true,
}: ActionButtonsProps) {
  return (
    <div className={`flex ${centered ? 'justify-center' : ''} space-x-1`}>
      {onScreens && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onScreens}
          title='Assign to screens'
          className='hover:bg-muted'
        >
          <Monitor className='h-4 w-4' />
        </Button>
      )}
      <Button variant='ghost' size='sm' onClick={onEdit} title='Edit' className='hover:bg-muted'>
        <Edit className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={onDelete}
        title='Delete'
        className='hover:bg-destructive/10 hover:text-destructive'
      >
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </div>
  );
}
