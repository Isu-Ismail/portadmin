<script lang="ts">
  import { Code2, FileJson, Search, Table } from '@lucide/svelte';
  import Modal from '@/shared/ui/Modal.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import CopyButton from '@/shared/ui/CopyButton.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import FieldRow from './FieldRow.svelte';
  import { fetchSnippet } from './inspector';

  interface Props {
    open: boolean;
    collectionName: string;
    docId: string;
    documentData: object;
    onclose: () => void;
  }

  let { open, collectionName, docId, documentData, onclose }: Props = $props();

  type Tab = 'fields' | 'json' | 'code';
  let tab = $state<Tab>('fields');
  let query = $state('');

  const tabs = [
    { id: 'fields', label: 'Fields', icon: Table },
    { id: 'json', label: 'Raw JSON', icon: FileJson },
    { id: 'code', label: 'Fetch snippet', icon: Code2 }
  ] as const;

  const entries = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const all: [string, unknown][] = Object.entries(documentData ?? {});
    return all.filter(
      ([k, v]) =>!q || k.toLowerCase().includes(q) || JSON.stringify(v).toLowerCase().includes(q)
    );
  });

  const json = $derived(JSON.stringify(documentData, null, 2));
  const snippet = $derived(fetchSnippet(collectionName, docId));
</script>

<Modal {open} title="Firestore document: {collectionName}/{docId}" size="lg" {onclose}>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div class="flex gap-1">
      {#each tabs as t (t.id)}
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium {tab === t.id
            ? 'bg-panel text-orange'
            : 'text-ink-3 hover:bg-panel hover:text-ink'}"
          onclick={() => (tab = t.id)}
        >
          <t.icon size={14} />
          {t.label}
        </button>
      {/each}
    </div>

    {#if tab === 'fields'}
      <div class="relative w-56">
        <Search size={14} class="absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-3" />
        <input class="{inputClass} py-1.5 pl-8 text-xs" bind:value={query} placeholder="Filter fields or values" />
      </div>
    {:else if tab === 'json'}
      <CopyButton text={json} label="Copy JSON" />
    {:else}
      <CopyButton text={snippet} label="Copy snippet" />
    {/if}
  </div>

  {#if tab === 'fields'}
    <div class="flex flex-col gap-2">
      {#each entries as [key, val] (key)}
        <FieldRow name={key} value={val} />
      {:else}
        <p class="py-8 text-center text-xs text-ink-3">No fields match "{query}".</p>
      {/each}
    </div>
  {:else if tab === 'json'}
    <pre class="max-h-[55vh] overflow-auto rounded-md border border-line bg-bg p-3 font-mono text-[11px] text-ink-2">{json}</pre>
  {:else}
    <pre class="max-h-[55vh] overflow-auto rounded-md border border-line bg-bg p-3 font-mono text-[11px] text-ink-2">{snippet}</pre>
  {/if}

  {#snippet footer()}
    <Button onclick={onclose}>Close</Button>
  {/snippet}
</Modal>
