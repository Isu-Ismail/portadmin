<script lang="ts">
  import { LayoutGrid } from '@lucide/svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import ListEditor from '@/shared/ui/ListEditor.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);
</script>

<Card>
  <ListEditor
    bind:items={data.stats}
    title="Stat cards"
    description="Highlights shown under your bio."
    icon={LayoutGrid}
    addLabel="Add card"
    emptyText="No stat cards yet."
    itemLabel="Card #"
    create={() => ({ value: '', label: '' })}
  >
    {#snippet children(item)}
      <div class="grid gap-3 md:grid-cols-2">
        <Input label="Value" placeholder="e.g. 11+" bind:value={item.value} />
        <Input label="Label" placeholder="e.g. Projects Completed" bind:value={item.label} />
      </div>
    {/snippet}
  </ListEditor>

  {#if data.stats.length}
    <div class="mt-4 grid gap-2" style="grid-template-columns: repeat({Math.min(data.stats.length, 4)}, minmax(0, 1fr))">
      {#each data.stats as s, i (i)}
        <div class="rounded-md border border-line bg-bg p-3 text-center">
          <div class="text-lg font-bold text-orange">{s.value || '—'}</div>
          <div class="text-[10px] tracking-wider text-ink-3 uppercase">{s.label || 'label'}</div>
        </div>
      {/each}
    </div>
  {/if}
</Card>
