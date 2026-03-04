import { AlertTriangle, RefreshCcw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import bgImage from '@/assets/backgrounds/06.jpeg';
import { useDisplayStore } from '@/store';
import { useState } from 'react';

export type ErrorMessage = { title: string; description: string };

interface ErrorDisplayProps {
  errorMessage: ErrorMessage | null;
  className?: string;
}

/**
 * Error display component for the main display screen
 * Shows error messages with a styled background and refresh option
 */
export function ErrorDisplay({ errorMessage, className }: ErrorDisplayProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { signOut } = useDisplayStore();

  const handleSignOut = () => {
    try {
      setIsSigningOut(true);
      signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!errorMessage) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-screen w-full overflow-hidden relative bg-cover bg-center',
        className
      )}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 backdrop-blur-sm z-0 animate-fade-in'></div>

      <div className='absolute top-0 left-0 w-48 h-48 z-10 animate-slide-in-left'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      <div className='absolute bottom-0 right-0 w-48 h-48 z-10 animate-slide-in-right'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      <div className='flex flex-col items-center justify-center h-full w-full px-4 py-8 z-20'>
        <div className='w-full max-w-2xl bg-black/30 backdrop-blur-md rounded-xl border border-white/10 animate-fade-in-up'>
          <div className='p-6 sm:p-8 flex flex-col items-center text-center animate-pulse-shadow'>
            <div className='animate-scale-fade-in'>
              <AlertTriangle className='h-12 w-12 text-red-500 mb-4' />
            </div>
            <h2 className='text-2xl font-semibold text-white mb-2 animate-fade-in-down animation-delay-200'>
              {errorMessage.title}
            </h2>
            <p className='text-white/80 mb-6 animate-fade-in animation-delay-300'>
              {errorMessage.description}
            </p>
            <div className='flex gap-4 flex-col sm:flex-row animate-fade-in-up animation-delay-500'>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='mt-2 hover:bg-white/10'
              >
                <div className='mr-2 animate-spin-slow'>
                  <RefreshCcw className='w-4 h-4' />
                </div>
                Try Again
              </Button>
              <Button
                onClick={handleSignOut}
                variant='destructive'
                className='mt-2 hover:bg-red-600/80'
                disabled={isSigningOut}
              >
                <LogOut className='w-4 h-4 mr-2' />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
