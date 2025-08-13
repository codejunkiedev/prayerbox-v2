import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Map,
} from '@/components/ui';
import { isDev } from '@/utils';
import { toast } from 'sonner';

type MapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCoordinatesSelect: (latitude: number, longitude: number) => void;
  coordinates: { latitude: number; longitude: number } | null;
};

/**
 * Modal component that displays an interactive map for selecting masjid location coordinates
 */
export function MapModal({ isOpen, onClose, onCoordinatesSelect, coordinates }: MapModalProps) {
  const handleSave = () => {
    if (coordinates) {
      onCoordinatesSelect(coordinates.latitude, coordinates.longitude);
      toast.success('Location picked successfully');
      onClose();
    } else {
      toast.warning('Please select a location on the map');
    }
  };

  const handleReset = () => {
    // @ts-expect-error - we want to reset the coordinates
    onCoordinatesSelect(null, null);
    toast.success('Location reset successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Select Masjid Location</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <Map onCoordinatesChange={onCoordinatesSelect} coordinates={coordinates} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          {isDev && (
            <Button variant='destructive' onClick={handleReset}>
              Reset Location
            </Button>
          )}
          <Button onClick={handleSave}>Select Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
