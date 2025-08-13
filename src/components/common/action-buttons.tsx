import { Button } from '@/components/ui';
import { Edit, Trash2 } from 'lucide-react';

type ActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
  centered?: boolean;
};

/**
 * Renders a pair of action buttons for editing and deleting items with icons
 */
export function ActionButtons({ onEdit, onDelete, centered = true }: ActionButtonsProps) {
  return (
    <div className={`flex ${centered ? 'justify-center' : ''} space-x-1`}>
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
