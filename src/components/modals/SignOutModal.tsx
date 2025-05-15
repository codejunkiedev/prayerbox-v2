import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import { signOut } from '@/lib/supabase';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle>Sign Out</DialogTitle>
          <DialogDescription className="text-slate-300">
            Are you sure you want to sign out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="default"
            onClick={onClose}
            className="mr-2 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button variant={'destructive'} onClick={handleSignOut}>
            Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
