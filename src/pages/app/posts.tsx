import { useEffect, useState } from 'react';
import { getPosts, deletePost, togglePostVisibility } from '@/lib/supabase';
import type { Post } from '@/types';
import { TableSkeleton } from '@/components/skeletons';
import { PostModal, DeleteConfirmationModal } from '@/components/modals';
import {
  PageHeader,
  ErrorAlert,
  EmptyState,
  ActionButtons,
  DataTable,
  type Column,
} from '@/components/common';
import { FileImage } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { Popover, PopoverContent, PopoverTrigger, Switch } from '@/components/ui';
import { toast } from 'sonner';

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Post | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        setError('Failed to fetch posts');
        toast.error('Failed to fetch posts');
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

  const handleEdit = (item: Post) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  };

  const handleDeleteClick = (item: Post) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await deletePost(itemToDelete.id);
      forceUpdate();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success('Post deleted successfully');
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete post. Please try again.');
      toast.error('Failed to delete post, please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleVisibilityToggle = async (item: Post) => {
    try {
      setIsTogglingVisibility(true);
      await togglePostVisibility(item.id, !item.visible);
      forceUpdate();
      toast.success('Post visibility updated');
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('Failed to update visibility. Please try again.');
      toast.error('Failed to update visibility, please try again.');
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const columns: Column<Post>[] = [
    {
      key: 'image_url',
      name: 'Image',
      width: 'w-[100px]',
      render: value =>
        value ? (
          <Popover>
            <PopoverTrigger asChild>
              <div className='w-12 h-12 relative cursor-zoom-in'>
                <img
                  src={value as string}
                  alt='Post'
                  className='absolute inset-0 w-full h-full object-cover rounded-md aspect-square'
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className='p-0 w-80'>
              <div className='relative aspect-square w-full overflow-hidden'>
                <img
                  src={value as string}
                  alt='Post enlarged'
                  className='w-full h-full object-cover'
                />
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div className='w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md aspect-square'>
            <FileImage className='w-6 h-6 text-gray-400' />
          </div>
        ),
    },
    {
      key: 'title',
      name: 'Title',
      width: 'w-[70%]',
      render: value => (
        <div className='whitespace-pre-wrap line-clamp-1 overflow-hidden font-medium'>
          {value as string}
        </div>
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
          aria-label={`Toggle visibility for post`}
        />
      ),
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader title='Posts' description='Manage your masjid posts' onAddClick={handleAddNew} />

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {loading ? (
        <TableSkeleton columns={columns} showRowNumbers={true} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<FileImage className='h-6 w-6 text-muted-foreground' />}
          title='No posts found'
          description="You haven't added any posts yet. Add your first one to get started."
          actionText='Add First Post'
          onActionClick={handleAddNew}
        />
      ) : (
        <DataTable
          columns={columns}
          data={posts}
          keyField='id'
          showRowNumbers={true}
          actionsWidth='w-[10%]'
          renderActions={item => (
            <ActionButtons
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
            />
          )}
        />
      )}

      <PostModal
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
        itemType='post'
        itemTitle={itemToDelete?.title}
      />
    </div>
  );
}
