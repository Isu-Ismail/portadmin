<script lang="ts">
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Textarea from '@/shared/ui/Textarea.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);
</script>

<Card title="Identity & bio">
  <div class="grid gap-4 md:grid-cols-2">
    <Input
      label="Full name *"
      bind:value={data.name}
      error={form.errors['name']}
      oninput={() => form.clearError('name')}
      placeholder="e.g. A.M. Ismail"
    />
    <Input
      label="Headline / role *"
      bind:value={data.role}
      error={form.errors['role']}
      oninput={() => form.clearError('role')}
      placeholder="e.g. System Architect & Engineer"
    />
    <Textarea class="md:col-span-2" label="Hero tagline" rows={2} bind:value={data.hero_about} />
    <Textarea class="md:col-span-2" label="Full biography" rows={5} bind:value={data.about} />
  </div>
</Card>
