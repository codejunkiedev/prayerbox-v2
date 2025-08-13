import type { Post } from '@/types';
import { motion } from 'framer-motion';
import { AnimationProvider, itemVariants } from '../shared';

interface PostsDisplayProps {
  post: Post;
}

/**
 * Displays a post image in full screen with hover animations
 */
export function PostsDisplay({ post }: PostsDisplayProps) {
  if (!post || !post.image_url) return null;

  return (
    <div className='w-full h-screen overflow-hidden'>
      <AnimationProvider>
        <motion.div variants={itemVariants} className='w-full h-full'>
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.8 }}
            src={post.image_url}
            alt={post.title}
            className='w-full h-full object-cover'
          />
        </motion.div>
      </AnimationProvider>
    </div>
  );
}
