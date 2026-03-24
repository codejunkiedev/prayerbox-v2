import { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui';
import { getScreens, getScreensForContent, bulkUpdateScreenAssignments } from '@/lib/supabase';
import type { DisplayScreen, ScreenContentType } from '@/types';
import { toast } from 'sonner';

type ScreenAssignmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: ScreenContentType;
  contentLabel?: string;
};

export function ScreenAssignmentModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentLabel,
}: ScreenAssignmentModalProps) {
  const [screens, setScreens] = useState<DisplayScreen[]>([]);
  const [selectedScreenIds, setSelectedScreenIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !contentId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [allScreens, assignments] = await Promise.all([
          getScreens(),
          getScreensForContent(contentId, contentType),
        ]);
        setScreens(allScreens);
        setSelectedScreenIds(new Set(assignments.map(a => a.screen_id)));
      } catch (err) {
        console.error('Error fetching screen data:', err);
        toast.error('Failed to load screens');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, contentId, contentType]);

  const handleToggle = (screenId: string) => {
    setSelectedScreenIds(prev => {
      const next = new Set(prev);
      if (next.has(screenId)) {
        next.delete(screenId);
      } else {
        next.add(screenId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await bulkUpdateScreenAssignments(contentId, contentType, Array.from(selectedScreenIds));
      toast.success('Screen assignments updated');
      onClose();
    } catch (err) {
      console.error('Error saving screen assignments:', err);
      toast.error('Failed to update screen assignments');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[450px]'>
        <DialogHeader>
          <DialogTitle>Assign to Screens</DialogTitle>
          {contentLabel && (
            <p className='text-sm text-muted-foreground mt-1 line-clamp-1'>{contentLabel}</p>
          )}
        </DialogHeader>

        <div className='py-4'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin h-6 w-6 border-2 border-muted border-t-foreground rounded-full' />
            </div>
          ) : screens.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-8'>
              No screens created yet. Create a screen first from the Screens page.
            </p>
          ) : (
            <div className='space-y-3'>
              {screens.map(screen => (
                <div key={screen.id} className='flex items-center space-x-3'>
                  <Checkbox
                    id={`screen-${screen.id}`}
                    checked={selectedScreenIds.has(screen.id)}
                    onCheckedChange={() => handleToggle(screen.id)}
                    disabled={isSaving}
                  />
                  <label htmlFor={`screen-${screen.id}`} className='text-sm cursor-pointer flex-1'>
                    {screen.name}
                    <span className='text-muted-foreground ml-2'>({screen.code})</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || isLoading || screens.length === 0}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
