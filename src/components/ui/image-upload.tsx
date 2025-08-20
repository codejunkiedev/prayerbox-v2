import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image } from 'lucide-react';
import { cn } from '@/utils';
import { Label } from './label';
import { VALID_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/zod';

export interface ImageUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  onChange: (file: File | null) => void;
  value?: File | string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A drag-and-drop image upload component with preview and validation
 */
export function ImageUpload({
  onChange,
  value,
  label,
  error,
  disabled = false,
  className,
  ...props
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(typeof value === 'string' ? value : null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      onChange(file);

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': VALID_IMAGE_TYPES,
    },
    maxSize: MAX_FILE_SIZE,
    disabled,
    maxFiles: 1,
  });

  const fileRejectionError = fileRejections.length > 0 ? fileRejections[0].errors[0].message : null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
  };

  return (
    <div className={className}>
      {label && <Label className='mb-2 block'>{label}</Label>}

      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : error || fileRejectionError
              ? 'border-red-500'
              : 'border-gray-300 hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className='relative'>
            <img src={preview} alt='Upload preview' className='max-h-48 mx-auto rounded-md' />
            {!disabled && (
              <button
                type='button'
                onClick={handleRemove}
                className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                aria-label='Remove image'
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className='py-4'>
            <div className='flex justify-center mb-2'>
              <Image size={24} className='text-gray-400' />
            </div>
            <p className='text-sm text-gray-600 mb-1'>
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
            </p>
            <p className='text-xs text-gray-500'>or click to select</p>
            <p className='text-xs text-gray-400 mt-1'>
              Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              <strong>16:9 aspect ratio only</strong> - Perfect for full-screen display
            </p>
          </div>
        )}
      </div>

      {(error || fileRejectionError) && (
        <p className='text-red-500 text-sm mt-1'>{error || fileRejectionError}</p>
      )}
    </div>
  );
}
