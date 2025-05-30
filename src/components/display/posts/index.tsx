import type { Post } from '@/types';
import bgImage from '@/assets/backgrounds/04.jpeg';
import { motion } from 'framer-motion';
import {
  AnimationProvider,
  DisplayContainer,
  DisplayCard,
  DisplayHeading,
  itemVariants,
} from '../shared';

interface PostsDisplayProps {
  post: Post;
}

export function PostsDisplay({ post }: PostsDisplayProps) {
  if (!post) return null;

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={post.title} />

          {post.image_url && (
            <motion.div
              variants={itemVariants}
              className='w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-4 rounded-md overflow-hidden'
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                src={post.image_url}
                alt={post.title}
                className='w-full h-full object-cover'
              />
            </motion.div>
          )}
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
