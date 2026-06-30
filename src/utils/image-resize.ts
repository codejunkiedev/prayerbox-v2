import type { PostOrientation } from '@/types';
import { MAX_FILE_SIZE } from '@/lib/zod';
import { getMaxDimensions } from './image-validation';

/** JPEG quality used for the first re-encode attempt. */
const INITIAL_QUALITY = 0.85;
/** Lowest quality we will drop to while trying to fit under MAX_FILE_SIZE. */
const MIN_QUALITY = 0.6;
/** How much to lower quality on each retry when the encode is still too large. */
const QUALITY_STEP = 0.1;
/** Aspect-ratio deltas below this are treated as "already exact" (no crop). */
const ASPECT_EPSILON = 0.005;

/**
 * Scales an image down to fit within the orientation's maximum display
 * dimensions and center-crops it to the exact target aspect ratio (16:9 /
 * 9:16), re-encoding as JPEG. Producing an exact-ratio image means it fills the
 * full-screen display and every 16:9 preview without letterbox bars — matching
 * the Ayat/Hadith snapshot, which is always an exact 1920×1080 frame.
 *
 * The crop is centered and the image is never upscaled. Images that already
 * match the target ratio, fit within bounds, and are under the size cap are
 * returned untouched.
 *
 * Callers should validate the aspect ratio first (see
 * `validateImageForFullScreen`); the ±5% tolerance there bounds how much this
 * ever crops (~2.5% per side at the extreme).
 */
export async function downscaleImageToCover(
  file: File,
  orientation: PostOrientation = 'landscape'
): Promise<File> {
  // Only attempt to process raster images we can decode.
  if (!file.type.startsWith('image/')) return file;

  const max = getMaxDimensions(orientation);
  const targetAspect = max.width / max.height;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Decoding failed (e.g. unsupported variant) — fall back to the original.
    return file;
  }

  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const srcAspect = srcW / srcH;

  // Center-crop the source to the exact target aspect ratio.
  let cropW = srcW;
  let cropH = srcH;
  if (srcAspect > targetAspect) {
    cropW = srcH * targetAspect; // too wide — trim the sides
  } else if (srcAspect < targetAspect) {
    cropH = srcW / targetAspect; // too tall — trim top/bottom
  }
  const sx = (srcW - cropW) / 2;
  const sy = (srcH - cropH) / 2;

  // Scale the cropped region down to fit the max box (never upscale).
  const scale = Math.min(1, max.width / cropW, max.height / cropH);
  const targetWidth = Math.round(cropW * scale);
  const targetHeight = Math.round(cropH * scale);

  const aspectMatches = Math.abs(srcAspect - targetAspect) < ASPECT_EPSILON;
  const needsResize = scale < 1;
  const needsRecompress = file.size > MAX_FILE_SIZE;

  // Already exact ratio, within bounds, and light enough — keep the original.
  if (aspectMatches && !needsResize && !needsRecompress) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file; // Canvas unavailable — fall back to the original.
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, cropW, cropH, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, quality);
  while (blob && blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob) return file;

  return new File([blob], renameToJpg(file.name), {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

function renameToJpg(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.jpg`;
}
