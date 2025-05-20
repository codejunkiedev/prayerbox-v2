import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
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

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      onChange(file);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Clean up previous preview URL
      return () => URL.revokeObjectURL(objectUrl);
    },
    [onChange]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': VALID_IMAGE_TYPES,
    },
    maxSize: MAX_FILE_SIZE,
    disabled,
    maxFiles: 1,
  });

  // Handle file rejection errors
  const fileRejectionError = fileRejections.length > 0 ? fileRejections[0].errors[0].message : null;

  // Handle manual file removal
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
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M18 6L6 18'></path>
                  <path d='M6 6l12 12'></path>
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className='py-4'>
            <div className='flex justify-center mb-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-gray-400'
              >
                <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
                <circle cx='9' cy='9' r='2' />
                <path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
              </svg>
            </div>
            <p className='text-sm text-gray-600 mb-1'>
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
            </p>
            <p className='text-xs text-gray-500'>or click to select</p>
            <p className='text-xs text-gray-400 mt-1'>
              Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)
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
