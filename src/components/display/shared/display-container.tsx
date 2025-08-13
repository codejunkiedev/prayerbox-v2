import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface DisplayContainerProps {
  children: ReactNode;
  backgroundImage?: string;
  backgroundVideo?: string;
}

/**
 * Full-screen container component with optional background image or video and gradient overlay
 */
export function DisplayContainer({
  children,
  backgroundImage,
  backgroundVideo,
}: DisplayContainerProps) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full overflow-hidden relative'>
      {/* Video Background */}
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className='absolute inset-0 w-full h-full object-cover z-[-2]'
        >
          <source src={backgroundVideo} type='video/mp4' />
        </video>
      )}

      {/* Image Background (fallback) */}
      {backgroundImage && !backgroundVideo && (
        <div
          className='absolute inset-0 w-full h-full bg-cover bg-center z-[-2]'
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

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
