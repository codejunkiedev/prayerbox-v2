import { useEffect, useState } from 'react';
import { getAyatAndHadith, deleteAyatAndHadith } from '@/lib/supabase';
import type { AyatAndHadith } from '@/types';
import { Badge } from '@/components/ui';
import { TableSkeleton } from '@/components/skeletons';
import { AyatAndHadithModal, DeleteConfirmationModal } from '@/components/modals';
import {
  PageHeader,
  ErrorAlert,
  EmptyState,
  ActionButtons,
  DataTable,
  type Column,
} from '@/components/common';
import { BookOpen, BookText } from 'lucide-react';
import { useTrigger } from '@/hooks';

export default function AyatAndHadithPage() {
  const [ayatAndHadith, setAyatAndHadith] = useState<AyatAndHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AyatAndHadith | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AyatAndHadith | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAyatAndHadith();
        setAyatAndHadith(data);
      } catch (err) {
        setError('Failed to fetch ayat and hadith data');
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
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const getTypeIcon = (type: string) => {
    return type === 'ayat' ? <BookOpen className='h-4 w-4' /> : <BookText className='h-4 w-4' />;
  };

  const columns: Column<AyatAndHadith>[] = [
    {
      key: 'text',
      name: 'Text',
      width: 'max-w-[300px] w-[35%]',
      render: (value, item) => (
        <div className='font-medium max-w-[300px]'>
          <div className='truncate' title={item.text}>
            {value as string}
          </div>
        </div>
      ),
    },
    {
      key: 'translation',
      name: 'Translation',
      width: 'max-w-[300px] w-[35%]',
      render: (value, item) => (
        <div className='max-w-[300px]'>
          <div className='truncate' title={item.translation}>
            {value as string}
          </div>
        </div>
      ),
    },
    {
      key: 'reference',
      name: 'Reference',
      width: 'max-w-[150px] w-[15%]',
      render: (value, item) => (
        <div className='max-w-[150px]'>
          <div className='truncate' title={item.reference}>
            {value as string}
          </div>
        </div>
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
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Ayat and Hadith'
        description='Manage your collection of Quranic verses and Hadith'
        onAddClick={handleAddNew}
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
        <DataTable
          columns={columns}
          data={ayatAndHadith}
          keyField='id'
          actionsWidth='w-[5%]'
          showRowNumbers={true}
          rowNumberWidth='w-[4%]'
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
