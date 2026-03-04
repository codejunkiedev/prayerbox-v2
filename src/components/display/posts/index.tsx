import type { Post } from '@/types';
import { AnimationProvider } from '../shared';

interface PostsDisplayProps {
  post: Post;
}

/**
 * Displays a post image in full screen
 */
export function PostsDisplay({ post }: PostsDisplayProps) {
  if (!post || !post.image_url) return null;

  return (
    <div className='w-full h-screen overflow-hidden'>
      <AnimationProvider>
        <div className='w-full h-full stagger-item animate-fade-in-up'>
          <img src={post.image_url} alt={post.title} className='w-full h-full object-cover' />
        </div>
      </AnimationProvider>
    </div>
  );
}
