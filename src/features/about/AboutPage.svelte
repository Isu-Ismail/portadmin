<script lang="ts">
  import { onMount } from 'svelte';
  import { Database, RotateCcw, Save, Sparkles } from '@lucide/svelte';
  import Button from '@/shared/ui/Button.svelte';
  import ErrorSummary from '@/shared/ui/ErrorSummary.svelte';
  import PageHeader from '@/shared/ui/PageHeader.svelte';
  import FormSkeleton from '@/shared/ui/FormSkeleton.svelte';
  import FirestoreInspectorModal from '@/features/inspector/FirestoreInspectorModal.svelte';
  import { AboutForm } from './about-form.svelte';
  import IdentitySection from './components/IdentitySection.svelte';
  import StatsSection from './components/StatsSection.svelte';
  import ProfileSection from './components/ProfileSection.svelte';
  import ContactSection from './components/ContactSection.svelte';
  import SkillsSection from './components/SkillsSection.svelte';
  import EducationSection from './components/EducationSection.svelte';
  import ExperienceSection from './components/ExperienceSection.svelte';
  import CertificatesSection from './components/CertificatesSection.svelte';

  const form = new AboutForm();
  let inspectorOpen = $state(false);

  onMount(() => void form.load());
</script>

<PageHeader title="About Me" description="Edits the Firestore document about/main.">
  {#snippet actions()}
    <Button size="sm" onclick={() => (inspectorOpen = true)}><Database size={14} /> Fields</Button>
    <Button size="sm" onclick={() => form.load()} disabled={form.loading || form.saving}>
      <RotateCcw size={14} /> Reload
    </Button>
    <Button size="sm" variant="ghost" onclick={() => form.resetToDefaults()}><Sparkles size={14} /> Defaults</Button>
    <Button variant="primary" onclick={() => form.save()} disabled={form.saving || form.loading}>
      <Save size={15} /> {form.saving ? 'Saving…' : 'Save & publish'}
    </Button>
  {/snippet}
</PageHeader>

{#if form.loading}
  <FormSkeleton cards={5} />
{:else}
  <ErrorSummary errors={form.errors} />
  <div class="flex flex-col gap-5 pb-24">
    <IdentitySection {form} />
    <StatsSection {form} />
    <ProfileSection {form} />
    <SkillsSection {form} />
    <ContactSection {form} />
    <EducationSection {form} />
    <ExperienceSection {form} />
    <CertificatesSection {form} />
  </div>

  <div class="fixed right-0 bottom-0 left-0 z-30 border-t border-line bg-surface px-4 py-3 md:left-60">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 md:px-4">
      <p class="hidden text-xs text-ink-3 sm:block">Changes are only written when you save.</p>
      <Button variant="primary" class="ml-auto" onclick={() => form.save()} disabled={form.saving}>
        <Save size={15} /> {form.saving ? 'Publishing…' : 'Save & publish'}
      </Button>
    </div>
  </div>
{/if}

<FirestoreInspectorModal
  open={inspectorOpen}
  collectionName="about"
  docId="main"
  documentData={form.data}
  onclose={() => (inspectorOpen = false)}
/>
