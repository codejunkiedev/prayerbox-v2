import { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '@/lib/supabase';
import type { Event } from '@/types';
import { TableSkeleton } from '@/components/skeletons';
import { EventModal, DeleteConfirmationModal } from '@/components/modals';
import {
  PageHeader,
  ErrorAlert,
  EmptyState,
  ActionButtons,
  DataTable,
  type Column,
} from '@/components/common';
import { Calendar } from 'lucide-react';
import { useTrigger } from '@/hooks';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Event | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to fetch events');
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
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns: Column<Event>[] = [
    {
      key: 'title',
      name: 'Title',
      width: 'w-[20%]',
      render: value => <div className='font-medium'>{value as string}</div>,
    },
    {
      key: 'date_time',
      name: 'Date & Time',
      width: 'w-[15%]',
    },
    {
      key: 'location',
      name: 'Location',
      width: 'w-[15%]',
    },
    {
      key: 'chief_guest',
      name: 'Chief Guest',
      width: 'w-[15%]',
    },
    {
      key: 'description',
      name: 'Description',
      width: 'w-[25%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-2 overflow-hidden'>{value as string}</div>
      ),
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Events'
        description='Manage your masjid events and programs'
        onAddClick={handleAddNew}
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
        <DataTable
          columns={columns}
          data={events}
          keyField='id'
          showRowNumbers={true}
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
        itemSubtitle={itemToDelete?.date_time}
      />
    </div>
  );
}
