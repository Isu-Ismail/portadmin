export type {
  ImageFormat,
  ImageProcessingOptions,
  ProcessedImageResult
} from '@/core/types';

import type {
  ImageFormat,
  ImageProcessingOptions,
  ProcessedImageResult
} from '@/core/types';
import { isFirebaseStorageUrl, downloadStorageBlob } from '@/core/firebase/storage';

/**
 * Format bytes to readable string (e.g. 1.25 MB, 320 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Fetch a remote or local image as a Blob
 */
export async function fetchImageAsBlob(source: string): Promise<Blob> {
  // Firebase Storage URLs go through the SDK (avoids the plain-fetch CORS failure)
  if (isFirebaseStorageUrl(source)) {
    return await downloadStorageBlob(source);
  }
  const res = await fetch(source);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.statusText}`);
  }
  return await res.blob();
}

/**
 * Load an image from a File, Blob, or URL into an HTMLImageElement
 */
export async function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  let objectUrlToRevoke: string | null = null;
  let resolvedSource: string = '';

  if (source instanceof File || source instanceof Blob) {
    objectUrlToRevoke = URL.createObjectURL(source);
    resolvedSource = objectUrlToRevoke;
  } else if (typeof source === 'string') {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      try {
        const blob = await fetchImageAsBlob(source);
        objectUrlToRevoke = URL.createObjectURL(blob);
        resolvedSource = objectUrlToRevoke;
      } catch {
        resolvedSource = source;
      }
    } else {
      resolvedSource = source;
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    if (resolvedSource.startsWith('http://') || resolvedSource.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.src = resolvedSource;

    img.onload = () => {
      resolve(img);
    };

    img.onerror = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      reject(new Error('Failed to load image. The file format may be invalid or inaccessible.'));
    };
  });
}

/**
 * Multi-step canvas downsampling for crisp images
 */
function drawScaled(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
) {
  let curW = source.width;
  let curH = source.height;

  // If scaling down by more than half, step down progressively
  if (curW > targetWidth * 2 || curH > targetHeight * 2) {
    let oc = document.createElement('canvas');
    let octx = oc.getContext('2d');
    if (!octx) return;

    oc.width = curW;
    oc.height = curH;
    octx.drawImage(source, 0, 0);

    while (curW * 0.5 > targetWidth && curH * 0.5 > targetHeight) {
      const nextW = Math.floor(curW * 0.5);
      const nextH = Math.floor(curH * 0.5);
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextW;
      nextCanvas.height = nextH;
      const nextCtx = nextCanvas.getContext('2d');
      if (nextCtx) {
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = 'high';
        nextCtx.drawImage(oc, 0, 0, curW, curH, 0, 0, nextW, nextH);
        oc = nextCanvas;
        curW = nextW;
        curH = nextH;
      }
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(oc, 0, 0, curW, curH, 0, 0, targetWidth, targetHeight);
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  }
}

/**
 * Convert canvas to Blob with specified format and quality
 */
function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob export failed'));
      },
      format,
      quality
    );
  });
}

/**
 * Calculate target dimensions based on options
 */
export function calculateDimensions(
  originalW: number,
  originalH: number,
  options: Partial<ImageProcessingOptions>
): { width: number; height: number } {
  let targetW = options.width || originalW;
  let targetH = options.height || originalH;

  if (options.maxWidth && targetW > options.maxWidth) {
    const ratio = options.maxWidth / targetW;
    targetW = options.maxWidth;
    if (options.maintainAspectRatio !== false) {
      targetH = Math.round(targetH * ratio);
    }
  }

  if (options.maxHeight && targetH > options.maxHeight) {
    const ratio = options.maxHeight / targetH;
    targetH = options.maxHeight;
    if (options.maintainAspectRatio !== false) {
      targetW = Math.round(targetW * ratio);
    }
  }

  // Ensure minimum dimensions
  targetW = Math.max(1, Math.round(targetW));
  targetH = Math.max(1, Math.round(targetH));

  return { width: targetW, height: targetH };
}

/**
 * Primary processor: Resizes and compresses an image
 */
export async function processImage(
  input: File | Blob | HTMLImageElement | string,
  options: ImageProcessingOptions,
  suggestedFileName = 'image'
): Promise<ProcessedImageResult> {
  let img: HTMLImageElement;
  let originalSizeBytes = 0;

  if (input instanceof File || input instanceof Blob) {
    originalSizeBytes = input.size;
    img = await loadImage(input);
  } else if (typeof input === 'string') {
    try {
      const blob = await fetchImageAsBlob(input);
      originalSizeBytes = blob.size;
      img = await loadImage(blob);
    } catch {
      originalSizeBytes = 0;
      img = await loadImage(input);
    }
  } else {
    img = input;
    originalSizeBytes = 0;
  }

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  const { width: outputWidth, height: outputHeight } = calculateDimensions(
    originalWidth,
    originalHeight,
    options
  );

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context');
  }

  // Fill white background for JPEG when transparent
  if (options.format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }

  drawScaled(ctx, img, outputWidth, outputHeight);

  // If targetMaxSizeBytes is defined, binary search quality
  let currentQuality = Math.min(Math.max(options.quality, 0.05), 1.0);
  let finalBlob: Blob;

  if (options.targetMaxSizeBytes && options.targetMaxSizeBytes > 0 && options.format !== 'image/png') {
    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob: Blob | null = null;

    // Up to 5 binary search iterations
    for (let iter = 0; iter < 5; iter++) {
      const testQ = (minQ + maxQ) / 2;
      const testBlob = await canvasToBlob(canvas, options.format, testQ);
      bestBlob = testBlob;

      if (testBlob.size <= options.targetMaxSizeBytes) {
        minQ = testQ; // can we get better quality?
      } else {
        maxQ = testQ; // needs more compression
      }
    }
    finalBlob = bestBlob || (await canvasToBlob(canvas, options.format, currentQuality));
  } else {
    finalBlob = await canvasToBlob(canvas, options.format, currentQuality);
  }

  const outputSizeBytes = finalBlob.size;
  const compressionRatio = originalSizeBytes > 0 ? outputSizeBytes / originalSizeBytes : 1;
  const dataUrl = canvas.toDataURL(options.format, currentQuality);

  // Derive file extension
  let ext = 'webp';
  if (options.format === 'image/jpeg') ext = 'jpg';
  else if (options.format === 'image/png') ext = 'png';

  const baseName = suggestedFileName.replace(/\.[^/.]+$/, '');
  const fileName = `${baseName}.${ext}`;

  return {
    blob: finalBlob,
    dataUrl,
    originalWidth,
    originalHeight,
    originalSizeBytes,
    outputWidth,
    outputHeight,
    outputSizeBytes,
    compressionRatio,
    format: options.format,
    fileName
  };
}

/**
 * Trigger immediate browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
