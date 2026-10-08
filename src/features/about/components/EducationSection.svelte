<script lang="ts">
  import { GraduationCap } from '@lucide/svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Textarea from '@/shared/ui/Textarea.svelte';
  import ListEditor from '@/shared/ui/ListEditor.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);
</script>

<Card>
  <ListEditor
    bind:items={data.education}
    title="Education"
    icon={GraduationCap}
    addLabel="Add education"
    emptyText="No education entries yet."
    create={() => ({ degree: '', institution: '', period: '', description: '' })}
  >
    {#snippet children(item)}
      <div class="grid gap-3 md:grid-cols-3">
        <Input label="Degree / certification" placeholder="B.E. Production Engineering" bind:value={item.degree} />
        <Input label="Institution" placeholder="Madras Institute of Technology" bind:value={item.institution} />
        <Input label="Period" placeholder="Aug 2023 - 2027" bind:value={item.period} />
        <Textarea class="md:col-span-3" label="Description / score" rows={2} bind:value={item.description} />
      </div>
    {/snippet}
  </ListEditor>
</Card>
