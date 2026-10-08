<script lang="ts">
  import { authState } from '@/core/firebase/auth.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import { toast } from '@/core/utils/toast.svelte';

  let email = $state('');
  let password = $state('');
  let submitting = $state(false);
  let error = $state('');

  async function submit(e: Event) {
    e.preventDefault();
    if (!email || !password) {
      error = 'Enter both email and password.';
      return;
    }
    submitting = true;
    error = '';
    try {
      await authState.login(email, password);
      toast.success('Signed in');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid credentials';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-4">
  <form onsubmit={submit} class="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
    <div class="mb-6 flex items-center gap-2.5">
      <img src="{import.meta.env.BASE_URL}logo.svg" alt="" class="h-8 w-8 rounded" />
      <h1 class="text-lg font-bold">Portfolio Admin</h1>
    </div>
    <p class="mb-5 text-sm text-ink-3">Sign in with your Firebase account to edit portfolio data.</p>

    {#if error}
      <p class="mb-4 rounded-md border border-bad/40 px-3 py-2 text-sm text-bad">{error}</p>
    {/if}

    <div class="flex flex-col gap-4">
      <Input label="Email" type="email" bind:value={email} autocomplete="email" placeholder="admin@example.com" required />
      <Input label="Password" type="password" bind:value={password} autocomplete="current-password" required />
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </div>
  </form>
</div>
