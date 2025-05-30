import { useEffect, useState } from 'react';
import { getEvents, deleteEvent, toggleEventVisibility, updateEventsOrder } from '@/lib/supabase';
import type { Event } from '@/types';
import { Switch } from '@/components/ui';
import { TableSkeleton } from '@/components/skeletons';
import { EventModal, DeleteConfirmationModal } from '@/components/modals';
import {
  PageHeader,
  ErrorAlert,
  EmptyState,
  ActionButtons,
  DraggableDataTable,
  type Column,
} from '@/components/common';
import { Calendar } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { formatDateWithTime } from '@/utils';
import { toast } from 'sonner';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Event | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to fetch events');
        toast.error('Failed to fetch events');
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

  const handleEdit = (item: Event) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  const handleDeleteClick = (item: Event) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deleteEvent(itemToDelete.id);
      forceUpdate();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete event. Please try again.');
      toast.error('Failed to delete event, please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleVisibilityToggle = async (item: Event) => {
    if (isTogglingVisibility) return;

    const newVisibleState = !item.visible;
    setEvents(currentItems =>
      currentItems.map(i => (i.id === item.id ? { ...i, visible: newVisibleState } : i))
    );

    try {
      setIsTogglingVisibility(true);
      await toggleEventVisibility(item.id, newVisibleState);
      toast.success('Event visibility updated');
    } catch (err) {
      setEvents(currentItems =>
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

  const handleOrderChange = async (items: Event[]) => {
    if (isUpdatingOrder) return;

    try {
      setIsUpdatingOrder(true);
      const itemsCopy = [...items];
      const updatedItems = itemsCopy.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));

      await updateEventsOrder(updatedItems);

      setEvents(itemsCopy);
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

  const columns: Column<Event>[] = [
    {
      key: 'title',
      name: 'Title',
      width: 'w-[20%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden font-medium'>
          {value as string}
        </div>
      ),
    },
    {
      key: 'description',
      name: 'Description',
      width: 'w-[30%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden'>{value as string}</div>
      ),
    },
    {
      key: 'date_time',
      name: 'Date & Time',
      width: 'w-[20%]',
      render: value => <div>{value ? formatDateWithTime(value as string) : ''}</div>,
    },
    {
      key: 'location',
      name: 'Location',
      width: 'w-[20%]',
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
          aria-label={`Toggle visibility for event`}
        />
      ),
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Events'
        description='Manage your masjid events and programs'
        onAddClick={handleAddNew}
        showReorderingButton={events.length > 1}
        onToggleReordering={toggleDraggable}
        isReorderingEnabled={isDraggable}
      />

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {loading ? (
        <TableSkeleton columns={columns} showRowNumbers={true} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar className='h-6 w-6 text-muted-foreground' />}
          title='No events found'
          description="You haven't added any events yet. Add your first one to get started."
          actionText='Add First Event'
          onActionClick={handleAddNew}
        />
      ) : (
        <DraggableDataTable
          columns={columns}
          data={events}
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

      <EventModal
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
        itemType='event'
        itemTitle={itemToDelete?.title}
        itemSubtitle={itemToDelete?.date_time ? formatDateWithTime(itemToDelete.date_time) : ''}
      />
    </div>
  );
}
