<script lang="ts">
  import { Download, Sparkles, UploadCloud } from '@lucide/svelte';
  import { saveAboutMe, saveProject } from '@/core/firebase/firestore';
  import { defaultAboutData, defaultProjects } from '@/core/defaultData';
  import { toast } from '@/core/utils/toast.svelte';
  import { downloadBlob } from '@/core/utils/image';
  import { aboutStore } from '@/features/about/about.store.svelte';
  import { projectsStore } from '@/features/projects/projects.store.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Card from '@/shared/ui/Card.svelte';
  import ConfirmModal from '@/shared/ui/ConfirmModal.svelte';

  let busy = $state(false);
  let confirmSeed = $state(false);

  async function refresh() {
    await Promise.all([aboutStore.load(true), projectsStore.load(true)]);
  }

  async function seed() {
    confirmSeed = false;
    busy = true;
    try {
      await saveAboutMe(defaultAboutData);
      await Promise.all(defaultProjects.map((p) => saveProject(p.id, p)));
      await refresh();
      toast.success('Default portfolio data written to Firestore');
    } catch (err) {
      toast.error(`Seed failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      busy = false;
    }
  }

  function exportBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      about: aboutStore.data ?? defaultAboutData,
      projects: projectsStore.items.length ? projectsStore.items : defaultProjects
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`);
    toast.success('Backup exported');
  }

  async function importBackup(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    busy = true;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.about) await saveAboutMe(parsed.about);
      if (Array.isArray(parsed.projects)) {
        for (const p of parsed.projects) if (p.id) await saveProject(p.id, p);
      }
      await refresh();
      toast.success('Backup imported');
    } catch (err) {
      toast.error(`Import failed: ${err instanceof Error ? err.message : 'invalid JSON'}`);
    } finally {
      busy = false;
      input.value = '';
    }
  }
</script>

<Card title="Backup &amp; seed" description="Export Firestore data as JSON, restore it, or write the default portfolio.">
  <div class="flex flex-wrap gap-2">
    <Button size="sm" onclick={exportBackup} disabled={busy}><Download size={14} /> Export JSON</Button>
    <label
      class="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink {busy
        ? 'pointer-events-none opacity-50'
        : 'cursor-pointer'}"
    >
      <UploadCloud size={14} /> Import JSON
      <input type="file" accept=".json,application/json" class="hidden" onchange={importBackup} />
    </label>
    <Button size="sm" variant="primary" onclick={() => (confirmSeed = true)} disabled={busy}>
      <Sparkles size={14} /> Seed defaults
    </Button>
  </div>
</Card>

<ConfirmModal
  open={confirmSeed}
  title="Seed default portfolio data?"
  message="Writes the default About Me and projects to Firestore, overwriting documents with matching IDs."
  confirmText="Seed Firestore"
  onconfirm={seed}
  oncancel={() => (confirmSeed = false)}
/>
