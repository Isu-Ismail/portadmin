<script lang="ts">
  import { CheckCircle2, AlertCircle, Info, X } from '@lucide/svelte';
  import { toast } from '@/core/utils/toast.svelte';

  const styles = {
    success: 'border-ok/50 text-ok',
    error: 'border-bad/50 text-bad',
    info: 'border-line-strong text-ink-2'
  };
</script>

<div class="fixed right-4 bottom-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
  {#each toast.toasts as t (t.id)}
    <div class="flex items-start gap-2.5 rounded-md border bg-panel px-3.5 py-3 text-sm {styles[t.type]}">
      {#if t.type === 'success'}<CheckCircle2 size={16} class="mt-0.5 shrink-0" />
      {:else if t.type === 'error'}<AlertCircle size={16} class="mt-0.5 shrink-0" />
      {:else}<Info size={16} class="mt-0.5 shrink-0" />{/if}
      <span class="min-w-0 flex-1 break-words text-ink">{t.message}</span>
      <button type="button" class="text-ink-3 hover:text-ink" onclick={() => toast.dismiss(t.id)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  {/each}
</div>
