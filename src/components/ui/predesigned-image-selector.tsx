import { CheckCircle } from 'lucide-react';

const imageModules = import.meta.glob('@/assets/community-posts/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const PREDESIGNED_IMAGES = Object.entries(imageModules)
  .map(([path, src]) => {
    const filename = path.split('/').pop()?.split('.')[0] || '';

    const altText =
      filename
        .replace(/^\d+-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()) + ' Post';

    return { id: filename, src: src as string, alt: altText };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

type PredesignedImageSelectorProps = {
  selectedImage: string | null;
  onImageSelect: (imageSrc: string) => void;
};

export function PredesignedImageSelector({
  selectedImage,
  onImageSelect,
}: PredesignedImageSelectorProps) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {PREDESIGNED_IMAGES.map(image => (
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
              <img src={image.src} alt={image.alt} className='w-full h-full object-cover' />
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
