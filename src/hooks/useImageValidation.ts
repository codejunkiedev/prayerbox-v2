import { useState, useCallback } from 'react';
import { validateImageForFullScreen, getImageDescription } from '@/lib/image-validation';
import type {
  ImageValidationResult,
  ValidationState,
  UseImageValidationReturn,
} from '@/types/validation';

/**
 * Custom hook for validating images for full-screen display
 * Validates image dimensions, format, and provides feedback on suitability
 * @returns Object containing validation state, handlers, and utility functions
 */
export function useImageValidation(): UseImageValidationReturn {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<ValidationState | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const resetValidation = useCallback(() => {
    setImageFile(null);
    setImageError(null);
    setValidationState(null);
    setIsValidating(false);
  }, []);

  const handleImageChange = useCallback(async (file: File | null) => {
    setImageFile(file);
    setValidationState(null);
    setIsValidating(false);

    if (!file) {
      setImageError('Image is required');
      return;
    }

    setImageError(null);
    setIsValidating(true);

    try {
      const validation: ImageValidationResult = await validateImageForFullScreen(file);

      const newValidationState: ValidationState = {
        isValid: validation.isValid,
        error: validation.error,
        recommendation: validation.recommendation,
        dimensions: validation.dimensions ? getImageDescription(validation.dimensions) : undefined,
      };

      setValidationState(newValidationState);

      if (!validation.isValid) {
        setImageError(validation.error || 'Image validation failed');
      }
    } catch (error) {
      console.error('Image validation error:', error);
      setImageError('Failed to validate image. Please try again.');
      setValidationState({
        isValid: false,
        error: 'Validation failed',
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    imageFile,
    imageError,
    validationState,
    isValidating,
    handleImageChange,
    resetValidation,
  };
}
