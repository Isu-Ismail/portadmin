import { deleteStorageFile, uploadProjectImage } from '@/core/firebase/storage';
import type { ImageFormat, ProcessedImageResult } from '@/core/types';
import { fetchImageAsBlob, processImage } from '@/core/utils/image';
import { toast } from '@/core/utils/toast.svelte';

export interface GalleryContext {
  projectId: () => string;
  get: () => string[];
  set: (images: string[]) => void;
  /**
   * Called with a Storage URL that is no longer referenced (replaced or removed).
   * The owner deletes it when the form is saved. Without it, files are deleted immediately.
   */
  onReplaced?: (url: string) => void;
}

export interface BatchOptions {
  format: ImageFormat;
  maxWidth: number;
  quality: number;
}

export interface OptimizeResult {
  converted: number;
  failed: number;
  bytesBefore: number;
  bytesAfter: number;
}

const EXT_BY_FORMAT: Record<ImageFormat, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpeg',
  'image/png': 'png'
};

const errMsg = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/** Display name for a Storage download URL (falls back to the raw string). */
export function storageFileName(url: string): string {
  try {
    const path = decodeURIComponent(url.split('/o/')[1]?.split('?')[0] ?? '');
    return path.split('/').pop() || url;
  } catch {
    return url;
  }
}

/** Lower-case file extension of an image URL (empty string when none). */
export function fileExt(url: string): string {
  const name = storageFileName(url).split('?')[0];
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
}

/**
 * Upload / reorder / delete logic for a project's screenshot gallery.
 * Reordering only changes the array order (saved to Firestore); Storage files are never renamed.
 */
export class GalleryController {
  uploading = $state(false);
  selected = $state<number[]>([]);

  constructor(private ctx: GalleryContext) {}

  get cleanId(): string {
    return (this.ctx.projectId() || 'project').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  }

  private takenNames(): Set<string> {
    return new Set(this.ctx.get().map((u) => storageFileName(u).toLowerCase()));
  }

  /** An image URL left the gallery: queue it for deletion on save (or delete now). */
  private retire(url: string | undefined): void {
    if (!url) return;
    if (this.ctx.onReplaced) this.ctx.onReplaced(url);
    else void deleteStorageFile(url);
  }

  /** Put an uploaded URL into slot `targetIdx` (retiring the old file), or append when null. */
  private place(url: string, targetIdx: number | null): void {
    const images = this.ctx.get();
    if (targetIdx === null) {
      this.ctx.set([...images, url]);
      return;
    }
    this.retire(images[targetIdx]);
    this.ctx.set(images.map((u, i) => (i === targetIdx ? url : u)));
  }

  async uploadEdited(result: ProcessedImageResult, targetIdx: number | null): Promise<void> {
    this.uploading = true;
    try {
      const url = await uploadProjectImage(this.cleanId, result.blob, result.fileName, this.takenNames());
      this.place(url, targetIdx);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(`Upload error: ${errMsg(err, 'Upload failed')}`);
    } finally {
      this.uploading = false;
    }
  }

  async uploadOriginal(file: File, targetIdx: number | null): Promise<void> {
    this.uploading = true;
    try {
      const url = await uploadProjectImage(this.cleanId, file, file.name, this.takenNames());
      this.place(url, targetIdx);
      toast.success('Original image uploaded');
    } catch (err) {
      toast.error(`Upload error: ${errMsg(err, 'Upload failed')}`);
    } finally {
      this.uploading = false;
    }
  }

  /** Compress and upload several files, appended in order. Returns true on success. */
  async uploadBatch(
    files: File[],
    opts: BatchOptions,
    onProgress: (done: number, total: number) => void
  ): Promise<boolean> {
    const taken = this.takenNames();
    const ext = EXT_BY_FORMAT[opts.format];
    const urls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        onProgress(i + 1, files.length);
        const processed = await processImage(
          files[i],
          { width: opts.maxWidth, maintainAspectRatio: true, quality: opts.quality, format: opts.format },
          `image.${ext}`
        );
        urls.push(await uploadProjectImage(this.cleanId, processed.blob, `image.${ext}`, taken));
      }
      this.ctx.set([...this.ctx.get(), ...urls]);
      toast.success(`Uploaded ${urls.length} images to projects/${this.cleanId}/`);
      return true;
    } catch (err) {
      if (urls.length) this.ctx.set([...this.ctx.get(), ...urls]);
      toast.error(`Batch upload error: ${errMsg(err, 'Batch upload failed')}`);
      return false;
    }
  }

  toggle(idx: number): void {
    this.selected = this.selected.includes(idx) ? this.selected.filter((i) => i !== idx) : [...this.selected, idx];
  }

  selectAll(): void {
    this.selected = this.ctx.get().map((_, i) => i);
  }

  clearSelection(): void {
    this.selected = [];
  }

  deleteSelected(): void {
    const images = this.ctx.get();
    const urls = this.selected.map((i) => images[i]);
    this.ctx.set(images.filter((_, i) => !this.selected.includes(i)));
    urls.forEach((u) => this.retire(u));
    toast.success(`Removed ${urls.length} image${urls.length > 1 ? 's' : ''} (files deleted on save)`);
    this.selected = [];
  }

  remove(idx: number): void {
    const url = this.ctx.get()[idx];
    this.ctx.set(this.ctx.get().filter((_, i) => i !== idx));
    this.selected = this.selected.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i));
    this.retire(url);
    toast.info(`Removed image #${idx + 1} (file deleted on save)`);
  }

  /** Move image `from` to position `to`. Only the array order changes. */
  reorder(from: number, to: number): void {
    const images = this.ctx.get();
    if (from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    this.ctx.set(copy);
    this.selected = [];
  }

  move(idx: number, dir: -1 | 1): void {
    this.reorder(idx, idx + dir);
  }

  /** Indices of gallery images that are not already WebP. */
  get nonWebpIndices(): number[] {
    return this.ctx
      .get()
      .map((url, i) => (fileExt(url) === 'webp' ? -1 : i))
      .filter((i) => i >= 0);
  }

  /**
   * Convert every non-WebP image to WebP under a fresh random name; the old file is queued for
   * deletion on save. WebP images are left untouched.
   */
  async optimizeToWebp(
    opts: { quality: number; maxWidth?: number },
    onProgress: (done: number, total: number) => void
  ): Promise<OptimizeResult> {
    const indices = this.nonWebpIndices;
    const result: OptimizeResult = { converted: 0, failed: 0, bytesBefore: 0, bytesAfter: 0 };
    const taken = this.takenNames();

    for (let n = 0; n < indices.length; n++) {
      onProgress(n + 1, indices.length);
      const idx = indices[n];
      const oldUrl = this.ctx.get()[idx];
      try {
        const source = await fetchImageAsBlob(oldUrl);
        const processed = await processImage(
          source,
          { maxWidth: opts.maxWidth, maintainAspectRatio: true, quality: opts.quality, format: 'image/webp' },
          'image.webp'
        );
        const newUrl = await uploadProjectImage(this.cleanId, processed.blob, 'image.webp', taken);
        this.ctx.set(this.ctx.get().map((u, i) => (i === idx ? newUrl : u)));
        this.retire(oldUrl);
        result.converted++;
        result.bytesBefore += source.size;
        result.bytesAfter += processed.blob.size;
      } catch (err) {
        console.warn(`Could not optimize ${oldUrl}:`, err);
        result.failed++;
      }
    }
    return result;
  }
}
