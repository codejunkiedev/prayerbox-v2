import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { listFiles } from '@/lib/supabase/helpers';
import { SupabaseBuckets, SupabaseFolders } from '@/types';

type PredesignedImage = {
  id: string;
  src: string;
  alt: string;
};

type PredesignedImageSelectorProps = {
  selectedImage: string | null;
  onImageSelect: (imageSrc: string) => void;
};

export function PredesignedImageSelector({
  selectedImage,
  onImageSelect,
}: PredesignedImageSelectorProps) {
  const [images, setImages] = useState<PredesignedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const files = await listFiles(SupabaseBuckets.Assets, SupabaseFolders.PredesignedPosts);

        const imageFiles = files
          .filter(file => {
            const ext = file.name.toLowerCase().split('.').pop();
            return ['jpg', 'jpeg', 'png'].includes(ext || '');
          })
          .map(file => {
            const filename = file.name.split('.')[0];
            const altText =
              filename
                .replace(/^\d+-/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase()) + ' Template';

            return { id: filename, src: file.url, alt: altText };
          })
          .sort((a, b) => a.id.localeCompare(b.id));

        setImages(imageFiles);
      } catch (err) {
        console.error('Error fetching predesigned images:', err);
        setError('Failed to load predesigned images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='aspect-video bg-gray-200 rounded-lg animate-pulse' />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-destructive text-sm'>{error}</p>
        <p className='text-muted-foreground text-xs mt-1'>
          Please try refreshing the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground text-sm'>No predesigned images available</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {images.map(image => (
          <div
            key={image.id}
            className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
              selectedImage === image.src
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onImageSelect(image.src)}
          >
            <div className='aspect-video'>
              <img
                src={image.src}
                alt={image.alt}
                className='w-full h-full object-cover'
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {selectedImage === image.src && (
              <div className='absolute top-2 right-2 bg-primary text-white rounded-full p-1'>
                <CheckCircle className='w-4 h-4' />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
