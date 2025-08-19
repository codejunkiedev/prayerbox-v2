import { CheckCircle } from 'lucide-react';

// Import images
import childrenImg from '@/assets/community-posts/01-children.jpg';
import keepCleanImg from '@/assets/community-posts/02-keep-clean.jpg';
import preventWasteImg from '@/assets/community-posts/03-prevent-waste.jpg';
import keepSilenceImg from '@/assets/community-posts/04-keep-silence.jpg';
import properParkingImg from '@/assets/community-posts/05-proper-parking.jpg';

const PREDESIGNED_IMAGES = [
  { id: '01-children', src: childrenImg, alt: 'Children Community Post' },
  { id: '02-keep-clean', src: keepCleanImg, alt: 'Keep Clean Post' },
  { id: '03-prevent-waste', src: preventWasteImg, alt: 'Prevent Waste Post' },
  { id: '04-keep-silence', src: keepSilenceImg, alt: 'Keep Silence Post' },
  { id: '05-proper-parking', src: properParkingImg, alt: 'Proper Parking Post' },
];

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
