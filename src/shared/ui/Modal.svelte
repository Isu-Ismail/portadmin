<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from '@lucide/svelte';

  interface Props {
    open: boolean;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onclose: () => void;
    children: Snippet;
    footer?: Snippet;
  }

  let { open, title, size = 'md', onclose, children, footer }: Props = $props();

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-6xl' };
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && onclose()} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    onclick={onclose}
    onkeydown={null}
    role="presentation"
  >
    <div
      class="flex max-h-[90vh] w-full flex-col rounded-lg border border-line-strong bg-surface {widths[size]}"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
    >
      <header class="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 class="text-sm font-semibold">{title}</h3>
        <button type="button" class="rounded p-1 text-ink-3 hover:text-ink" onclick={onclose} aria-label="Close">
          <X size={18} />
        </button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto p-5">{@render children()}</div>
      {#if footer}
        <footer class="flex justify-end gap-2 border-t border-line px-5 py-3.5">{@render footer()}</footer>
      {/if}
    </div>
  </div>
{/if}
