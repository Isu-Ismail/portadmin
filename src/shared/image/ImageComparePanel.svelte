<script lang="ts">
  import { FileImage, Zap } from '@lucide/svelte';
  import { formatBytes } from '@/core/utils/image';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import type { ImageEditor } from './ImageEditor.svelte';

  let { editor }: { editor: ImageEditor } = $props();
  const saved = $derived(
    editor.processed && editor.origSize > 0 && editor.processed.compressionRatio < 1
      ? Math.round((1 - editor.processed.compressionRatio) * 100)
      : 0
  );
</script>

<div class="grid gap-3 sm:grid-cols-2">
  <div class="overflow-hidden rounded-md border border-line">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-panel px-3 py-2 text-xs">
      <span class="font-semibold text-ink-2">Original</span>
      <span class="text-ink-3">
        {#if editor.origWidth}{editor.origWidth} × {editor.origHeight}{/if}
        {#if editor.origSize}· {formatBytes(editor.origSize)}{/if}
      </span>
    </div>
    <div class="flex h-64 items-center justify-center bg-bg">
      {#if editor.previewUrl}
        <img src={editor.previewUrl} alt="Original" class="max-h-full max-w-full object-contain" />
      {:else}
        <FileImage size={32} class="text-ink-3" />
      {/if}
    </div>
  </div>

  <div class="overflow-hidden rounded-md border border-orange/60">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-panel px-3 py-2 text-xs">
      <span class="font-semibold text-orange">Edited</span>
      <span class="flex items-center gap-2 text-ink-3">
        {#if editor.processed}
          {editor.processed.outputWidth} × {editor.processed.outputHeight} · {formatBytes(editor.processed.outputSizeBytes)}
          {#if saved}<span class="flex items-center gap-1 text-ok"><Zap size={12} />{saved}% saved</span>{/if}
        {/if}
      </span>
    </div>
    <div class="relative flex h-64 items-center justify-center bg-bg">
      {#if editor.processed}
        <img src={editor.processed.dataUrl} alt="Edited" class="max-h-full max-w-full object-contain" />
      {:else}
        <FileImage size={32} class="text-ink-3" />
      {/if}
      {#if editor.processing}
        <div class="absolute inset-0 flex items-center justify-center bg-black/60"><Spinner /></div>
      {/if}
    </div>
  </div>
</div>

{#if editor.error}
  <p class="mt-3 rounded-md border border-bad/40 px-3 py-2 text-xs text-bad">{editor.error}</p>
{/if}
