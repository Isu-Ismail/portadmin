import { deleteStorageFile, renumberProjectImages, uploadProjectImage } from '@/core/firebase/storage';
import type { ImageFormat, ProcessedImageResult } from '@/core/types';
import { processImage } from '@/core/utils/image';
import { toast } from '@/core/utils/toast.svelte';

export interface GalleryContext {
  projectId: () => string;
  get: () => string[];
  set: (images: string[]) => void;
}

export interface BatchOptions {
  format: ImageFormat;
  maxWidth: number;
  quality: number;
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

/** Upload / reorder / delete logic for a project's screenshot gallery. */
export class GalleryController {
  uploading = $state(false);
  renumbering = $state(false);
  selected = $state<number[]>([]);
  namePrefix = $state('screenshot_');

  constructor(private ctx: GalleryContext) {}

  get cleanId(): string {
    return (this.ctx.projectId() || 'project').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  }

  private extOf(name: string, fallback = 'webp'): string {
    return name.split('.').pop()?.toLowerCase() || fallback;
  }

  /** Put an uploaded URL into slot `targetIdx`, or append when null. */
  private place(url: string, targetIdx: number | null): void {
    const images = this.ctx.get();
    if (targetIdx === null) {
      this.ctx.set([...images, url]);
    } else {
      this.ctx.set(images.map((u, i) => (i === targetIdx ? url : u)));
    }
  }

  async uploadEdited(result: ProcessedImageResult, targetIdx: number | null): Promise<void> {
    const slot = targetIdx === null ? this.ctx.get().length + 1 : targetIdx + 1;
    const fileName = `${this.namePrefix}${slot}.${this.extOf(result.fileName)}`;
    this.uploading = true;
    try {
      const url = await uploadProjectImage(this.cleanId, result.blob, slot, result.fileName, fileName);
      this.place(url, targetIdx);
      toast.success(`Uploaded projects/${this.cleanId}/${fileName}`);
    } catch (err) {
      toast.error(`Upload error: ${errMsg(err, 'Upload failed')}`);
    } finally {
      this.uploading = false;
    }
  }

  async uploadOriginal(file: File, targetIdx: number | null): Promise<void> {
    const slot = targetIdx === null ? this.ctx.get().length + 1 : targetIdx + 1;
    const fileName = `${this.namePrefix}${slot}.${this.extOf(file.name)}`;
    this.uploading = true;
    try {
      const url = await uploadProjectImage(this.cleanId, file, slot, file.name, fileName);
      this.place(url, targetIdx);
      toast.success(`Uploaded original to projects/${this.cleanId}/${fileName}`);
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
    const startSlot = this.ctx.get().length + 1;
    const ext = EXT_BY_FORMAT[opts.format];
    const urls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        onProgress(i + 1, files.length);
        const slot = startSlot + i;
        const fileName = `${this.namePrefix}${slot}.${ext}`;
        const processed = await processImage(
          files[i],
          { width: opts.maxWidth, maintainAspectRatio: true, quality: opts.quality, format: opts.format },
          fileName
        );
        urls.push(await uploadProjectImage(this.cleanId, processed.blob, slot, fileName, fileName));
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
    toast.success(`Removed ${urls.length} image${urls.length > 1 ? 's' : ''} from gallery`);
    this.selected = [];
    urls.forEach((u) => void deleteStorageFile(u));
  }

  remove(idx: number): void {
    const url = this.ctx.get()[idx];
    this.ctx.set(this.ctx.get().filter((_, i) => i !== idx));
    this.selected = this.selected.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i));
    toast.info(`Removed image #${idx + 1}`);
    void deleteStorageFile(url);
  }

  move(idx: number, dir: -1 | 1): void {
    const images = this.ctx.get();
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const copy = [...images];
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
    this.ctx.set(copy);
    this.selected = [];
  }

  async renumber(): Promise<void> {
    const images = this.ctx.get();
    if (!images.length) return;
    this.renumbering = true;
    try {
      toast.info(`Renumbering files in projects/${this.cleanId}/ …`);
      this.ctx.set(await renumberProjectImages(this.cleanId, images));
      toast.success('Images renumbered sequentially in Storage');
    } catch (err) {
      toast.error(`Renumber error: ${errMsg(err, 'Renumber failed')}`);
    } finally {
      this.renumbering = false;
    }
  }
}
