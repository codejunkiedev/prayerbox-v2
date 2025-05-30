import type { Post } from '@/types';
import bgImage from '@/assets/backgrounds/04.jpeg';

interface PostsDisplayProps {
  post: Post;
}

export function PostsDisplay({ post }: PostsDisplayProps) {
  if (!post) return null;

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen w-full overflow-hidden relative bg-cover bg-center'
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm z-0'></div>

      <div className='w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl z-10'>
        <div className='p-3 sm:p-4 md:p-6'>
          <div className='flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold text-white mb-4 text-center'>
              {post.title}
            </h2>

            {post.image_url && (
              <div className='w-full h-48 sm:h-64 md:h-72 lg:h-80 mb-4 rounded-md overflow-hidden'>
                <img src={post.image_url} alt={post.title} className='w-full h-full object-cover' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
