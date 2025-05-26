import { useEffect, useState } from 'react';
import {
  getAnnouncements,
  deleteAnnouncement,
  toggleAnnouncementVisibility,
  updateAnnouncementsOrder,
} from '@/lib/supabase';
import type { Announcement } from '@/types';
import { Switch } from '@/components/ui';
import { TableSkeleton } from '@/components/skeletons';
import { AnnouncementModal, DeleteConfirmationModal } from '@/components/modals';
import {
  PageHeader,
  ErrorAlert,
  EmptyState,
  ActionButtons,
  DraggableDataTable,
  type Column,
} from '@/components/common';
import { Bell } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { toast } from 'sonner';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Announcement | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        setError('Failed to fetch announcements');
        toast.error('Failed to fetch announcements');
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
      toast.success('Announcement deleted successfully');
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete announcement. Please try again.');
      toast.error('Failed to delete announcement, please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleVisibilityToggle = async (item: Announcement) => {
    if (isTogglingVisibility) return;

    const newVisibleState = !item.visible;
    setAnnouncements(currentItems =>
      currentItems.map(i => (i.id === item.id ? { ...i, visible: newVisibleState } : i))
    );

    try {
      setIsTogglingVisibility(true);
      await toggleAnnouncementVisibility(item.id, newVisibleState);
      toast.success('Announcement visibility updated');
    } catch (err) {
      setAnnouncements(currentItems =>
        currentItems.map(i => (i.id === item.id ? { ...i, visible: item.visible } : i))
      );
      console.error('Error toggling visibility:', err);
      setError('Failed to update visibility. Please try again.');
      toast.error('Failed to update visibility, please try again.');
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const toggleDraggable = () => {
    setIsDraggable(prev => !prev);
  };

  const handleOrderChange = async (items: Announcement[]) => {
    if (isUpdatingOrder) return;

    try {
      setIsUpdatingOrder(true);
      const itemsCopy = [...items];
      const updatedItems = itemsCopy.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));

      await updateAnnouncementsOrder(updatedItems);

      setAnnouncements(itemsCopy);
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

  const columns: Column<Announcement>[] = [
    {
      key: 'description',
      name: 'Description',
      width: 'w-[80%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden'>{value as string}</div>
      ),
    },
    {
      key: 'visible',
      name: 'Visible',
      width: 'w-[10%]',
      render: (value, item) => (
        <Switch
          checked={!!value}
          onCheckedChange={() => handleVisibilityToggle(item)}
          disabled={isTogglingVisibility}
          aria-label={`Toggle visibility for announcement`}
        />
      ),
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Announcements'
        description='Manage your masjid announcements'
        onAddClick={handleAddNew}
        showReorderingButton={announcements.length > 1}
        onToggleReordering={toggleDraggable}
        isReorderingEnabled={isDraggable}
      />

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {loading ? (
        <TableSkeleton columns={columns} showRowNumbers={true} />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Bell className='h-6 w-6 text-muted-foreground' />}
          title='No announcements found'
          description="You haven't added any announcements yet. Add your first one to get started."
          actionText='Add First Announcement'
          onActionClick={handleAddNew}
        />
      ) : (
        <DraggableDataTable
          columns={columns}
          data={announcements}
          keyField='id'
          showRowNumbers={true}
          actionsWidth='w-[10%]'
          isDraggable={isDraggable}
          onOrderChange={handleOrderChange}
          renderActions={item => (
            <ActionButtons
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
            />
          )}
        />
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
