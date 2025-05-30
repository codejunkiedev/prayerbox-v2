import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/components/ui';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  itemType?: string;
  itemTitle?: string;
  itemSubtitle?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  itemType = 'item',
  itemTitle,
  itemSubtitle,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {itemType}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {(itemTitle || itemSubtitle) && (
          <div className='mt-2 p-4 bg-gray-50 rounded border border-gray-200'>
            {itemTitle && <p className='font-medium'>{itemTitle}</p>}
            {itemSubtitle && <p className='text-sm text-gray-600 mt-1'>{itemSubtitle}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationModal;
