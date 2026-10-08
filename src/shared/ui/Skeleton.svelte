<script lang="ts">
  let { class: cls = 'h-4 w-full' }: { class?: string } = $props();
</script>

<div class="animate-pulse rounded bg-panel {cls}" aria-hidden="true"></div>
