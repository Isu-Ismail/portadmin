<script lang="ts">
  import { Cpu } from '@lucide/svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import TagInput from '@/shared/ui/TagInput.svelte';
  import ListEditor from '@/shared/ui/ListEditor.svelte';
  import type { AboutForm } from '../about-form.svelte';
  import type { SkillCardItem } from '@/core/types';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);
</script>

<Card title="Skill Cards & Interests" description="Manage skill category cards, titles, and individual skill tags.">
  <div class="flex flex-col gap-6">
    <ListEditor
      bind:items={data.skillCards}
      title="Skill Cards / Categories"
      description="Each card displays as a separate category box in your Technical Arsenal."
      icon={Cpu}
      addLabel="Add skill card"
      emptyText="No skill cards added yet. Click above to add your first card."
      itemLabel="Skill Card "
      create={() => ({ title: '', items: [] })}
    >
      {#snippet children(card)}
        <div class="flex flex-col gap-3">
          <Input
            label="Card Title / Category Name"
            placeholder="e.g. Systems & DevOps, Software & Protocols, CAD/CAE Engineering"
            bind:value={card.title}
          />
          <Field label="Skills in this card">
            <TagInput
              bind:tags={card.items}
              placeholder="Type skill (e.g. Docker, Python) and press Enter"
            />
          </Field>
        </div>
      {/snippet}
    </ListEditor>

    <div class="border-t border-line pt-5">
      <Field label="Personal Interests">
        <TagInput bind:tags={data.interests} placeholder="Add interest (3D Printing, Karting…) and press Enter" />
      </Field>
    </div>
  </div>
</Card>

