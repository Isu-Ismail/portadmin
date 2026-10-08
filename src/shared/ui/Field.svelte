<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label?: string;
    error?: string;
    hint?: string;
    class?: string;
    children: Snippet;
  }

  let { label, error, hint, class: cls = '', children }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {cls}">
  {#if label}
    <span class="text-xs font-medium text-ink-2">{label}</span>
  {/if}
  {@render children()}
  {#if error}
    <span class="text-xs text-bad">{error}</span>
  {:else if hint}
    <span class="text-xs text-ink-3">{hint}</span>
  {/if}
</div>
