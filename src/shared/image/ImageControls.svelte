<script lang="ts">
  import { Lock, LockOpen } from '@lucide/svelte';
  import Button from '@/shared/ui/Button.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import type { ImageFormat } from '@/core/types';
  import type { ImageEditor } from './ImageEditor.svelte';

  let { editor }: { editor: ImageEditor } = $props();

  const formats: { value: ImageFormat; label: string }[] = [
    { value: 'image/webp', label: 'WebP' },
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' }
  ];

  const chip = 'rounded border border-line px-2 py-1 text-xs text-ink-2 hover:border-line-strong hover:text-ink';
</script>

<div class="flex flex-col gap-5">
  <section class="flex flex-col gap-3">
    <h4 class="text-xs font-semibold tracking-wide text-ink-3 uppercase">Dimensions</h4>
    <div class="flex items-end gap-2">
      <label class="flex-1 text-xs text-ink-2">
        Width (px)
        <input
          class="{inputClass} mt-1.5"
          type="number"
          min="10"
          max="5000"
          value={editor.targetWidth}
          oninput={(e) => editor.setWidth(Number(e.currentTarget.value))}
        />
      </label>
      <button
        type="button"
        class="mb-0.5 rounded-md border p-2.5 {editor.lockAspect
          ? 'border-orange text-orange'
          : 'border-line text-ink-3 hover:text-ink'}"
        onclick={() => (editor.lockAspect = !editor.lockAspect)}
        title="Lock aspect ratio"
        aria-label="Lock aspect ratio"
      >
        {#if editor.lockAspect}<Lock size={14} />{:else}<LockOpen size={14} />{/if}
      </button>
      <label class="flex-1 text-xs text-ink-2">
        Height (px)
        <input
          class="{inputClass} mt-1.5"
          type="number"
          min="10"
          max="5000"
          value={editor.targetHeight}
          oninput={(e) => editor.setHeight(Number(e.currentTarget.value))}
        />
      </label>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <button type="button" class={chip} onclick={() => editor.presetMaxDimension(1920)}>HD 1920</button>
      <button type="button" class={chip} onclick={() => editor.presetMaxDimension(1200)}>1200px</button>
      <button type="button" class={chip} onclick={() => editor.presetMaxDimension(800)}>800px</button>
      <button type="button" class={chip} onclick={() => editor.presetRatio(1, 1)}>1:1</button>
      <button type="button" class={chip} onclick={() => editor.presetRatio(16, 9)}>16:9</button>
    </div>
  </section>

  <section class="flex flex-col gap-3">
    <h4 class="text-xs font-semibold tracking-wide text-ink-3 uppercase">Format &amp; quality</h4>
    <div class="grid grid-cols-3 gap-1.5">
      {#each formats as f (f.value)}
        <button
          type="button"
          class="rounded-md border px-2 py-1.5 text-xs font-medium {editor.format === f.value
            ? 'border-orange bg-orange/15 text-orange'
            : 'border-line text-ink-2 hover:border-line-strong hover:text-ink'}"
          onclick={() => editor.setFormat(f.value)}
        >
          {f.label}
        </button>
      {/each}
    </div>

    {#if editor.format !== 'image/png'}
      <label class="text-xs text-ink-2">
        <span class="flex justify-between">Quality <span class="text-ink">{Math.round(editor.quality * 100)}%</span></span>
        <input
          class="mt-1.5 w-full accent-orange"
          type="range"
          min="0.1"
          max="1"
          step="0.02"
          bind:value={editor.quality}
          oninput={() => editor.schedule()}
        />
      </label>
    {/if}

    <div class="flex items-end gap-2">
      <label class="flex-1 text-xs text-ink-2">
        Target max size (KB, optional)
        <input
          class="{inputClass} mt-1.5"
          type="number"
          min="20"
          max="10000"
          placeholder="e.g. 200"
          value={editor.targetSizeKb ?? ''}
          oninput={(e) => editor.setTargetKb(Number(e.currentTarget.value))}
        />
      </label>
      <Button size="md" onclick={() => editor.run()}>Optimize</Button>
    </div>
  </section>
</div>
