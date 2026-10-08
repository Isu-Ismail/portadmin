import type { ImageFormat, ProcessedImageResult } from '@/core/types';
import { fetchImageAsBlob, loadImage, processImage } from '@/core/utils/image';

/**
 * Shared state + logic for resizing / compressing one image.
 * Used by the resizer modal (About, Projects) and the standalone Image Studio.
 */
export class ImageEditor {
  source = $state<File | Blob | string | null>(null);
  previewUrl = $state<string | null>(null);

  origWidth = $state(0);
  origHeight = $state(0);
  origSize = $state(0);

  targetWidth = $state(1200);
  targetHeight = $state(800);
  lockAspect = $state(true);
  aspectRatio = $state(1.5);

  format = $state<ImageFormat>('image/webp');
  quality = $state(0.82);
  targetSizeKb = $state<number | null>(null);

  processing = $state(false);
  error = $state<string | null>(null);
  processed = $state<ProcessedImageResult | null>(null);

  private fileName = 'image.webp';
  private ownedUrl: string | null = null;
  private runId = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** Load a new source image and run the first pass. */
  async load(source: File | Blob | string, fileName = 'image.webp'): Promise<void> {
    this.fileName = fileName;
    this.processing = true;
    this.error = null;
    this.processed = null;
    this.releaseUrl();
    try {
      let blobOrUrl: File | Blob | string = source;
      this.origSize = 0;
      if (typeof source === 'string') {
        this.previewUrl = source;
        try {
          const blob = await fetchImageAsBlob(source);
          this.origSize = blob.size;
          blobOrUrl = blob;
        } catch {
          // keep URL; canvas export may be blocked by CORS
        }
      } else {
        this.origSize = source.size;
      }
      if (typeof blobOrUrl !== 'string') {
        this.ownedUrl = URL.createObjectURL(blobOrUrl);
        this.previewUrl = this.ownedUrl;
      }
      this.source = blobOrUrl;

      const img = await loadImage(blobOrUrl);
      this.origWidth = img.naturalWidth || img.width;
      this.origHeight = img.naturalHeight || img.height;
      this.aspectRatio = this.origWidth / (this.origHeight || 1);

      if (this.origWidth > 1600) {
        this.targetWidth = 1600;
        this.targetHeight = Math.round(1600 / this.aspectRatio);
      } else {
        this.targetWidth = this.origWidth;
        this.targetHeight = this.origHeight;
      }
      await this.run();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load image';
      this.processing = false;
    }
  }

  /** Re-run processing after a short pause (for typing / slider drags). */
  schedule(delay = 150): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.run(), delay);
  }

  async run(): Promise<void> {
    if (!this.source || this.targetWidth <= 0 || this.targetHeight <= 0) return;
    const id = ++this.runId;
    this.processing = true;
    this.error = null;
    try {
      const res = await processImage(
        this.source,
        {
          width: this.targetWidth,
          height: this.targetHeight,
          maintainAspectRatio: this.lockAspect,
          quality: this.quality,
          format: this.format,
          targetMaxSizeBytes: this.targetSizeKb ? this.targetSizeKb * 1024 : undefined
        },
        this.fileName
      );
      if (id === this.runId) this.processed = res;
    } catch (err) {
      if (id === this.runId) this.error = err instanceof Error ? err.message : 'Failed to process image';
    } finally {
      if (id === this.runId) this.processing = false;
    }
  }

  setWidth(v: number): void {
    this.targetWidth = Math.max(1, v || 1);
    if (this.lockAspect && this.aspectRatio > 0) {
      this.targetHeight = Math.max(1, Math.round(this.targetWidth / this.aspectRatio));
    }
    this.schedule();
  }

  setHeight(v: number): void {
    this.targetHeight = Math.max(1, v || 1);
    if (this.lockAspect && this.aspectRatio > 0) {
      this.targetWidth = Math.max(1, Math.round(this.targetHeight * this.aspectRatio));
    }
    this.schedule();
  }

  setFormat(f: ImageFormat): void {
    this.format = f;
    void this.run();
  }

  setTargetKb(v: number): void {
    this.targetSizeKb = v > 0 ? v : null;
  }

  presetRatio(w: number, h: number): void {
    this.aspectRatio = w / h;
    this.lockAspect = true;
    this.targetHeight = Math.round(this.targetWidth / this.aspectRatio);
    void this.run();
  }

  presetMaxDimension(max: number): void {
    const ratio = this.aspectRatio || 1;
    if (this.origWidth >= this.origHeight) {
      this.targetWidth = Math.min(this.origWidth, max);
      this.targetHeight = Math.round(this.targetWidth / ratio);
    } else {
      this.targetHeight = Math.min(this.origHeight, max);
      this.targetWidth = Math.round(this.targetHeight * ratio);
    }
    void this.run();
  }

  /** Reset to the loaded image's original dimensions. */
  reset(): Promise<void> {
    return this.source ? this.load(this.source, this.fileName) : Promise.resolve();
  }

  releaseUrl(): void {
    if (this.ownedUrl) URL.revokeObjectURL(this.ownedUrl);
    this.ownedUrl = null;
  }

  destroy(): void {
    clearTimeout(this.timer);
    this.releaseUrl();
  }
}
