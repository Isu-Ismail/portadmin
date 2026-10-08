<script lang="ts">
  import { Check, Copy } from '@lucide/svelte';

  interface Props {
    text: string | (() => string);
    label?: string;
    doneLabel?: string;
    title?: string;
  }

  let { text, label = 'Copy', doneLabel = 'Copied', title }: Props = $props();
  let done = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
      done = true;
      setTimeout(() => (done = false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }
</script>

<button
  type="button"
  onclick={copy}
  {title}
  class="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-ink-2 hover:border-line-strong hover:text-ink"
>
  {#if done}<Check size={12} class="text-ok" /> {doneLabel}{:else}<Copy size={12} /> {label}{/if}
</button>
