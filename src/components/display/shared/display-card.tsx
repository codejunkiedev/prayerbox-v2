import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface DisplayCardProps {
  children: ReactNode;
  width?: 'xs' | 'sm' | 'md' | 'lg';
  padding?: 'small' | 'medium' | 'large';
}

/**
 * A reusable card component with glass morphism effect, configurable width and padding, and pulsing shadow animation
 */
export function DisplayCard({ children, width = 'md', padding = 'medium' }: DisplayCardProps) {
  // Width classes based on the width prop
  const widthClasses = {
    xs: 'w-full max-w-xs sm:max-w-sm md:max-w-md',
    sm: 'w-full max-w-sm sm:max-w-md md:max-w-lg',
    md: 'w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl [@media(min-width:3000px)]:max-w-[1613px] [@media(min-width:4000px)]:max-w-[2150px]',
    lg: 'w-full max-w-lg sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-screen-2xl [@media(min-width:3000px)]:max-w-[2310px] [@media(min-width:4000px)]:max-w-[2625px]',
  };

  // Padding classes based on the padding prop
  const paddingClasses = {
    small: 'p-3 sm:p-4 md:p-5 lg:p-6',
    medium: 'p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12',
    large:
      'p-5 sm:p-7 md:p-10 lg:p-12 xl:p-14 2xl:p-16 [@media(min-width:3000px)]:p-18 [@media(min-width:4000px)]:p-20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`${widthClasses[width]} z-10`}
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 10px 0px rgba(255, 255, 255, 0.1)',
            '0 0 20px 3px rgba(255, 255, 255, 0.2)',
            '0 0 10px 0px rgba(255, 255, 255, 0.1)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`${paddingClasses[padding]} bg-black/30 backdrop-blur-md rounded-xl border border-white/10`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
