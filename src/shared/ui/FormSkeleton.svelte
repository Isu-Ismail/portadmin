<script lang="ts">
  import Skeleton from './Skeleton.svelte';

  let { cards = 4 }: { cards?: number } = $props();
</script>

<div class="flex flex-col gap-5" role="status" aria-label="Loading">
  {#each Array(cards) as _, i (i)}
    <div class="rounded-lg border border-line bg-surface">
      <div class="border-b border-line px-5 py-3.5"><Skeleton class="h-4 w-40" /></div>
      <div class="grid gap-4 p-5 md:grid-cols-2">
        <div class="flex flex-col gap-2"><Skeleton class="h-3 w-24" /><Skeleton class="h-9 w-full" /></div>
        <div class="flex flex-col gap-2"><Skeleton class="h-3 w-28" /><Skeleton class="h-9 w-full" /></div>
        <div class="flex flex-col gap-2 md:col-span-2"><Skeleton class="h-3 w-32" /><Skeleton class="h-20 w-full" /></div>
      </div>
    </div>
  {/each}
</div>
