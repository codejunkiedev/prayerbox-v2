import { Loader2 } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        <h2 className='text-xl font-medium text-muted-foreground'>Loading...</h2>
      </div>
    </div>
  );
}
