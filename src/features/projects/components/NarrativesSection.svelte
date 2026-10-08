<script lang="ts">
  import { AlignLeft, BookOpen, List, Plus, Trash2 } from '@lucide/svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Textarea from '@/shared/ui/Textarea.svelte';
  import ListEditor from '@/shared/ui/ListEditor.svelte';
  import type { ProjectForm } from '../project-form.svelte';

  let { form }: { form: ProjectForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const project = $derived(form.project);

  const sectionBtn = 'inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-ink-2 hover:border-line-strong hover:text-ink';
  const delBtn = 'rounded p-1.5 text-ink-3 hover:text-bad';
</script>

<Card>
  <ListEditor
    bind:items={project.narratives}
    title="Case study narratives & chapters"
    icon={BookOpen}
    addLabel="Add chapter"
    emptyText="No chapters yet. Add sections to tell the architecture story."
    itemLabel="Chapter #"
    create={() => ({ heading: '', paragraphs: [''], bullets: [] })}
  >
    {#snippet children(section)}
      <div class="flex flex-col gap-4">
        <Input label="Section heading" bind:value={section.heading} placeholder="e.g. Distributed telemetry pipeline" />

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-xs font-medium text-ink-2"><AlignLeft size={14} /> Paragraphs</span>
            <button type="button" class={sectionBtn} onclick={() => (section.paragraphs = [...section.paragraphs, ''])}>
              <Plus size={12} /> Paragraph
            </button>
          </div>
          {#each section.paragraphs as _, p (p)}
            <div class="flex items-start gap-2">
              <Textarea class="flex-1" rows={2} bind:value={section.paragraphs[p]} placeholder="Paragraph text…" aria-label="Paragraph {p + 1}" />
              <button
                type="button"
                class={delBtn}
                onclick={() => (section.paragraphs = section.paragraphs.filter((_, i) => i !== p))}
                aria-label="Remove paragraph"
              >
                <Trash2 size={14} />
              </button>
            </div>
          {/each}
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-xs font-medium text-ink-2"><List size={14} /> Bullet points (optional)</span>
            <button type="button" class={sectionBtn} onclick={() => (section.bullets = [...section.bullets, ''])}>
              <Plus size={12} /> Bullet
            </button>
          </div>
          {#each section.bullets as _, b (b)}
            <div class="flex items-center gap-2">
              <Input class="flex-1" bind:value={section.bullets[b]} placeholder="Bullet point…" aria-label="Bullet {b + 1}" />
              <button
                type="button"
                class={delBtn}
                onclick={() => (section.bullets = section.bullets.filter((_, i) => i !== b))}
                aria-label="Remove bullet"
              >
                <Trash2 size={14} />
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/snippet}
  </ListEditor>
</Card>
