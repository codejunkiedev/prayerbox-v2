import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export type ErrorMessage = { title: string; description: string };

interface ErrorDisplayProps {
  errorMessage: ErrorMessage | null;
  className?: string;
}

export function ErrorDisplay({ errorMessage, className }: ErrorDisplayProps) {
  if (!errorMessage) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-screen w-full bg-primary-foreground overflow-hidden relative',
        className
      )}
    >
      <div className='absolute top-0 left-0 w-48 h-48 opacity-20'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      <div className='absolute bottom-0 right-0 w-48 h-48 opacity-20'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      <div className='flex flex-col items-center justify-center h-full w-full px-4 py-8 z-10'>
        <Card className='w-full max-w-2xl bg-card/95 backdrop-blur-sm'>
          <CardContent className='p-6 flex flex-col items-center text-center'>
            <AlertTriangle className='h-12 w-12 text-destructive mb-4' />
            <h2 className='text-2xl font-semibold text-destructive mb-2'>{errorMessage.title}</h2>
            <p className='text-muted-foreground mb-6'>{errorMessage.description}</p>
            <Button onClick={() => window.location.reload()} variant='outline' className='mt-2'>
              <RefreshCcw className='w-4 h-4' />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
