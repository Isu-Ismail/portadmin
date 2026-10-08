<script lang="ts">
  let { size = 20, class: cls = '' }: { size?: number; class?: string } = $props();
</script>

<span
  class="inline-block animate-spin rounded-full border-2 border-line border-t-orange {cls}"
  style="width:{size}px;height:{size}px"
  role="status"
  aria-label="Loading"
></span>
