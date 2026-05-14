import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { HijriSection } from '@/components/settings';
import type { Settings } from '@/types';

interface HijriModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
}

export function HijriModal({ isOpen, onClose, settings, onSettingsChange }: HijriModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-[640px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Hijri Date Adjustment</DialogTitle>
          <DialogDescription>
            Configure the Hijri calendar calculation method and date offset for accurate Islamic
            dates.
          </DialogDescription>
        </DialogHeader>
        <HijriSection settings={settings} onSettingsChange={onSettingsChange} isLoading={false} />
      </DialogContent>
    </Dialog>
  );
}
