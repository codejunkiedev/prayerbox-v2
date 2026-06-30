import { Crop, Image as ImageIcon, FileUp, Maximize2 } from 'lucide-react';
import { getImageRequirements } from '@/utils';
import type { PostOrientation } from '@/types';
import type { ImageRequirement } from '@/types/validation';

const REQUIREMENT_ICONS: Record<ImageRequirement['key'], typeof Crop> = {
  ratio: Crop,
  formats: ImageIcon,
  size: FileUp,
  resolution: Maximize2,
};

type ImageRequirementsProps = {
  orientation: PostOrientation;
};

/**
 * Compact panel that spells out the upload rules (ratio, formats, and how
 * file size / resolution are handled) so users see the requirements up front.
 * The aspect ratio is the only hard gate — oversized images are downscaled
 * automatically rather than rejected.
 */
export function ImageRequirements({ orientation }: ImageRequirementsProps) {
  const requirements = getImageRequirements(orientation);

  return (
    <div className='self-start rounded-lg border bg-muted/40 p-3'>
      <p className='text-xs font-semibold text-foreground'>Image requirements</p>

      <ul className='mt-2 space-y-2'>
        {requirements.map(req => {
          const Icon = REQUIREMENT_ICONS[req.key];
          return (
            <li key={req.key} className='flex items-start gap-2'>
              <Icon className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-baseline gap-x-1.5 text-xs'>
                  <span className='text-muted-foreground'>{req.label}:</span>
                  <span className='font-medium text-foreground'>{req.value}</span>
                </div>
                {req.hint && (
                  <p className='mt-0.5 text-[11px] leading-snug text-muted-foreground/80'>
                    {req.hint}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className='mt-3 border-t pt-3 text-[11px] text-muted-foreground'>
        Large images are resized automatically — just make sure the aspect ratio matches.
      </p>
    </div>
  );
}
