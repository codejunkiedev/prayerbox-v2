/**
 * Types for image validation system
 */

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  dimensions?: ImageDimensions;
  recommendation?: string;
  quality?: 'minimum' | 'recommended' | 'excellent';
}

export interface ValidationConfig {
  readonly ratio: number;
  readonly name: string;
  readonly tolerance: number;
}

export interface DimensionLimits {
  readonly min: { width: number; height: number };
  readonly recommended: { width: number; height: number };
  readonly max: { width: number; height: number };
}

export interface CropSuggestion {
  width: number;
  height: number;
  ratio: string;
  cropArea: number;
  retainedPercentage: number;
}

export interface ValidationState {
  isValid: boolean;
  error?: string;
  recommendation?: string;
  dimensions?: string;
}

export interface ValidationFeedbackProps {
  isValid: boolean;
  dimensions?: string;
  recommendation?: string;
  isLoading?: boolean;
  className?: string;
}

export interface UseImageValidationReturn {
  imageFile: File | null;
  imageError: string | null;
  validationState: ValidationState | null;
  isValidating: boolean;
  handleImageChange: (file: File | null) => Promise<void>;
  resetValidation: () => void;
}

// Quality levels for image resolution
export type ImageQuality = 'minimum' | 'recommended' | 'excellent';

// Image orientation types
export type ImageOrientation = 'landscape' | 'portrait' | 'square';

// Standard resolution names
export type ResolutionName = 'HD' | 'Full HD' | '1440p' | '4K UHD' | '';
