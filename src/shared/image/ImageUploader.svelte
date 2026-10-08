<script lang="ts">
  import { ExternalLink, Image as ImageIcon, Sparkles, Trash2, Upload } from '@lucide/svelte';
  import type { ProcessedImageResult } from '@/core/types';
  import { toast } from '@/core/utils/toast.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import ImageResizerModal from './ImageResizerModal.svelte';

  interface Props {
    value?: string;
    label: string;
    description?: string;
    accept?: string;
    uploadHandler?: (file: File | Blob, originalName: string) => Promise<string>;
    onchange?: (url: string) => void;
  }

  let { value = $bindable(''), label, description = '', accept = 'image/*', uploadHandler, onchange }: Props = $props();

  let uploading = $state(false);
  let resizerOpen = $state(false);
  let pendingFile = $state<File | null>(null);
  let dragging = $state(false);

  function pick(file: File | undefined) {
    if (!file) return;
    pendingFile = file;
    resizerOpen = true;
  }

  function setValue(url: string) {
    value = url;
    onchange?.(url);
  }

  async function send(file: File | Blob, name: string, okMessage: string) {
    resizerOpen = false;
    if (!uploadHandler) return;
    uploading = true;
    try {
      setValue(await uploadHandler(file, name));
      toast.success(okMessage);
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      uploading = false;
    }
  }

  function applyEdited(result: ProcessedImageResult) {
    if (uploadHandler) return send(result.blob, result.fileName, `Uploaded ${result.fileName}`);
    resizerOpen = false;
    setValue(result.dataUrl);
    toast.success('Optimized image applied');
  }

  function clear() {
    pendingFile = null;
    setValue('');
  }
</script>

<div
  class="rounded-md border bg-bg p-3 {dragging ? 'border-orange' : 'border-line'}"
  role="region"
  aria-label="{label} drop zone"
  ondragover={(e) => {
    e.preventDefault();
    dragging = true;
  }}
  ondragleave={() => (dragging = false)}
  ondrop={(e) => {
    e.preventDefault();
    dragging = false;
    pick(e.dataTransfer?.files?.[0]);
  }}
>
  <div class="mb-2.5">
    <div class="text-xs font-medium text-ink-2">{label}</div>
    {#if description}<div class="text-xs text-ink-3">{description}</div>{/if}
  </div>

  <div class="flex flex-col gap-3 sm:flex-row">
    <div class="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-surface sm:w-40">
      {#if value}
        <img src={value} alt={label} class="h-full w-full object-cover" />
        <div class="absolute top-1 right-1 flex gap-1">
          <a href={value} target="_blank" rel="noreferrer" class="rounded bg-black/70 p-1 text-ink-2 hover:text-white" title="Open">
            <ExternalLink size={13} />
          </a>
          <button type="button" class="rounded bg-black/70 p-1 text-ink-2 hover:text-bad" onclick={clear} title="Clear" aria-label="Clear image">
            <Trash2 size={13} />
          </button>
        </div>
      {:else}
        <ImageIcon size={26} class="text-ink-3" />
      {/if}
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <input
        class={inputClass}
        type="text"
        bind:value
        oninput={() => onchange?.(value)}
        placeholder="Paste image URL or upload a file"
      />
      <div class="flex flex-wrap items-center gap-2">
        <label
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink"
        >
          <Upload size={14} /> Choose file
          <input
            type="file"
            {accept}
            class="hidden"
            onchange={(e) => {
              pick(e.currentTarget.files?.[0]);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {#if value}
          <Button size="sm" onclick={() => (resizerOpen = true)}><Sparkles size={14} /> Resize &amp; compress</Button>
        {/if}
        {#if uploading}<span class="flex items-center gap-2 text-xs text-ink-3"><Spinner size={14} /> Uploading…</span>{/if}
      </div>
    </div>
  </div>
</div>

<ImageResizerModal
  open={resizerOpen}
  imageFile={pendingFile || value}
  initialFileName="{label.replace(/\s+/g, '_').toLowerCase()}.webp"
  onapply={applyEdited}
  onapplyOriginal={pendingFile && uploadHandler
    ? () => send(pendingFile!, pendingFile!.name, 'Original image uploaded')
    : undefined}
  oncancel={() => (resizerOpen = false)}
/>
