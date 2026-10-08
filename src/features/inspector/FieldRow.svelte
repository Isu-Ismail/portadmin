<script lang="ts">
  import { ChevronDown, ChevronRight } from '@lucide/svelte';
  import CopyButton from '@/shared/ui/CopyButton.svelte';
  import { fieldType, shortPreview } from './inspector';

  let { name, value }: { name: string; value: unknown } = $props();
  let expanded = $state(false);

  const meta = $derived(fieldType(value));
  const isObject = $derived(typeof value === 'object' && value !== null);
</script>

<div class="rounded-md border border-line bg-bg">
  <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
    <div class="flex items-center gap-2">
      <code class="font-mono text-xs text-ink">{name}</code>
      <span class="rounded border border-line px-1.5 py-0.5 text-[10px] {meta.color}">{meta.badge}</span>
    </div>
    <div class="flex gap-1.5">
      <CopyButton text={name} label="Key" doneLabel="Copied" />
      <CopyButton
        text={() => (isObject ? JSON.stringify(value, null, 2) : String(value))}
        label="Value"
        doneLabel="Copied"
      />
      {#if isObject}
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-ink-2 hover:border-line-strong hover:text-ink"
          onclick={() => (expanded = !expanded)}
        >
          {#if expanded}<ChevronDown size={12} /> Collapse{:else}<ChevronRight size={12} /> Inspect{/if}
        </button>
      {/if}
    </div>
  </div>
  <div class="border-t border-line px-3 py-2 text-xs text-ink-2">
    {#if expanded && isObject}
      <pre class="max-h-72 overflow-auto font-mono text-[11px] text-ink-2">{JSON.stringify(value, null, 2)}</pre>
    {:else}
      <span class="font-mono break-all">{shortPreview(value)}</span>
    {/if}
  </div>
</div>
