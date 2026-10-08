<script lang="ts">
  import { Star } from '@lucide/svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Textarea from '@/shared/ui/Textarea.svelte';
  import TagInput from '@/shared/ui/TagInput.svelte';
  import type { ProjectForm } from '../project-form.svelte';

  let { form }: { form: ProjectForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const project = $derived(form.project);
</script>

<Card title="Overview & card metadata">
  <div class="grid gap-4 md:grid-cols-2">
    <Input
      label="ID / URL slug *"
      bind:value={project.id}
      disabled={!form.isNew}
      placeholder="e.g. sri-energy-automation"
      error={form.errors['id']}
      hint={form.isNew
        ? 'Lowercase letters, numbers, hyphens and underscores only.'
        : 'Slug is locked to keep public links working.'}
      oninput={() => form.clearError('id')}
    />
    <Input
      label="Project title *"
      bind:value={project.title}
      placeholder="e.g. SRI Energy Automation"
      error={form.errors['title']}
      oninput={() => form.clearError('title')}
    />
    <Textarea
      class="md:col-span-2"
      label="Summary (shown on portfolio card)"
      rows={3}
      bind:value={project.description}
      placeholder="Concise overview of engineering value, architecture and results…"
    />
    <Field class="md:col-span-2" label="Tech stack tags" error={form.errors['tags']}>
      <TagInput bind:tags={project.tags} placeholder="Add tag (ESP32, Docker, React) and press Enter" />
    </Field>
    <Input
      label="Live / repo link"
      type="url"
      bind:value={project.link}
      placeholder="https://…"
      error={form.errors['link']}
      oninput={() => form.clearError('link')}
    />
    <div class="grid grid-cols-2 gap-4">
      <Input label="Status" bind:value={project.status} placeholder="Completed / In Progress" />
      <Input label="Duration" bind:value={project.duration} placeholder="Oct 2025 – Mar 2026" />
    </div>
    <Field label="Rating" error={form.errors['stars']}>
      <div class="flex gap-1">
        {#each [1, 2, 3, 4, 5] as n (n)}
          <button
            type="button"
            class="rounded p-1 hover:bg-panel {project.stars >= n ? 'text-warn' : 'text-ink-3'}"
            onclick={() => {
              project.stars = n;
              form.clearError('stars');
            }}
            aria-label="{n} star{n > 1 ? 's' : ''}"
          >
            <Star size={20} fill={project.stars >= n ? 'currentColor' : 'none'} />
          </button>
        {/each}
      </div>
    </Field>
  </div>
</Card>
