import { useId, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils';
import { validateImageForFullScreen } from '@/utils';
import { uploadBackgroundImage } from '@/lib/supabase';
import { MAX_FILE_SIZE, VALID_IMAGE_TYPES } from '@/lib/zod';
import type { PostOrientation } from '@/types';

interface BackgroundUploadTileProps {
  /** Orientation the image is validated against (16:9 vs 9:16). */
  orientation: PostOrientation;
  /** Called with the public URL once the upload succeeds. */
  onUploaded: (url: string) => void;
  disabled?: boolean;
}

/**
 * Reusable "upload a background" tile: a dashed drop-target button with a hidden
 * file input. Validates the file (type, size, dimensions) using the existing
 * full-screen image validators — no client-side resizing — then uploads it to
 * the per-masjid `user-backgrounds` folder and hands the URL back to the caller.
 *
 * Shared so the Ayat/Hadith builder can reuse the same upload affordance.
 */
export function BackgroundUploadTile({
  orientation,
  onUploaded,
  disabled,
}: BackgroundUploadTileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Use JPEG, PNG, GIF, or WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      const maxMb = Math.round(MAX_FILE_SIZE / (1024 * 1024));
      toast.error(`Image is larger than ${maxMb}MB. Please use a smaller file.`);
      return;
    }

    const validation = await validateImageForFullScreen(file, orientation);
    if (!validation.isValid) {
      toast.error(validation.error || 'Image does not meet the display requirements.');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadBackgroundImage(file);
      onUploaded(url);
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Background upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    e.target.value = '';
    if (file) void handleFile(file);
  };

  const isDisabled = disabled || uploading;

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type='file'
        accept={VALID_IMAGE_TYPES.join(',')}
        className='sr-only'
        onChange={onChange}
        disabled={isDisabled}
      />
      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        disabled={isDisabled}
        aria-label='Upload background image'
        className={cn(
          'flex aspect-video flex-col items-center justify-center gap-1 rounded border-2 border-dashed text-muted-foreground transition',
          isDisabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-primary hover:text-foreground'
        )}
      >
        {uploading ? (
          <Loader2 className='h-5 w-5 animate-spin' />
        ) : (
          <>
            <Upload className='h-5 w-5' />
            <span className='text-[10px] font-medium'>Upload</span>
          </>
        )}
      </button>
    </>
  );
}
