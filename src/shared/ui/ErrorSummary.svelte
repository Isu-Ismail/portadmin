<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';

  let { errors, title = 'Fix these issues before saving' }: { errors: Record<string, string>; title?: string } = $props();
  const entries = $derived(Object.entries(errors));
</script>

{#if entries.length}
  <div class="mb-4 flex gap-3 rounded-md border border-bad/40 bg-bad/10 p-4 text-sm" role="alert">
    <AlertCircle size={18} class="mt-0.5 shrink-0 text-bad" />
    <div>
      <strong class="text-ink">{title}</strong>
      <ul class="mt-1.5 list-disc pl-4 text-xs text-ink-2">
        {#each entries as [field, msg] (field)}
          <li><span class="font-mono text-ink">{field}</span>: {msg}</li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
