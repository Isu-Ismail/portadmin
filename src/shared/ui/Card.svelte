<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    class?: string;
    actions?: Snippet;
    children: Snippet;
  }

  let { title, description, class: cls = '', actions, children }: Props = $props();
</script>

<section class="rounded-lg border border-line bg-surface {cls}">
  {#if title || actions}
    <header class="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
      <div class="min-w-0">
        {#if title}<h2 class="text-sm font-semibold text-ink">{title}</h2>{/if}
        {#if description}<p class="mt-0.5 text-xs text-ink-3">{description}</p>{/if}
      </div>
      {#if actions}<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>{/if}
    </header>
  {/if}
  <div class="p-5">{@render children()}</div>
</section>
