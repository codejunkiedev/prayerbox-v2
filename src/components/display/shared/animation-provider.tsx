import type { ReactNode } from 'react';

interface AnimationProviderProps {
  children: ReactNode;
}

/**
 * Provides staggered animation effects for child elements with opacity and slide-up transitions
 */
export function AnimationProvider({ children }: AnimationProviderProps) {
  return <div className='flex flex-col stagger-children'>{children}</div>;
}
