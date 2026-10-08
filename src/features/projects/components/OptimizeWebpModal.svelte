<script lang="ts">
  import { Zap } from '@lucide/svelte';
  import { formatBytes } from '@/core/utils/image';
  import { toast } from '@/core/utils/toast.svelte';
  import Modal from '@/shared/ui/Modal.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import { fileExt, storageFileName, type GalleryController } from '../gallery.svelte';

  interface Props {
    open: boolean;
    images: string[];
    gallery: GalleryController;
    onclose: () => void;
  }

  let { open, images, gallery, onclose }: Props = $props();

  let quality = $state(0.82);
  let maxWidth = $state(0); // 0 = keep original size
  let busy = $state(false);
  let done = $state(0);
  let total = $state(0);

  const candidates = $derived(gallery.nonWebpIndices);
  const skipped = $derived(images.length - candidates.length);

  async function run() {
    busy = true;
    done = 0;
    total = candidates.length;
    const res = await gallery.optimizeToWebp(
      { quality, maxWidth: maxWidth || undefined },
      (d, t) => ((done = d), (total = t))
    );
    busy = false;
    const saved = res.bytesBefore - res.bytesAfter;
    if (res.converted) {
      toast.success(
        `Converted ${res.converted} image${res.converted > 1 ? 's' : ''} to WebP` +
          (saved > 0 ? `, saved ${formatBytes(saved)}` : '') +
          '. Save the project to keep the changes.'
      );
    }
    if (res.failed) toast.error(`${res.failed} image${res.failed > 1 ? 's' : ''} could not be converted (see console).`);
    onclose();
  }
</script>

<Modal {open} title="Optimize images to WebP" size="lg" onclose={() => !busy && onclose()}>
  <p class="mb-4 text-xs text-ink-3">
    Converts every image that is not already WebP. Images that are already WebP are skipped. Each converted image gets a new
    random name (<code>{gallery.cleanId}_XXXX.webp</code>); the old file is removed from Storage when you save the project.
  </p>

  <div class="mb-5 grid gap-4 sm:grid-cols-2">
    <Field label="Max width">
      <select class={inputClass} bind:value={maxWidth} disabled={busy}>
        <option value={0}>Keep original size</option>
        <option value={1920}>1920px (Full HD)</option>
        <option value={1600}>1600px</option>
        <option value={1200}>1200px</option>
        <option value={800}>800px</option>
      </select>
    </Field>
    <Field label="Quality: {Math.round(quality * 100)}%">
      <input class="w-full accent-orange" type="range" min="0.4" max="1" step="0.02" bind:value={quality} disabled={busy} />
    </Field>
  </div>

  <div class="mb-2 flex justify-between text-xs">
    <span class="font-semibold text-ink-2">{candidates.length} to convert</span>
    <span class="text-ink-3">{skipped} already WebP (skipped)</span>
  </div>

  {#if busy}
    <div class="mb-4">
      <div class="mb-1.5 flex justify-between text-xs text-ink-2">
        <span>Converting {done} of {total}…</span>
        <span>{Math.round((done / Math.max(total, 1)) * 100)}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded bg-panel">
        <div class="h-full bg-orange" style="width:{(done / Math.max(total, 1)) * 100}%"></div>
      </div>
    </div>
  {/if}

  <div class="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
    {#each candidates as idx (idx)}
      <div class="flex items-center gap-3 rounded border border-line bg-bg px-3 py-2 text-xs">
        <span class="w-8 shrink-0 text-ink-3">#{idx + 1}</span>
        <img src={images[idx]} alt="" class="h-8 w-12 shrink-0 rounded object-cover" loading="lazy" />
        <span class="min-w-0 flex-1 truncate font-mono text-ink-2">{storageFileName(images[idx])}</span>
        <span class="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-ink-3 uppercase">
          {fileExt(images[idx]) || 'file'} → webp
        </span>
      </div>
    {:else}
      <p class="py-6 text-center text-xs text-ink-3">All images are already WebP. Nothing to do.</p>
    {/each}
  </div>

  {#snippet footer()}
    <Button onclick={onclose} disabled={busy}>Close</Button>
    <Button variant="primary" onclick={run} disabled={busy || candidates.length === 0}>
      {#if busy}<Spinner size={14} /> Converting…{:else}<Zap size={14} /> Convert {candidates.length} to WebP{/if}
    </Button>
  {/snippet}
</Modal>
