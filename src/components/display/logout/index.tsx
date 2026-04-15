import { Button } from '@/components/ui';
import { useDisplayStore } from '@/store';
import { DisplayContainer } from '../shared';
import { AnimationProvider } from '../shared/animation-provider';
import bgImage from '@/assets/backgrounds/05.jpeg';

/**
 * Displays a development mode logout interface with administrative controls
 */
export function LogoutDisplay() {
  const { signOut } = useDisplayStore();

  const handleLogout = () => {
    signOut();
  };

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <AnimationProvider>
        <div className='flex flex-col items-center justify-center w-full max-w-7xl mx-auto relative z-10'>
          <div className='text-center space-y-6 mb-12 stagger-item animate-fade-in-up'>
            <h1 className='text-6xl font-bold text-white drop-shadow-lg'>Development Mode</h1>
            <p className='text-2xl text-white/90 drop-shadow-md'>Administrative Controls</p>
          </div>

          <div className='relative z-20 stagger-item animate-fade-in-up'>
            <Button
              onClick={handleLogout}
              variant='destructive'
              size='lg'
              className='px-12 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 relative z-30'
            >
              Logout
            </Button>
          </div>
        </div>
      </AnimationProvider>
    </DisplayContainer>
  );
}
