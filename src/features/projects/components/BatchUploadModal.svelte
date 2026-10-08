<script lang="ts">
  import { Folder, Upload } from '@lucide/svelte';
  import type { ImageFormat } from '@/core/types';
  import { formatBytes } from '@/core/utils/image';
  import Modal from '@/shared/ui/Modal.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import type { GalleryController } from '../gallery.svelte';

  interface Props {
    open: boolean;
    files: File[];
    gallery: GalleryController;
    existingCount: number;
    onclose: () => void;
  }

  let { open, files, gallery, existingCount, onclose }: Props = $props();

  let format = $state<ImageFormat>('image/webp');
  let maxWidth = $state(1600);
  let quality = $state(0.82);
  let busy = $state(false);
  let done = $state(0);

  const extFor = (f: ImageFormat) => (f === 'image/png' ? 'png' : f === 'image/jpeg' ? 'jpeg' : 'webp');

  async function run() {
    busy = true;
    done = 0;
    const ok = await gallery.uploadBatch(files, { format, maxWidth, quality }, (d) => (done = d));
    busy = false;
    if (ok) onclose();
  }
</script>

<Modal {open} title="Batch upload ({files.length} images)" size="lg" onclose={() => !busy && onclose()}>
  <div class="mb-5 grid gap-4 sm:grid-cols-2">
    <p class="text-xs text-ink-3 sm:col-span-2">
      Files are named automatically: <code>{gallery.cleanId}_XXXX.{extFor(format)}</code> (4 random characters).
    </p>
    <Field label="Format">
      <select class={inputClass} bind:value={format}>
        <option value="image/webp">WebP (best)</option>
        <option value="image/jpeg">JPEG</option>
        <option value="image/png">PNG</option>
      </select>
    </Field>
    <Field label="Max width">
      <select class={inputClass} bind:value={maxWidth}>
        <option value={1920}>1920px (Full HD)</option>
        <option value={1600}>1600px (recommended)</option>
        <option value={1200}>1200px</option>
        <option value={800}>800px</option>
      </select>
    </Field>
    <Field label="Quality: {Math.round(quality * 100)}%">
      <input class="w-full accent-orange" type="range" min="0.4" max="1" step="0.05" bind:value={quality} />
    </Field>
  </div>

  {#if busy}
    <div class="mb-4">
      <div class="mb-1.5 flex justify-between text-xs text-ink-2">
        <span>Optimizing and uploading {done} of {files.length}…</span>
        <span>{Math.round((done / files.length) * 100)}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded bg-panel">
        <div class="h-full bg-orange" style="width:{(done / files.length) * 100}%"></div>
      </div>
    </div>
  {/if}

  <div class="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
    {#each files as file, i (file.name + i)}
      <div class="flex items-center gap-3 rounded border border-line bg-bg px-3 py-2 text-xs">
        <span class="w-8 shrink-0 text-ink-3">#{existingCount + 1 + i}</span>
        <span class="min-w-0 flex-1 truncate text-ink-2">{file.name} <span class="text-ink-3">({formatBytes(file.size)})</span></span>
        <Folder size={12} class="shrink-0 text-ink-3" />
        <span class="hidden truncate text-ink-3 sm:inline">projects/{gallery.cleanId}/{gallery.cleanId}_<strong class="text-ink">XXXX</strong>.{extFor(format)}</span>
      </div>
    {/each}
  </div>

  {#snippet footer()}
    <Button onclick={onclose} disabled={busy}>Cancel</Button>
    <Button variant="primary" onclick={run} disabled={busy}>
      {#if busy}<Spinner size={14} /> Uploading ({done}/{files.length})…{:else}<Upload size={14} /> Upload all {files.length}{/if}
    </Button>
  {/snippet}
</Modal>
