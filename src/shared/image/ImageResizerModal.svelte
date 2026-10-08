<script lang="ts">
  import { Check, Download, RotateCcw } from '@lucide/svelte';
  import { downloadBlob, formatBytes } from '@/core/utils/image';
  import type { ProcessedImageResult } from '@/core/types';
  import Modal from '@/shared/ui/Modal.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import { ImageEditor } from './ImageEditor.svelte';
  import ImageComparePanel from './ImageComparePanel.svelte';
  import ImageControls from './ImageControls.svelte';

  interface Props {
    open: boolean;
    imageFile?: File | Blob | string | null;
    initialFileName?: string;
    onapply: (result: ProcessedImageResult) => void;
    onapplyOriginal?: () => void;
    oncancel: () => void;
  }

  let { open, imageFile = null, initialFileName = 'image.webp', onapply, onapplyOriginal, oncancel }: Props = $props();

  const editor = new ImageEditor();

  $effect(() => {
    if (open && imageFile) void editor.load(imageFile, initialFileName);
    return () => editor.destroy();
  });
</script>

<Modal {open} title="Resize &amp; compress image" size="xl" onclose={oncancel}>
  <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
    <ImageComparePanel {editor} />
    <ImageControls {editor} />
  </div>

  {#snippet footer()}
    <Button variant="ghost" class="mr-auto" onclick={() => editor.reset()}><RotateCcw size={14} /> Reset</Button>
    <Button
      onclick={() => editor.processed && downloadBlob(editor.processed.blob, editor.processed.fileName)}
      disabled={!editor.processed}
    >
      <Download size={14} /> Download
    </Button>
    {#if onapplyOriginal}
      <Button onclick={onapplyOriginal}>
        Upload original{editor.origSize > 0 ? ` (${formatBytes(editor.origSize)})` : ''}
      </Button>
    {/if}
    <Button
      variant="primary"
      onclick={() => editor.processed && onapply(editor.processed)}
      disabled={!editor.processed || editor.processing}
    >
      <Check size={14} /> Upload edited{editor.processed ? ` (${formatBytes(editor.processed.outputSizeBytes)})` : ''}
    </Button>
  {/snippet}
</Modal>
