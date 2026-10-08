<script lang="ts">
  import { Download, Upload } from '@lucide/svelte';
  import { downloadBlob, formatBytes } from '@/core/utils/image';
  import { toast } from '@/core/utils/toast.svelte';
  import { ImageEditor } from '@/shared/image/ImageEditor.svelte';
  import ImageComparePanel from '@/shared/image/ImageComparePanel.svelte';
  import ImageControls from '@/shared/image/ImageControls.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Card from '@/shared/ui/Card.svelte';
  import PageHeader from '@/shared/ui/PageHeader.svelte';

  const editor = new ImageEditor();
  let hasFile = $state(false);
  let dragging = $state(false);

  $effect(() => () => editor.destroy());

  function pick(file: File | undefined) {
    if (!file) return;
    hasFile = true;
    void editor.load(file, file.name);
  }

  function download() {
    if (!editor.processed) return;
    downloadBlob(editor.processed.blob, editor.processed.fileName);
    toast.success(`Downloaded ${editor.processed.fileName}`);
  }
</script>

<PageHeader title="Image Studio" description="Resize, convert and compress images in your browser. Nothing is uploaded.">
  {#snippet actions()}
    {#if editor.processed}
      <Button variant="primary" onclick={download}>
        <Download size={15} /> Download ({formatBytes(editor.processed.outputSizeBytes)})
      </Button>
    {/if}
  {/snippet}
</PageHeader>

{#if !hasFile}
  <div
    class="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-20 text-center {dragging
      ? 'border-orange bg-panel'
      : 'border-line-strong'}"
    role="region"
    aria-label="Image drop zone"
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
    <Upload size={30} class="text-orange" />
    <h2 class="text-base font-semibold">Drop an image here</h2>
    <p class="text-xs text-ink-3">PNG, JPEG, WebP, GIF</p>
    <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-hi">
      Browse file
      <input type="file" accept="image/*" class="hidden" onchange={(e) => pick(e.currentTarget.files?.[0])} />
    </label>
  </div>
{:else}
  <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
    <Card title="Preview">
      <ImageComparePanel {editor} />
    </Card>
    <Card title="Settings">
      <ImageControls {editor} />
      <div class="mt-5 flex flex-col gap-2 border-t border-line pt-4">
        <Button variant="primary" onclick={download} disabled={!editor.processed}>
          <Download size={15} /> Download optimized
        </Button>
        <label
          class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-line bg-panel px-3.5 py-2 text-sm font-medium text-ink-2 hover:border-line-strong hover:text-ink"
        >
          Change image
          <input type="file" accept="image/*" class="hidden" onchange={(e) => pick(e.currentTarget.files?.[0])} />
        </label>
      </div>
    </Card>
  </div>
{/if}
