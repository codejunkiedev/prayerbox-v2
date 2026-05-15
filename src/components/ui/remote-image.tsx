import { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface RemoteImageProps {
  src: string;
  alt: string;
  /** Class applied to the absolute-positioned <img>. */
  className?: string;
  /** Class applied to the relative-positioned wrapping div. */
  containerClassName?: string;
  /** Optional placeholder shown while loading. Default: centered spinner. */
  placeholder?: React.ReactNode;
  /** Object-fit applied to the image. Default: cover. */
  fit?: 'cover' | 'contain';
  /** Native lazy loading. Default: true. */
  lazy?: boolean;
}

/**
 * Renders a remotely-fetched image with a per-image loading spinner overlay,
 * fade-in on load, and a fallback icon on error. The wrapper sizes the slot;
 * the image fills it absolutely.
 */
export function RemoteImage({
  src,
  alt,
  className,
  containerClassName,
  placeholder,
  fit = 'cover',
  lazy = true,
}: RemoteImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={cn('relative overflow-hidden bg-muted', containerClassName)}>
      <img
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'absolute inset-0 w-full h-full transition-opacity',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
      {status === 'loading' &&
        (placeholder ?? (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          </div>
        ))}
      {status === 'error' && (
        <div className='absolute inset-0 flex items-center justify-center text-muted-foreground'>
          <ImageOff className='h-4 w-4' />
        </div>
      )}
    </div>
  );
}
