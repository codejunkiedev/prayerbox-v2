import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

// eslint-disable-next-line react-refresh/only-export-components
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='flex flex-col'
    >
      {children}
    </motion.div>
  );
}
