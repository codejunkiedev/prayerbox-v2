import { useEffect, useState } from 'react';
import { getAnnouncements, deleteAnnouncement } from '@/lib/supabase';
import type { Announcement } from '@/types';
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
} from '@/components/ui';
import { AnnouncementModal, DeleteConfirmationModal } from '@/components/modals';
import { Plus, Edit, Trash2, AlertCircle, Bell } from 'lucide-react';
import { useTrigger } from '@/hooks';

function TableSkeleton() {
  return (
    <div className='rounded-md overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[85%]'>Description</TableHead>
            <TableHead className='w-[15%] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-4 w-[90%]' />
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end space-x-1'>
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

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Announcement | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        setError('Failed to fetch announcements');
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

  const handleEdit = (item: Announcement) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  const handleDeleteClick = (item: Announcement) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteAnnouncement(itemToDelete.id);
      forceUpdate();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete announcement. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Manage your masjid announcements</CardDescription>
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
      ) : announcements.length === 0 ? (
        <div className='text-center py-12 px-4'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='rounded-full bg-muted p-3'>
              <Bell className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>No announcements found</h3>
            <p className='text-muted-foreground max-w-sm'>
              You haven't added any announcements yet. Add your first one to get started.
            </p>
            <Button onClick={handleAddNew} variant='outline'>
              <Plus className='mr-2 h-4 w-4' /> Add First Announcement
            </Button>
          </div>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50'>
                <TableHead className='w-[90%]'>Description</TableHead>
                <TableHead className='w-[10%] text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map(item => (
                <TableRow key={item.id} className='hover:bg-muted/30'>
                  <TableCell>
                    <div className='whitespace-pre-wrap line-clamp-2 overflow-hidden'>
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex justify-center space-x-1'>
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

      <AnnouncementModal
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
        itemType='announcement'
        itemTitle={itemToDelete?.description}
      />
    </div>
  );
}
