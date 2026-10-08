<script lang="ts">
  import Skeleton from '@/shared/ui/Skeleton.svelte';
</script>

<div class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4" aria-hidden="true">
  <div class="flex justify-between"><Skeleton class="h-5 w-20" /><Skeleton class="h-4 w-16" /></div>
  <Skeleton class="h-4 w-3/5" />
  <Skeleton class="h-3 w-1/4" />
  <Skeleton class="h-3 w-full" />
  <Skeleton class="h-3 w-4/5" />
  <div class="flex gap-1.5"><Skeleton class="h-5 w-14" /><Skeleton class="h-5 w-16" /><Skeleton class="h-5 w-12" /></div>
  <div class="flex justify-between border-t border-line pt-3"><Skeleton class="h-6 w-12" /><Skeleton class="h-7 w-28" /></div>
</div>
