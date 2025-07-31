import type {
  ImageDimensions,
  ImageValidationResult,
  ValidationConfig,
  DimensionLimits,
  CropSuggestion,
  ImageQuality,
  ImageOrientation,
  ResolutionName,
} from '@/types/validation';

// Configuration constants
const ASPECT_RATIO_CONFIG: ValidationConfig = {
  ratio: 16 / 9, // 1.7777...
  name: '16:9',
  tolerance: 0, // Perfect ratio required
} as const;

const DIMENSION_LIMITS: DimensionLimits = {
  min: { width: 1280, height: 720 }, // HD quality minimum
  recommended: { width: 1920, height: 1080 }, // Full HD
  max: { width: 3840, height: 2160 }, // 4K UHD
} as const;

// Common resolutions for reference
const COMMON_RESOLUTIONS = {
  HD: '1280×720',
  FULL_HD: '1920×1080',
  UHD_4K: '3840×2160',
} as const;

/**
 * Validates if an image file is suitable for full-screen display
 * @param file - The image file to validate
 * @returns Promise resolving to validation result
 */
export async function validateImageForFullScreen(file: File): Promise<ImageValidationResult> {
  // Input validation
  if (!file || !file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Invalid file type. Please provide a valid image file.',
    };
  }

  return new Promise(resolve => {
    const img = new Image();
    let objectUrl: string | null = null;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    const handleLoad = () => {
      try {
        const dimensions: ImageDimensions = {
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        };

        const result = validateDimensions(dimensions);
        cleanup();
        resolve(result);
      } catch {
        cleanup();
        resolve({
          isValid: false,
          error: 'Failed to process image dimensions.',
        });
      }
    };

    const handleError = () => {
      cleanup();
      resolve({
        isValid: false,
        error: 'Unable to load image. Please check the file format and try again.',
      });
    };

    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });

    try {
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    } catch {
      resolve({
        isValid: false,
        error: 'Failed to process the image file.',
      });
    }
  });
}

/**
 * Validates image dimensions against our requirements
 * @param dimensions - The image dimensions to validate
 * @returns Validation result with quality assessment
 */
function validateDimensions(dimensions: ImageDimensions): ImageValidationResult {
  const { width, height, aspectRatio } = dimensions;
  const { min, recommended, max } = DIMENSION_LIMITS;
  const { ratio, tolerance, name } = ASPECT_RATIO_CONFIG;

  // Check minimum dimensions
  if (width < min.width || height < min.height) {
    return {
      isValid: false,
      error: `Image resolution too low. Minimum required: ${COMMON_RESOLUTIONS.HD}`,
      dimensions,
      recommendation: 'Please use HD quality or higher for optimal full-screen display.',
      quality: 'minimum',
    };
  }

  // Check maximum dimensions
  if (width > max.width || height > max.height) {
    return {
      isValid: false,
      error: `Image resolution too high. Maximum allowed: ${COMMON_RESOLUTIONS.UHD_4K}`,
      dimensions,
      recommendation:
        'Please resize or compress the image to reduce file size and improve loading performance.',
      quality: 'excellent',
    };
  }

  // Validate aspect ratio
  const aspectRatioResult = validateAspectRatio(aspectRatio, ratio, tolerance);
  if (!aspectRatioResult.isValid) {
    return {
      ...aspectRatioResult,
      dimensions,
    };
  }

  // Determine quality level and recommendation
  const quality = getQualityLevel(width, height, recommended);
  const recommendation = generateQualityRecommendation(quality);

  return {
    isValid: true,
    dimensions,
    recommendation: `✓ Perfect ${name} aspect ratio confirmed.${recommendation ? ` ${recommendation}` : ''}`,
    quality,
  };
}

/**
 * Validates aspect ratio against the required 16:9 ratio
 */
function validateAspectRatio(aspectRatio: number, targetRatio: number, tolerance: number) {
  const is16by9 = Math.abs(aspectRatio - targetRatio) <= tolerance;

  if (!is16by9) {
    const currentRatio = `${aspectRatio.toFixed(2)}:1`;
    const recommendation = generateAspectRatioRecommendation(aspectRatio, targetRatio);

    return {
      isValid: false,
      error: `Only 16:9 aspect ratio images are accepted. Current ratio: ${currentRatio}`,
      recommendation,
    };
  }

  return { isValid: true };
}

/**
 * Generates recommendation based on aspect ratio mismatch
 */
function generateAspectRatioRecommendation(aspectRatio: number, targetRatio: number): string {
  if (aspectRatio <= 1.0) {
    return 'Please use a landscape image and crop it to 16:9 ratio (width should be 1.78× the height).';
  }

  if (aspectRatio < targetRatio) {
    return 'Image is too narrow. Please crop to make it wider or use a 16:9 aspect ratio image.';
  }

  return 'Image is too wide. Please crop to make it less wide or use a 16:9 aspect ratio image.';
}

/**
 * Determines the quality level of the image
 */
function getQualityLevel(
  width: number,
  height: number,
  recommended: { width: number; height: number }
): ImageQuality {
  if (width >= recommended.width && height >= recommended.height) {
    return width >= 2560 ? 'excellent' : 'recommended';
  }
  return 'minimum';
}

/**
 * Generates quality-based recommendations
 */
function generateQualityRecommendation(quality: ImageQuality): string {
  switch (quality) {
    case 'minimum':
      return `For optimal quality, consider using ${COMMON_RESOLUTIONS.FULL_HD} or higher.`;
    case 'excellent':
      return 'Excellent resolution for high-quality displays.';
    default:
      return '';
  }
}

/**
 * Gets a human-readable description of image dimensions and aspect ratio
 * @param dimensions - The image dimensions
 * @returns Formatted string describing the image
 */
export function getImageDescription(dimensions: ImageDimensions): string {
  const { width, height, aspectRatio } = dimensions;
  const { ratio, tolerance, name } = ASPECT_RATIO_CONFIG;

  // Check if it matches 16:9 ratio
  const is16by9 = Math.abs(aspectRatio - ratio) <= tolerance;
  const ratioDisplay = is16by9 ? name : `${aspectRatio.toFixed(1)}:1`;

  // Determine orientation
  const orientation = getImageOrientation(aspectRatio);

  // Get quality indicator
  const qualityIndicator = getResolutionName(width, height);

  return `${width}×${height}px${qualityIndicator ? ` (${qualityIndicator})` : ''} - ${orientation} ${ratioDisplay}`;
}

/**
 * Determines image orientation based on aspect ratio
 */
function getImageOrientation(aspectRatio: number): ImageOrientation {
  if (aspectRatio > 1.0) return 'landscape';
  if (aspectRatio < 1.0) return 'portrait';
  return 'square';
}

/**
 * Gets the standard resolution name if it matches common formats
 */
function getResolutionName(width: number, height: number): ResolutionName {
  const resolutionMap: Record<string, ResolutionName> = {
    '1280x720': 'HD',
    '1920x1080': 'Full HD',
    '2560x1440': '1440p',
    '3840x2160': '4K UHD',
  };

  const key = `${width}x${height}`;
  return resolutionMap[key] || '';
}

/**
 * Suggests optimal cropping dimensions for the given image
 * @param dimensions - The original image dimensions
 * @returns Crop suggestion with detailed information
 */
export function suggestOptimalCrop(dimensions: ImageDimensions): CropSuggestion {
  const { width, height } = dimensions;
  const { ratio, name } = ASPECT_RATIO_CONFIG;

  // Calculate optimal 16:9 crop dimensions
  const cropWidth = Math.min(width, height * ratio);
  const cropHeight = Math.min(height, width / ratio);

  // Calculate crop area and retained percentage
  const originalArea = width * height;
  const cropArea = cropWidth * cropHeight;
  const retainedPercentage = Math.round((cropArea / originalArea) * 100);

  return {
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
    ratio: name,
    cropArea: Math.round(cropArea),
    retainedPercentage,
  };
}
