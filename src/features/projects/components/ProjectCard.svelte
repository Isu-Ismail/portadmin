<script lang="ts">
  import { Database, ExternalLink, Pencil, Star, Trash2 } from '@lucide/svelte';
  import type { ProjectData } from '@/core/types';
  import Button from '@/shared/ui/Button.svelte';

  interface Props {
    project: ProjectData;
    oninspect: () => void;
    ondelete: () => void;
  }

  let { project: p, oninspect, ondelete }: Props = $props();
  const tags = $derived(p.tags ?? []);
</script>

<article class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 hover:border-line-strong">
  <div class="flex items-center justify-between">
    <span
      class="rounded border px-2 py-0.5 text-[11px] font-medium {p.status === 'Completed'
        ? 'border-ok/40 text-ok'
        : 'border-orange/40 text-orange'}"
    >
      {p.status || 'Active'}
    </span>
    <span class="flex gap-0.5 text-warn">
      {#each Array(p.stars || 5) as _, i (i)}<Star size={12} fill="currentColor" />{/each}
    </span>
  </div>

  <div class="min-w-0 flex-1">
    <h3 class="truncate text-sm font-semibold">{p.title}</h3>
    <code class="text-[11px] text-ink-3">{p.id}</code>
    <p class="mt-2 line-clamp-3 text-xs text-ink-2">{p.description}</p>
  </div>

  {#if tags.length}
    <div class="flex flex-wrap gap-1.5">
      {#each tags.slice(0, 5) as tag (tag)}
        <span class="rounded border border-line bg-panel px-1.5 py-0.5 text-[11px] text-ink-2">{tag}</span>
      {/each}
      {#if tags.length > 5}<span class="px-1 py-0.5 text-[11px] text-ink-3">+{tags.length - 5}</span>{/if}
    </div>
  {/if}

  <div class="flex items-center justify-between border-t border-line pt-3">
    {#if p.link}
      <a href={p.link} target="_blank" rel="noreferrer" class="flex items-center gap-1 text-xs text-ink-3 hover:text-orange">
        <ExternalLink size={13} /> Live
      </a>
    {:else}<span></span>{/if}
    <div class="flex items-center gap-1.5">
      <Button size="sm" onclick={oninspect} title="Inspect Firestore fields"><Database size={13} /></Button>
      <a href="#/projects/{p.id}"><Button size="sm"><Pencil size={13} /> Edit</Button></a>
      <Button size="sm" variant="danger" onclick={ondelete} title="Delete project" aria-label="Delete project">
        <Trash2 size={13} />
      </Button>
    </div>
  </div>
</article>
