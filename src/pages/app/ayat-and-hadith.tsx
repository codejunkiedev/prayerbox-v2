import { useEffect, useState } from 'react';
import { getAyatAndHadith, deleteAyatAndHadith } from '@/lib/supabase';
import type { AyatAndHadith } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Skeleton,
} from '@/components/ui';
import { AyatAndHadithModal, DeleteConfirmationModal } from '@/components/modals';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useTrigger } from '@/hooks';

function TableSkeleton() {
  return (
    <div className='rounded-md border overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='max-w-[300px] w-[35%]'>Text</TableHead>
            <TableHead className='max-w-[300px] w-[35%]'>Translation</TableHead>
            <TableHead className='max-w-[150px] w-[15%]'>Reference</TableHead>
            <TableHead className='w-[10%]'>Type</TableHead>
            <TableHead className='w-[5%]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-4 w-[80%]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[90%]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[60%]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[40%]' />
              </TableCell>
              <TableCell>
                <div className='flex space-x-1'>
                  <Skeleton className='h-8 w-8 rounded-md' />
                  <Skeleton className='h-8 w-8 rounded-md' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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

  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Ayat and Hadith</h1>
        <Button onClick={handleAddNew}>
          <Plus className='mr-2 h-4 w-4' /> Add New
        </Button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          {ayatAndHadith.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No ayat or hadith found. Add some to get started.</p>
            </div>
          ) : (
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='max-w-[300px] w-[35%]'>Text</TableHead>
                    <TableHead className='max-w-[300px] w-[35%]'>Translation</TableHead>
                    <TableHead className='max-w-[150px] w-[15%]'>Reference</TableHead>
                    <TableHead className='w-[10%]'>Type</TableHead>
                    <TableHead className='w-[5%]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ayatAndHadith.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium max-w-[300px] truncate'>
                        {item.text}
                      </TableCell>
                      <TableCell className='max-w-[300px] truncate'>{item.translation}</TableCell>
                      <TableCell className='max-w-[150px] truncate'>{item.reference}</TableCell>
                      <TableCell className='capitalize'>{item.type}</TableCell>
                      <TableCell>
                        <div className='flex space-x-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEdit(item)}
                            title='Edit'
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteClick(item)}
                            title='Delete'
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
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
