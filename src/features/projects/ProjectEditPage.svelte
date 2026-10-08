<script lang="ts">
  import { untrack } from 'svelte';
  import { ArrowLeft, Database, FileCode, Save, Trash2 } from '@lucide/svelte';
  import { push, replace } from 'svelte-spa-router';
  import Button from '@/shared/ui/Button.svelte';
  import Card from '@/shared/ui/Card.svelte';
  import ConfirmModal from '@/shared/ui/ConfirmModal.svelte';
  import ErrorSummary from '@/shared/ui/ErrorSummary.svelte';
  import PageHeader from '@/shared/ui/PageHeader.svelte';
  import FormSkeleton from '@/shared/ui/FormSkeleton.svelte';
  import ImageUploader from '@/shared/image/ImageUploader.svelte';
  import FirestoreInspectorModal from '@/features/inspector/FirestoreInspectorModal.svelte';
  import { ProjectForm } from './project-form.svelte';
  import ProjectOverviewSection from './components/ProjectOverviewSection.svelte';
  import CaseStudySection from './components/CaseStudySection.svelte';
  import NarrativesSection from './components/NarrativesSection.svelte';
  import GalleryManager from './components/GalleryManager.svelte';
  import ProjectJsonEditorModal from './components/ProjectJsonEditorModal.svelte';

  let { params }: { params?: { id?: string } } = $props();

  const form = new ProjectForm();
  let deleteOpen = $state(false);
  let jsonOpen = $state(false);
  let inspectorOpen = $state(false);

  // Load whenever the route id changes (skip the id we just saved).
  $effect(() => {
    const id = params?.id;
    if (!id) return;
    untrack(() => {
      if (!form.isNew && form.project.id === id) return;
      form.load(id).then((ok) => {
        if (!ok) replace('/projects');
      });
    });
  });

  async function save() {
    const wasNew = form.isNew;
    const saved = await form.save();
    if (saved && wasNew) replace(`/projects/${saved.id}`);
  }

  async function confirmDelete() {
    deleteOpen = false;
    if (await form.remove()) push('/projects');
  }
</script>

<a href="#/projects" class="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink">
  <ArrowLeft size={14} /> Back to projects
</a>

<PageHeader
  title={form.isNew ? 'New project' : `Edit: ${form.project.title || form.project.id}`}
  description="Project showcase card and detailed case-study page."
>
  {#snippet actions()}
    <Button size="sm" onclick={() => (inspectorOpen = true)}><Database size={14} /> Fields</Button>
    <Button size="sm" onclick={() => (jsonOpen = true)}><FileCode size={14} /> JSON</Button>
    {#if !form.isNew}
      <Button size="sm" variant="danger" onclick={() => (deleteOpen = true)}><Trash2 size={14} /> Delete</Button>
    {/if}
    <Button variant="primary" onclick={save} disabled={form.saving || form.loading}>
      <Save size={15} /> {form.saving ? 'Saving…' : 'Save project'}
    </Button>
  {/snippet}
</PageHeader>

{#if form.loading}
  <FormSkeleton cards={4} />
{:else}
  <ErrorSummary errors={form.errors} />
  <div class="flex flex-col gap-5 pb-24">
    <ProjectOverviewSection {form} />
    <CaseStudySection {form} />
    <NarrativesSection {form} />
    <GalleryManager projectId={form.project.id} bind:images={form.project.images} />
    <Card title="Verified credential / certificate">
      <ImageUploader
        bind:value={form.project.certificate}
        label="Certificate image (optional)"
        description="Shown as a verified badge on the project case study"
        uploadHandler={form.uploadCertificate}
      />
    </Card>
  </div>

  <div class="fixed right-0 bottom-0 left-0 z-30 border-t border-line bg-surface px-4 py-3 md:left-60">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 md:px-4">
      <p class="hidden text-xs text-ink-3 sm:block">Save before leaving this page.</p>
      <Button variant="primary" class="ml-auto" onclick={save} disabled={form.saving}>
        <Save size={15} /> {form.saving ? 'Saving…' : 'Save project'}
      </Button>
    </div>
  </div>
{/if}

<ConfirmModal
  open={deleteOpen}
  title="Delete this project?"
  message={`Permanently delete "${form.project.title}" (${form.project.id})? This cannot be undone.`}
  confirmText="Delete project"
  danger
  onconfirm={confirmDelete}
  oncancel={() => (deleteOpen = false)}
/>

<ProjectJsonEditorModal open={jsonOpen} {form} onclose={() => (jsonOpen = false)} />

<FirestoreInspectorModal
  open={inspectorOpen}
  collectionName="projects"
  docId={form.project.id || 'new-project'}
  documentData={form.project}
  onclose={() => (inspectorOpen = false)}
/>
