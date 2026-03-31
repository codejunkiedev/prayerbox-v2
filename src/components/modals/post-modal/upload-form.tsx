import {
  Button,
  DialogFooter,
  Input,
  Label,
  ImageUpload,
  ValidationFeedback,
} from '@/components/ui';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { PostData } from '@/lib/zod';
import type { PostOrientation } from '@/types';
import type { ValidationState } from '@/types/validation';
import { OrientationBadge } from './orientation-badge';
import { ModalError } from './modal-error';

type UploadFormProps = {
  orientation: PostOrientation;
  isEdit: boolean;
  register: UseFormRegister<PostData>;
  errors: FieldErrors<PostData>;
  onImageChange: (file: File | null) => Promise<void>;
  validationState: ValidationState | null;
  isValidating: boolean;
  imageError: string | null;
  existingImageUrl?: string;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  error?: string | null;
};

export function UploadForm({
  orientation,
  isEdit,
  register,
  errors,
  onImageChange,
  validationState,
  isValidating,
  imageError,
  existingImageUrl,
  isSubmitting,
  onBack,
  onSubmit,
  error,
}: UploadFormProps) {
  const ratioLabel = orientation === 'portrait' ? '9:16' : '16:9';

  return (
    <form onSubmit={onSubmit} className='space-y-4 pt-4'>
      <ModalError message={error} />

      <OrientationBadge orientation={orientation} showEditNote={isEdit} />

      <div className='space-y-2'>
        <Label htmlFor='title'>Title</Label>
        <Input
          id='title'
          placeholder='Enter post title'
          className={errors.title ? 'border-destructive' : ''}
          {...register('title')}
        />
        {errors.title && <p className='text-destructive text-sm'>{errors.title.message}</p>}
      </div>

      <div className='space-y-2'>
        <ImageUpload
          label={`Image (${orientation === 'portrait' ? 'Portrait' : 'Landscape'} Full-Screen)`}
          onChange={onImageChange}
          value={existingImageUrl}
          disabled={isSubmitting}
          orientation={orientation}
        />

        {(validationState || isValidating) && (
          <ValidationFeedback
            isValid={validationState?.isValid ?? false}
            dimensions={validationState?.dimensions}
            recommendation={validationState?.recommendation}
            validationError={imageError ?? undefined}
            isLoading={isValidating}
          />
        )}

        <p className='text-xs text-muted-foreground'>
          <strong>Strict requirement:</strong> Only {ratioLabel} aspect ratio images accepted. Max
          file size: 5MB.
        </p>
        <p className='text-xs text-muted-foreground mt-1'>
          Need to resize your image? Try{' '}
          <a
            href='https://imageresizer.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            imageresizer.com
          </a>
        </p>
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onBack}>
          {isEdit ? 'Cancel' : 'Back'}
        </Button>
        <Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogFooter>
    </form>
  );
}
