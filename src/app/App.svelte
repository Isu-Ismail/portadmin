<script lang="ts">
  import Router from 'svelte-spa-router';
  import { Menu } from '@lucide/svelte';
  import { authState } from '@/core/firebase/auth.svelte';
  import LoginPage from '@/features/auth/LoginPage.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import Toasts from '@/shared/ui/Toasts.svelte';
  import Sidebar from './Sidebar.svelte';
  import { routes } from './routes';

  let menuOpen = $state(false);
</script>

{#if !authState.user && !authState.isKnownUser}
  {#if authState.loading}
    <div class="flex min-h-screen items-center justify-center"><Spinner size={28} /></div>
  {:else}
    <LoginPage />
  {/if}
{:else if !authState.user && !authState.loading}
  <LoginPage />
{:else}
  <div class="min-h-screen md:flex">
    <!-- Desktop sidebar -->
    <div class="sticky top-0 hidden h-screen shrink-0 md:block">
      <Sidebar />
    </div>

    <!-- Mobile top bar + drawer -->
    <header class="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
      <span class="flex items-center gap-2 text-sm font-bold">
        <img src="{import.meta.env.BASE_URL}logo.svg" alt="" class="h-6 w-6 rounded" />
        Portfolio Admin
      </span>
      <button type="button" class="p-1 text-ink-2" onclick={() => (menuOpen = !menuOpen)} aria-label="Menu">
        <Menu size={20} />
      </button>
    </header>
    {#if menuOpen}
      <div class="border-b border-line md:hidden" onclick={() => (menuOpen = false)} role="presentation">
        <Sidebar />
      </div>
    {/if}

    <main class="min-w-0 flex-1 px-4 py-6 md:px-8">
      <div class="mx-auto max-w-5xl">
        <Router {routes} />
      </div>
    </main>
  </div>
{/if}

<Toasts />
