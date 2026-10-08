<script lang="ts">
  import { ArrowDown, ArrowUp, CheckSquare, ExternalLink, Sparkles, Square, Trash2 } from '@lucide/svelte';
  import { storageFileName } from '../gallery.svelte';

  interface Props {
    url: string;
    index: number;
    total: number;
    selected: boolean;
    ontoggle: () => void;
    onmove: (dir: -1 | 1) => void;
    onremove: () => void;
    onedit: () => void;
  }

  let { url, index, total, selected, ontoggle, onmove, onremove, onedit }: Props = $props();

  const iconBtn = 'rounded p-1 text-ink-3 hover:bg-panel hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';
</script>

<div class="overflow-hidden rounded-md border bg-bg {selected ? 'border-orange' : 'border-line'}">
  <div class="relative aspect-video bg-surface">
    <img src={url} alt="Screenshot {index + 1}" class="h-full w-full object-cover" loading="lazy" />
    <button
      type="button"
      class="absolute top-1.5 left-1.5 rounded bg-black/70 p-1 {selected ? 'text-orange' : 'text-ink-2 hover:text-white'}"
      onclick={ontoggle}
      aria-label={selected ? `Deselect image ${index + 1}` : `Select image ${index + 1}`}
    >
      {#if selected}<CheckSquare size={16} />{:else}<Square size={16} />{/if}
    </button>
    <span class="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold">#{index + 1}</span>
    <div class="absolute top-1.5 right-1.5 flex gap-1">
      <a href={url} target="_blank" rel="noreferrer" class="rounded bg-black/70 p-1 text-ink-2 hover:text-white" title="Open full size">
        <ExternalLink size={14} />
      </a>
      <button type="button" class="rounded bg-black/70 p-1 text-ink-2 hover:text-white" onclick={onedit} title="Resize or compress" aria-label="Resize or compress">
        <Sparkles size={14} />
      </button>
    </div>
  </div>
  <div class="flex items-center gap-1 px-1.5 py-1">
    <button type="button" class={iconBtn} disabled={index === 0} onclick={() => onmove(-1)} title="Move earlier" aria-label="Move earlier">
      <ArrowUp size={13} />
    </button>
    <button type="button" class={iconBtn} disabled={index === total - 1} onclick={() => onmove(1)} title="Move later" aria-label="Move later">
      <ArrowDown size={13} />
    </button>
    <span class="min-w-0 flex-1 truncate px-1 text-center font-mono text-[10px] text-ink-3">{storageFileName(url)}</span>
    <button type="button" class="{iconBtn} hover:text-bad" onclick={onremove} title="Delete screenshot" aria-label="Delete screenshot">
      <Trash2 size={13} />
    </button>
  </div>
</div>
