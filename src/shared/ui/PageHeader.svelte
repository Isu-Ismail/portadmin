<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    actions?: Snippet;
  }

  let { title, description, actions }: Props = $props();
</script>

<div class="mb-6 flex flex-wrap items-start justify-between gap-3">
  <div>
    <h1 class="text-xl font-bold text-ink">{title}</h1>
    {#if description}<p class="mt-1 text-sm text-ink-3">{description}</p>{/if}
  </div>
  {#if actions}<div class="flex items-center gap-2">{@render actions()}</div>{/if}
</div>
