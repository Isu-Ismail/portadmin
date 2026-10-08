<script lang="ts">
  import Card from '@/shared/ui/Card.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import TagInput from '@/shared/ui/TagInput.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);
</script>

<Card title="Skills & interests">
  <div class="flex flex-col gap-5">
    <Field label="Technical skills">
      <TagInput bind:tags={data.skills} placeholder="Add skill (Docker, FastAPI…) and press Enter" />
    </Field>
    <Field label="Interests">
      <TagInput bind:tags={data.interests} placeholder="Add interest (3D Printing…) and press Enter" />
    </Field>
  </div>
</Card>
