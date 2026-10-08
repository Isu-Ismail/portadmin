<script lang="ts">
  import Button from '@/shared/ui/Button.svelte';
</script>

<div class="flex flex-col items-center gap-3 py-24 text-center">
  <h1 class="text-xl font-bold">Page not found</h1>
  <p class="text-ink-3">That route does not exist.</p>
  <a href="#/"><Button variant="primary">Back to dashboard</Button></a>
</div>
