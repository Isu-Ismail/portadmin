<script lang="ts">
  import { Plus, Trash2, Upload, Zap } from '@lucide/svelte';
  import type { ProcessedImageResult } from '@/core/types';
  import { toast } from '@/core/utils/toast.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import ImageResizerModal from '@/shared/image/ImageResizerModal.svelte';
  import { GalleryController } from '../gallery.svelte';
  import BatchUploadModal from './BatchUploadModal.svelte';
  import OptimizeWebpModal from './OptimizeWebpModal.svelte';
  import GalleryImageCard from './GalleryImageCard.svelte';

  let {
    projectId,
    images = $bindable([]),
    onreplace
  }: { projectId: string; images: string[]; onreplace?: (url: string) => void } = $props();

  const gallery = new GalleryController({
    projectId: () => projectId,
    get: () => images,
    set: (v) => (images = v),
    onReplaced: (url) => onreplace?.(url)
  });

  let dragging = $state(false);
  let dragFrom = $state<number | null>(null);
  let dragOver = $state<number | null>(null);

  function dropOn(to: number) {
    if (dragFrom !== null) gallery.reorder(dragFrom, to);
    dragFrom = dragOver = null;
  }
  let resizerOpen = $state(false);
  let targetIdx = $state<number | null>(null);
  let singleFile = $state<File | null>(null);
  let batchOpen = $state(false);
  let batchFiles = $state<File[]>([]);
  let optimizeOpen = $state(false);

  function pick(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) {
      toast.error('No valid image files detected.');
      return;
    }
    if (imgs.length === 1) {
      singleFile = imgs[0];
      targetIdx = null;
      resizerOpen = true;
    } else {
      batchFiles = imgs;
      batchOpen = true;
    }
  }

  function editExisting(idx: number) {
    singleFile = null;
    targetIdx = idx;
    resizerOpen = true;
  }

  async function applyEdited(result: ProcessedImageResult) {
    resizerOpen = false;
    await gallery.uploadEdited(result, targetIdx);
    singleFile = null;
    targetIdx = null;
  }

  async function applyOriginal() {
    resizerOpen = false;
    if (singleFile) await gallery.uploadOriginal(singleFile, targetIdx);
    singleFile = null;
    targetIdx = null;
  }

</script>

<Card title="Screenshots & carousel" description="Drag cards to reorder. Order is saved to Firestore only; Storage files are never renamed.">
  {#snippet actions()}
    {#if gallery.nonWebpIndices.length}
      <Button size="sm" onclick={() => (optimizeOpen = true)} title="Convert non-WebP images to WebP">
        <Zap size={13} /> Optimize to WebP ({gallery.nonWebpIndices.length})
      </Button>
    {/if}
    <label
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-crimson px-2.5 py-1.5 text-xs font-medium text-white hover:bg-crimson-hi"
    >
      <Upload size={14} /> Add screenshots
      <input
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        onchange={(e) => {
          pick(Array.from(e.currentTarget.files ?? []));
          e.currentTarget.value = '';
        }}
      />
    </label>
  {/snippet}

  {#if gallery.selected.length}
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-orange/50 bg-panel px-3 py-2 text-xs">
      <div class="flex items-center gap-3">
        <span class="font-semibold text-orange">{gallery.selected.length} selected</span>
        <button type="button" class="text-ink-2 hover:text-ink" onclick={() => gallery.selectAll()}>Select all ({images.length})</button>
        <button type="button" class="text-ink-2 hover:text-ink" onclick={() => gallery.clearSelection()}>Clear</button>
      </div>
      <Button size="sm" variant="danger" onclick={() => gallery.deleteSelected()}>
        <Trash2 size={13} /> Delete selected
      </Button>
    </div>
  {/if}

  {#if gallery.uploading}
    <p class="mb-4 flex items-center gap-2 text-xs text-ink-2"><Spinner size={14} /> Uploading to projects/{gallery.cleanId}/ …</p>
  {/if}

  <div
    class="rounded-md border-2 border-dashed p-3 {dragging ? 'border-orange bg-panel' : 'border-transparent'}"
    role="region"
    aria-label="Screenshots drop zone"
    ondragover={(e) => {
      e.preventDefault();
      dragging = true;
    }}
    ondragleave={() => (dragging = false)}
    ondrop={(e) => {
      e.preventDefault();
      dragging = false;
      pick(Array.from(e.dataTransfer?.files ?? []));
    }}
  >
    {#if images.length === 0}
      <div class="flex flex-col items-center gap-2 py-10 text-center">
        <Upload size={26} class="text-orange" />
        <p class="text-sm font-semibold">Drag & drop screenshots here</p>
        <p class="text-xs text-ink-3">Select several at once to optimize and upload as a batch.</p>
        <label
          class="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink"
        >
          <Plus size={14} /> Browse files
          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            onchange={(e) => {
              pick(Array.from(e.currentTarget.files ?? []));
              e.currentTarget.value = '';
            }}
          />
        </label>
      </div>
    {:else}
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each images as url, i (url + i)}
          <GalleryImageCard
            {url}
            index={i}
            total={images.length}
            selected={gallery.selected.includes(i)}
            ontoggle={() => gallery.toggle(i)}
            onmove={(dir) => gallery.move(i, dir)}
            onremove={() => gallery.remove(i)}
            onedit={() => editExisting(i)}
            dragging={dragFrom === i}
            dropTarget={dragOver === i && dragFrom !== null && dragFrom !== i}
            ondragstart={() => (dragFrom = i)}
            ondragenter={() => (dragOver = i)}
            ondrop={() => dropOn(i)}
            ondragend={() => (dragFrom = dragOver = null)}
          />
        {/each}
      </div>
    {/if}
  </div>
</Card>

<ImageResizerModal
  open={resizerOpen}
  imageFile={singleFile || (targetIdx !== null ? images[targetIdx] : null)}
  initialFileName="{gallery.cleanId}.webp"
  onapply={applyEdited}
  onapplyOriginal={singleFile ? applyOriginal : undefined}
  oncancel={() => (resizerOpen = false)}
/>

<BatchUploadModal
  open={batchOpen}
  files={batchFiles}
  {gallery}
  existingCount={images.length}
  onclose={() => ((batchOpen = false), (batchFiles = []))}
/>

<OptimizeWebpModal open={optimizeOpen} {images} {gallery} onclose={() => (optimizeOpen = false)} />
