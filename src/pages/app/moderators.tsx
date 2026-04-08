import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getModerators, createModerator, revokeModerator } from '@/lib/supabase';
import type { ModeratorWithEmail } from '@/lib/supabase/services/moderators';
import { createModeratorSchema, type CreateModeratorData } from '@/lib/zod';
import { TableSkeleton } from '@/components/skeletons';
import { PageHeader, ErrorAlert, EmptyState, DataTable, type Column } from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { Users, Trash2, Eye, EyeOff } from 'lucide-react';
import { useTrigger } from '@/hooks';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function Moderators() {
  const [moderators, setModerators] = useState<ModeratorWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [moderatorToRevoke, setModeratorToRevoke] = useState<ModeratorWithEmail | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateModeratorData>({
    resolver: zodResolver(createModeratorSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getModerators();
        setModerators(data);
      } catch (err) {
        setError('Failed to fetch moderators');
        toast.error('Failed to fetch moderators');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trigger]);

  const handleAddNew = () => {
    reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    reset();
  };

  const onSubmitCreate = async (data: CreateModeratorData) => {
    try {
      setIsCreating(true);
      await createModerator(data.email, data.password);
      toast.success('Moderator created successfully');
      handleAddModalClose();
      forceUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create moderator';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeClick = (moderator: ModeratorWithEmail) => {
    setModeratorToRevoke(moderator);
    setIsRevokeModalOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!moderatorToRevoke) return;

    try {
      setIsRevoking(true);
      await revokeModerator(moderatorToRevoke.user_id);
      toast.success('Moderator revoked successfully');
      setIsRevokeModalOpen(false);
      setModeratorToRevoke(null);
      forceUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke moderator';
      toast.error(message);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeCancel = () => {
    setIsRevokeModalOpen(false);
    setModeratorToRevoke(null);
  };

  const columns: Column<ModeratorWithEmail>[] = [
    {
      key: 'email',
      name: 'Email',
      width: 'w-[40%]',
      render: value => <span className='font-medium'>{value as string}</span>,
    },
    {
      key: 'last_active_at',
      name: 'Last Active',
      width: 'w-[25%]',
      render: value =>
        value ? (
          <span className='text-muted-foreground'>
            {formatDistanceToNow(new Date(value as string), { addSuffix: true })}
          </span>
        ) : (
          <span className='text-muted-foreground italic'>Never</span>
        ),
    },
    {
      key: 'created_at',
      name: 'Added',
      width: 'w-[25%]',
      render: value => (
        <span className='text-muted-foreground'>
          {formatDistanceToNow(new Date(value as string), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <PageHeader
        title='Moderators'
        description='Manage moderators who can help manage your masjid content'
        addButtonText='Add Moderator'
        onAddClick={handleAddNew}
      />

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {loading ? (
        <TableSkeleton columns={columns} showRowNumbers={true} />
      ) : moderators.length === 0 ? (
        <EmptyState
          icon={<Users className='h-6 w-6 text-muted-foreground' />}
          title='No moderators yet'
          description='Add moderators to help manage your masjid content. Moderators can manage ayat, announcements, events, posts, and videos.'
          actionText='Add First Moderator'
          onActionClick={handleAddNew}
        />
      ) : (
        <DataTable
          columns={columns}
          data={moderators}
          keyField='id'
          showRowNumbers={true}
          actionsWidth='w-[10%]'
          renderActions={item => (
            <Button
              variant='ghost'
              size='icon'
              className='text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={() => handleRevokeClick(item)}
              title='Revoke moderator'
            >
              <Trash2 size={16} />
            </Button>
          )}
        />
      )}

      {/* Add Moderator Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={open => !open && handleAddModalClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Moderator</DialogTitle>
            <DialogDescription>
              Create an account for a new moderator. They will be able to manage content but not
              settings, screens, or prayer times.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitCreate)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='moderator@example.com'
                {...register('email')}
              />
              {errors.email && <p className='text-sm text-destructive'>{errors.email.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Minimum 8 characters'
                  {...register('password')}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.password && (
                <p className='text-sm text-destructive'>{errors.password.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm password'
                  {...register('confirmPassword')}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className='text-sm text-destructive'>{errors.confirmPassword.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleAddModalClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isCreating} loading={isCreating}>
                Create Moderator
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Modal */}
      <Dialog open={isRevokeModalOpen} onOpenChange={open => !open && handleRevokeCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Moderator</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this moderator? They will lose access immediately and
              their account will be deleted.
            </DialogDescription>
          </DialogHeader>

          {moderatorToRevoke && (
            <div className='mt-2 p-4 bg-muted rounded border'>
              <p className='font-medium text-foreground'>{moderatorToRevoke.email}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={handleRevokeCancel} disabled={isRevoking}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleRevokeConfirm}
              disabled={isRevoking}
              loading={isRevoking}
            >
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
