import { motion } from 'framer-motion';
import { itemVariants } from './animation-provider';

interface DisplayHeadingProps {
  title: string;
  underlineWidth?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
}

export function DisplayHeading({ title, underlineWidth = 'md', size = 'md' }: DisplayHeadingProps) {
  // Underline width classes
  const underlineWidthClasses = {
    sm: 'w-16',
    md: 'w-24',
    lg: 'w-32',
  };

  // Heading size classes
  const headingSizeClasses = {
    sm: 'text-lg sm:text-xl md:text-2xl',
    md: 'text-xl sm:text-2xl md:text-3xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl',
  };

  return (
    <motion.div variants={itemVariants} className='text-center mb-6'>
      <motion.h2 className={`${headingSizeClasses[size]} font-bold text-white text-center`}>
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={`h-1 ${underlineWidthClasses[underlineWidth]} bg-white/30 mx-auto rounded-full mt-2`}
      ></motion.div>
    </motion.div>
  );
}
