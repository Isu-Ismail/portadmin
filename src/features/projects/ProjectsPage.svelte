<script lang="ts">
  import { onMount } from 'svelte';
  import { FileCode, Layers, Plus, RotateCcw, Search } from '@lucide/svelte';
  import { deleteProject } from '@/core/firebase/firestore';
  import type { ProjectData } from '@/core/types';
  import { toast } from '@/core/utils/toast.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import ConfirmModal from '@/shared/ui/ConfirmModal.svelte';
  import PageHeader from '@/shared/ui/PageHeader.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import FirestoreInspectorModal from '@/features/inspector/FirestoreInspectorModal.svelte';
  import { projectsStore } from './projects.store.svelte';
  import ProjectCard from './components/ProjectCard.svelte';
  import ProjectCardSkeleton from './components/ProjectCardSkeleton.svelte';
  import ProjectJsonImportModal from './components/ProjectJsonImportModal.svelte';

  let query = $state('');
  let importOpen = $state(false);
  let toDelete = $state<ProjectData | null>(null);
  let inspected = $state<ProjectData | null>(null);

  onMount(() => {
    projectsStore.load().catch(() => toast.error('Could not load projects from Firestore.'));
  });

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projectsStore.items;
    return projectsStore.items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  async function confirmDelete() {
    const p = toDelete;
    if (!p) return;
    toDelete = null;
    try {
      await deleteProject(p.id);
      projectsStore.remove(p.id);
      toast.success(`Deleted "${p.title}"`);
    } catch (err) {
      toast.error(`Delete failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }
</script>

<PageHeader title="Projects" description="Project cards and full case-study pages.">
  {#snippet actions()}
    <Button onclick={() => (importOpen = true)}><FileCode size={15} /> From JSON</Button>
    <Button onclick={() => projectsStore.load(true)} disabled={projectsStore.loading}>
      <RotateCcw size={15} /> Refresh
    </Button>
    <a href="#/projects/new"><Button variant="primary"><Plus size={15} /> New project</Button></a>
  {/snippet}
</PageHeader>

<div class="mb-5 flex items-center gap-3">
  <div class="relative max-w-md flex-1">
    <Search size={15} class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
    <input class="{inputClass} pl-9" bind:value={query} placeholder="Search by title, description or tag" />
  </div>
  <span class="text-xs text-ink-3">{filtered.length} project{filtered.length === 1 ? '' : 's'}</span>
</div>

{#if projectsStore.loading && !projectsStore.loaded}
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading projects">
    {#each Array(6) as _, i (i)}<ProjectCardSkeleton />{/each}
  </div>
{:else if filtered.length === 0}
  <div class="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line py-20 text-center">
    <Layers size={34} class="text-ink-3" />
    <h3 class="text-sm font-semibold">No projects found</h3>
    <p class="text-xs text-ink-3">
      {query ? 'Try a different keyword.' : 'Create one, import JSON, or seed defaults from the dashboard.'}
    </p>
  </div>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each filtered as p (p.id)}
      <ProjectCard project={p} oninspect={() => (inspected = p)} ondelete={() => (toDelete = p)} />
    {/each}
  </div>
{/if}

<ConfirmModal
  open={!!toDelete}
  title={`Delete "${toDelete?.title ?? ''}"?`}
  message="This deletes the project document and removes it from your public portfolio. It cannot be undone."
  confirmText="Delete project"
  danger
  onconfirm={confirmDelete}
  oncancel={() => (toDelete = null)}
/>

<ProjectJsonImportModal
  open={importOpen}
  onclose={() => (importOpen = false)}
  onimported={() => projectsStore.load(true)}
/>

{#if inspected}
  <FirestoreInspectorModal
    open
    collectionName="projects"
    docId={inspected.id}
    documentData={inspected}
    onclose={() => (inspected = null)}
  />
{/if}
