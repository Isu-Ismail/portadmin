<script lang="ts">
  import { onMount } from 'svelte';
  import { Award, Briefcase, FolderKanban, Image as ImageIcon, UserCircle, Wrench } from '@lucide/svelte';
  import { aboutStore } from '@/features/about/about.store.svelte';
  import { projectsStore } from '@/features/projects/projects.store.svelte';
  import PageHeader from '@/shared/ui/PageHeader.svelte';
  import BackupPanel from './BackupPanel.svelte';

  onMount(() => {
    aboutStore.load().catch(console.error);
    projectsStore.load().catch(console.error);
  });

  const stats = $derived([
    { label: 'Projects', value: projectsStore.items.length, icon: FolderKanban },
    { label: 'Skills', value: aboutStore.data?.skills?.length ?? 0, icon: Wrench },
    { label: 'Experience', value: aboutStore.data?.experience?.length ?? 0, icon: Briefcase },
    { label: 'Certificates', value: aboutStore.data?.certificates?.length ?? 0, icon: Award }
  ]);

  const shortcuts = [
    { href: '#/about', title: 'About Me', desc: 'Bio, contact, resume, education, experience, certificates.', icon: UserCircle },
    { href: '#/projects', title: 'Projects', desc: 'Case studies, metrics, architecture, image galleries.', icon: FolderKanban },
    { href: '#/image-studio', title: 'Image Studio', desc: 'Resize and compress images to WebP / JPEG.', icon: ImageIcon }
  ];
</script>

<PageHeader title="Dashboard" description="Overview of your live portfolio data." />

<div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
  {#each stats as s (s.label)}
    <div class="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
      <s.icon size={20} class="text-orange" />
      <div>
        <div class="text-xl leading-none font-bold">{s.value}</div>
        <div class="mt-1 text-xs text-ink-3">{s.label}</div>
      </div>
    </div>
  {/each}
</div>

<div class="mb-6 grid gap-3 md:grid-cols-3">
  {#each shortcuts as s (s.href)}
    <a href={s.href} class="rounded-lg border border-line bg-surface p-4 hover:border-orange hover:bg-panel">
      <s.icon size={20} class="mb-3 text-crimson-hi" />
      <h3 class="text-sm font-semibold">{s.title}</h3>
      <p class="mt-1 text-xs text-ink-3">{s.desc}</p>
    </a>
  {/each}
</div>

<BackupPanel />
