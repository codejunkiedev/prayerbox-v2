import { motion } from 'framer-motion';
import { itemVariants } from './animation-provider';

interface DisplayHeadingProps {
  title: string;
  underlineWidth?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated heading component with customizable size and underline width for display screens
 */
export function DisplayHeading({ title, underlineWidth = 'md', size = 'md' }: DisplayHeadingProps) {
  // Underline width classes
  const underlineWidthClasses = {
    sm: 'max-w-[60%]',
    md: 'max-w-[80%]',
    lg: 'max-w-[100%]',
  };

  // Heading size classes
  const headingSizeClasses = {
    sm: 'text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-8xl [@media(min-width:3000px)]:text-[10.5rem] [@media(min-width:4000px)]:text-[12.6rem]',
    md: 'text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-9xl [@media(min-width:3000px)]:text-[12.6rem] [@media(min-width:4000px)]:text-[16.8rem]',
    lg: 'text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl 2xl:text-[14rem] [@media(min-width:3000px)]:text-[21rem] [@media(min-width:4000px)]:text-[25.2rem]',
  };

  return (
    <motion.div
      variants={itemVariants}
      className='text-center mb-6 2xl:mb-8 [@media(min-width:3000px)]:mb-12 [@media(min-width:4000px)]:mb-16'
    >
      <motion.h2 className={`${headingSizeClasses[size]} font-bold text-white text-center`}>
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={`h-1 [@media(min-width:3000px)]:h-1.5 [@media(min-width:4000px)]:h-2 ${underlineWidthClasses[underlineWidth]} bg-white/30 mx-auto rounded-full mt-2 lg:mt-4 xl:mt-6 2xl:mt-8 [@media(min-width:3000px)]:mt-12 [@media(min-width:4000px)]:mt-16`}
      ></motion.div>
    </motion.div>
  );
}
