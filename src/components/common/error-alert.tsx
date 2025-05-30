import { Card, CardContent } from '@/components/ui';
import { AlertCircle, X } from 'lucide-react';

type ErrorAlertProps = {
  message: string | null;
  onClose?: () => void;
};

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <Card className='border-destructive'>
      <CardContent className='p-3 flex items-center'>
        <AlertCircle className='h-4 w-4 text-destructive mr-2 flex-shrink-0' />
        <p className='text-destructive text-sm'>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className='ml-auto p-1 text-destructive/70 hover:text-destructive'
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
