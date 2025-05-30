import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface DisplayContainerProps {
  children: ReactNode;
  backgroundImage: string;
}

export function DisplayContainer({ children, backgroundImage }: DisplayContainerProps) {
  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen w-full overflow-hidden relative bg-cover bg-center'
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className='absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm z-0'
      ></motion.div>

      {children}
    </div>
  );
}
