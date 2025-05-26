import { useEffect, useState } from 'react';
import {
  getAyatAndHadith,
  deleteAyatAndHadith,
  toggleAyatAndHadithVisibility,
  updateAyatAndHadithOrder,
} from '@/lib/supabase';
import type { AyatAndHadith } from '@/types';
import { Badge, Switch } from '@/components/ui';
import { TableSkeleton } from '@/components/skeletons';
import { AyatAndHadithModal, DeleteConfirmationModal } from '@/components/modals';
import {
  PageHeader,
  ErrorAlert,
  EmptyState,
  ActionButtons,
  DraggableDataTable,
  type Column,
} from '@/components/common';
import { BookOpen, BookText } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { toast } from 'sonner';

export default function AyatAndHadithPage() {
  const [ayatAndHadith, setAyatAndHadith] = useState<AyatAndHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AyatAndHadith | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AyatAndHadith | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAyatAndHadith();
        setAyatAndHadith(data);
      } catch (err) {
        setError('Failed to fetch ayat and hadith data');
        toast.error('Failed to fetch ayat and hadith data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trigger]);

  const handleAddNew = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: AyatAndHadith) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  const handleDeleteClick = (item: AyatAndHadith) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteAyatAndHadith(itemToDelete.id);
      forceUpdate();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success(`${itemToDelete.type === 'ayat' ? 'Ayat' : 'Hadith'} deleted successfully`);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
      toast.error(
        `Failed to delete ${itemToDelete.type === 'ayat' ? 'ayat' : 'hadith'}, please try again.`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleVisibilityToggle = async (item: AyatAndHadith) => {
    if (isTogglingVisibility) return;

    const newVisibleState = !item.visible;
    setAyatAndHadith(currentItems =>
      currentItems.map(i => (i.id === item.id ? { ...i, visible: newVisibleState } : i))
    );

    try {
      setIsTogglingVisibility(true);
      await toggleAyatAndHadithVisibility(item.id, newVisibleState);
      toast.success(`${item.type === 'ayat' ? 'Ayat' : 'Hadith'} visibility updated`);
    } catch (err) {
      setAyatAndHadith(currentItems =>
        currentItems.map(i => (i.id === item.id ? { ...i, visible: item.visible } : i))
      );
      console.error('Error toggling visibility:', err);
      setError('Failed to update visibility. Please try again.');
      toast.error(`Failed to update visibility, please try again.`);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleOrderChange = async (items: AyatAndHadith[]) => {
    if (isUpdatingOrder) return;

    try {
      setIsUpdatingOrder(true);
      const itemsCopy = [...items];
      const updatedItems = itemsCopy.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));

      await updateAyatAndHadithOrder(updatedItems);

      setAyatAndHadith(itemsCopy);
      toast.success('Order updated successfully');
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again.');
      toast.error('Failed to update order, please try again.');
      forceUpdate();
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const toggleDraggable = () => {
    setIsDraggable(prev => !prev);
  };

  const getTypeIcon = (type: string) => {
    return type === 'ayat' ? <BookOpen className='h-4 w-4' /> : <BookText className='h-4 w-4' />;
  };

  const columns: Column<AyatAndHadith>[] = [
    {
      key: 'text',
      name: 'Text',
      width: 'w-[30%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden'>{value as string}</div>
      ),
    },
    {
      key: 'translation',
      name: 'Translation',
      width: 'w-[30%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden'>{value as string}</div>
      ),
    },
    {
      key: 'reference',
      name: 'Reference',
      width: 'w-[15%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden'>{value as string}</div>
      ),
    },
    {
      key: 'type',
      name: 'Type',
      width: 'w-[10%]',
      render: value => (
        <Badge variant={'default'} className='flex items-center gap-1'>
          {getTypeIcon(value as string)}
          <span className='capitalize'>{value as string}</span>
        </Badge>
      ),
    },
    {
      key: 'visible',
      name: 'Visible',
      width: 'w-[10%]',
      render: (value, item) => (
        <Switch
          checked={!!value}
          disabled={isTogglingVisibility}
          onCheckedChange={() => handleVisibilityToggle(item)}
          aria-label={`Toggle visibility for ${item.type}`}
        />
      ),
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Ayat and Hadith'
        description='Manage your collection of Quranic verses and Hadith'
        onAddClick={handleAddNew}
        showReorderingButton
        onToggleReordering={toggleDraggable}
        isReorderingEnabled={isDraggable}
      />

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {loading ? (
        <TableSkeleton columns={columns} showRowNumbers={true} rowNumberWidth='w-[4%]' />
      ) : ayatAndHadith.length === 0 ? (
        <EmptyState
          icon={<BookOpen className='h-6 w-6 text-muted-foreground' />}
          title='No entries found'
          description="You haven't added any ayat or hadith yet. Add your first one to get started."
          actionText='Add First Entry'
          onActionClick={handleAddNew}
        />
      ) : (
        <DraggableDataTable
          columns={columns}
          data={ayatAndHadith}
          keyField='id'
          actionsWidth='w-[5%]'
          showRowNumbers={true}
          rowNumberWidth='w-[4%]'
          isDraggable={isDraggable}
          onOrderChange={handleOrderChange}
          renderActions={item => (
            <ActionButtons
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
              centered={false}
            />
          )}
        />
      )}

      <AyatAndHadithModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={forceUpdate}
        initialData={selectedItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemType={itemToDelete?.type || 'item'}
        itemTitle={itemToDelete?.text}
        itemSubtitle={itemToDelete?.reference}
      />
    </div>
  );
}
