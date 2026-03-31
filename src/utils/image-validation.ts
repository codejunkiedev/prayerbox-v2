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
import type { PostOrientation } from '@/types';

const LANDSCAPE_CONFIG: ValidationConfig = {
  ratio: 16 / 9,
  name: '16:9',
  tolerance: 0,
} as const;

const PORTRAIT_CONFIG: ValidationConfig = {
  ratio: 9 / 16,
  name: '9:16',
  tolerance: 0,
} as const;

const LANDSCAPE_LIMITS: DimensionLimits = {
  min: { width: 1280, height: 720 },
  recommended: { width: 1920, height: 1080 },
  max: { width: 3840, height: 2160 },
} as const;

const PORTRAIT_LIMITS: DimensionLimits = {
  min: { width: 720, height: 1280 },
  recommended: { width: 1080, height: 1920 },
  max: { width: 2160, height: 3840 },
} as const;

const LANDSCAPE_RESOLUTIONS = {
  HD: '1280×720',
  FULL_HD: '1920×1080',
  UHD_4K: '3840×2160',
} as const;

const PORTRAIT_RESOLUTIONS = {
  HD: '720×1280',
  FULL_HD: '1080×1920',
  UHD_4K: '2160×3840',
} as const;

/**
 * Validates if an image file is suitable for full-screen display
 * @param file - The image file to validate
 * @param orientation - The required orientation ('landscape' = 16:9, 'portrait' = 9:16)
 * @returns Promise resolving to validation result
 */
export async function validateImageForFullScreen(
  file: File,
  orientation: PostOrientation = 'landscape'
): Promise<ImageValidationResult> {
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

        const result = validateDimensions(dimensions, orientation);
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
 * Validates image dimensions against orientation-specific requirements
 */
function validateDimensions(
  dimensions: ImageDimensions,
  orientation: PostOrientation
): ImageValidationResult {
  const { width, height, aspectRatio } = dimensions;
  const config = orientation === 'portrait' ? PORTRAIT_CONFIG : LANDSCAPE_CONFIG;
  const limits = orientation === 'portrait' ? PORTRAIT_LIMITS : LANDSCAPE_LIMITS;
  const { recommended, max } = limits;
  const { ratio, tolerance, name } = config;

  if (width > max.width || height > max.height) {
    const maxLabel =
      orientation === 'portrait' ? PORTRAIT_RESOLUTIONS.UHD_4K : LANDSCAPE_RESOLUTIONS.UHD_4K;
    return {
      isValid: false,
      error: `Image resolution too high. Maximum allowed: ${maxLabel}`,
      dimensions,
      recommendation:
        'Please resize or compress the image to reduce file size and improve loading performance.',
      quality: 'excellent',
    };
  }

  const aspectRatioResult = validateAspectRatio(aspectRatio, ratio, tolerance, name, orientation);
  if (!aspectRatioResult.isValid) {
    return { ...aspectRatioResult, dimensions };
  }

  const quality = getQualityLevel(width, height, recommended);
  const recommendation = generateQualityRecommendation(quality, orientation);

  return {
    isValid: true,
    dimensions,
    recommendation: `✓ Perfect ${name} aspect ratio confirmed.${recommendation ? ` ${recommendation}` : ''}`,
    quality,
  };
}

/**
 * Validates aspect ratio against the required ratio for the given orientation
 */
function validateAspectRatio(
  aspectRatio: number,
  targetRatio: number,
  tolerance: number,
  ratioName: string,
  orientation: PostOrientation
) {
  const isCorrectRatio = Math.abs(aspectRatio - targetRatio) <= tolerance;

  if (!isCorrectRatio) {
    const currentRatio = `${aspectRatio.toFixed(2)}:1`;
    const recommendation = generateAspectRatioRecommendation(aspectRatio, targetRatio, orientation);

    return {
      isValid: false,
      error: `Only ${ratioName} aspect ratio images are accepted. Current ratio: ${currentRatio}`,
      recommendation,
    };
  }

  return { isValid: true };
}

/**
 * Generates a human-friendly recommendation based on the aspect ratio mismatch
 */
function generateAspectRatioRecommendation(
  aspectRatio: number,
  targetRatio: number,
  orientation: PostOrientation
): string {
  if (orientation === 'portrait') {
    if (aspectRatio >= 1.0) {
      return 'Please use a portrait image (taller than wide) in 9:16 ratio (height should be 1.78× the width).';
    }
    if (aspectRatio > targetRatio) {
      return 'Image is too wide for portrait. Please crop to make it narrower or use a 9:16 aspect ratio image.';
    }
    return 'Image is too narrow for portrait. Please crop to make it wider or use a 9:16 aspect ratio image.';
  }

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
    return width >= 2560 || height >= 2560 ? 'excellent' : 'recommended';
  }
  return 'minimum';
}

/**
 * Generates quality-based recommendations
 */
function generateQualityRecommendation(
  quality: ImageQuality,
  orientation: PostOrientation
): string {
  const fullHd =
    orientation === 'portrait' ? PORTRAIT_RESOLUTIONS.FULL_HD : LANDSCAPE_RESOLUTIONS.FULL_HD;
  switch (quality) {
    case 'minimum':
      return `For optimal quality, consider using ${fullHd} or higher.`;
    case 'excellent':
      return 'Excellent resolution for high-quality displays.';
    default:
      return '';
  }
}

/**
 * Gets a human-readable description of image dimensions and aspect ratio
 */
export function getImageDescription(dimensions: ImageDimensions): string {
  const { width, height, aspectRatio } = dimensions;

  const orientation = getImageOrientation(aspectRatio);
  const qualityIndicator = getResolutionName(width, height);

  let ratioDisplay: string;
  if (orientation === 'landscape' && Math.abs(aspectRatio - 16 / 9) < 0.001) {
    ratioDisplay = '16:9';
  } else if (orientation === 'portrait' && Math.abs(aspectRatio - 9 / 16) < 0.001) {
    ratioDisplay = '9:16';
  } else {
    ratioDisplay = `${aspectRatio.toFixed(1)}:1`;
  }

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
    '720x1280': 'HD',
    '1080x1920': 'Full HD',
    '2160x3840': '4K UHD',
  };

  return resolutionMap[`${width}x${height}`] || '';
}

/**
 * Suggests optimal cropping dimensions for the given image
 */
export function suggestOptimalCrop(
  dimensions: ImageDimensions,
  orientation: PostOrientation = 'landscape'
): CropSuggestion {
  const { width, height } = dimensions;
  const config = orientation === 'portrait' ? PORTRAIT_CONFIG : LANDSCAPE_CONFIG;
  const { ratio, name } = config;

  const cropWidth = Math.min(width, height * ratio);
  const cropHeight = Math.min(height, width / ratio);

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
