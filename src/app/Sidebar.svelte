<script lang="ts">
  import { router } from 'svelte-spa-router';
  import { FolderKanban, Image as ImageIcon, LayoutDashboard, LogOut, UserCircle } from '@lucide/svelte';
  import { authState } from '@/core/firebase/auth.svelte';
  import { toast } from '@/core/utils/toast.svelte';

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/about', label: 'About Me', icon: UserCircle },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/image-studio', label: 'Image Studio', icon: ImageIcon }
  ];

  const isActive = (href: string) => (href === '/' ? router.location === '/' : router.location.startsWith(href));

  async function logout() {
    try {
      await authState.logout();
    } catch {
      toast.error('Sign out failed');
    }
  }
</script>

<aside class="flex h-full w-full flex-col border-r border-line bg-surface md:w-60">
  <div class="flex items-center gap-2.5 border-b border-line px-5 py-4">
    <img src="{import.meta.env.BASE_URL}logo.svg" alt="" class="h-7 w-7 rounded" />
    <span class="text-sm font-bold tracking-wide">Portfolio Admin</span>
  </div>

  <nav class="flex flex-1 flex-col gap-1 p-3">
    {#each links as item (item.href)}
      <a
        href="#{item.href}"
        class="flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-sm font-medium
          {isActive(item.href)
          ? 'border-orange bg-panel text-ink'
          : 'border-transparent text-ink-3 hover:bg-panel hover:text-ink'}"
      >
        <item.icon size={17} />
        {item.label}
      </a>
    {/each}
  </nav>

  <div class="border-t border-line p-3">
    <p class="truncate px-3 pb-2 text-xs text-ink-3" title={authState.user?.email ?? ''}>
      {authState.user?.email}
    </p>
    <button
      type="button"
      onclick={logout}
      class="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-3 hover:bg-panel hover:text-crimson-hi"
    >
      <LogOut size={17} />
      Sign out
    </button>
  </div>
</aside>
