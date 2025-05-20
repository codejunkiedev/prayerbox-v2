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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';
import { AyatAndHadithModal, DeleteConfirmationModal } from '@/components/modals';
import { Plus, Edit, Trash2, AlertCircle, BookOpen, BookText } from 'lucide-react';
import { useTrigger } from '@/hooks';

function TableSkeleton() {
  return (
    <div className='rounded-md overflow-x-auto'>
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

  const getTypeIcon = (type: string) => {
    return type === 'ayat' ? <BookOpen className='h-4 w-4' /> : <BookText className='h-4 w-4' />;
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Ayat and Hadith</CardTitle>
              <CardDescription>Manage your collection of Quranic verses and Hadith</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className='mr-2 h-4 w-4' /> Add New
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className='border-destructive'>
          <CardContent className='p-4 flex items-center'>
            <AlertCircle className='h-5 w-5 text-destructive mr-2' />
            <p className='text-destructive'>{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <TableSkeleton />
      ) : ayatAndHadith.length === 0 ? (
        <div className='text-center py-12 px-4'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='rounded-full bg-muted p-3'>
              <BookOpen className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>No entries found</h3>
            <p className='text-muted-foreground max-w-sm'>
              You haven't added any ayat or hadith yet. Add your first one to get started.
            </p>
            <Button onClick={handleAddNew} variant='outline'>
              <Plus className='mr-2 h-4 w-4' /> Add First Entry
            </Button>
          </div>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50'>
                <TableHead className='max-w-[300px] w-[35%]'>Text</TableHead>
                <TableHead className='max-w-[300px] w-[35%]'>Translation</TableHead>
                <TableHead className='max-w-[150px] w-[15%]'>Reference</TableHead>
                <TableHead className='w-[10%]'>Type</TableHead>
                <TableHead className='w-[5%] text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ayatAndHadith.map(item => (
                <TableRow key={item.id} className='hover:bg-muted/30'>
                  <TableCell className='font-medium max-w-[300px]'>
                    <div className='truncate' title={item.text}>
                      {item.text}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[300px]'>
                    <div className='truncate' title={item.translation}>
                      {item.translation}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[150px]'>
                    <div className='truncate' title={item.reference}>
                      {item.reference}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.type === 'ayat' ? 'default' : 'secondary'}
                      className='flex items-center gap-1'
                    >
                      {getTypeIcon(item.type)}
                      <span className='capitalize'>{item.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex space-x-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(item)}
                        title='Edit'
                        className='hover:bg-muted'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteClick(item)}
                        title='Delete'
                        className='hover:bg-destructive/10 hover:text-destructive'
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
