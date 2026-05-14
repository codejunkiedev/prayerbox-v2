import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { PrayerTimesSection } from '@/components/settings';

interface PrayerCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function PrayerCalculationModal({ isOpen, onClose, onSaved }: PrayerCalculationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[640px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Prayer Time Calculation</DialogTitle>
          <DialogDescription>
            Configure the calculation method, juristic school, and location used for prayer time
            calculations.
          </DialogDescription>
        </DialogHeader>
        <PrayerTimesSection onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  );
}
