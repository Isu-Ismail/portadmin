<script lang="ts">
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);

  const fields = [
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
    { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 …' },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Chennai, India' },
    { key: 'github', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/…' },
    { key: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/…' },
    { key: 'instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/…' }
  ] as const;
</script>

<Card title="Contact & social links">
  <div class="grid gap-4 md:grid-cols-3">
    {#each fields as f (f.key)}
      <Input
        label={f.label}
        type={f.type}
        placeholder={f.placeholder}
        bind:value={data.contact[f.key]}
        error={form.errors[`contact.${f.key}`]}
        oninput={() => form.clearError(`contact.${f.key}`)}
      />
    {/each}
  </div>
</Card>
