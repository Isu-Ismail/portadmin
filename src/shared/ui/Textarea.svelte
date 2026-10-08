<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import Field from './Field.svelte';
  import { inputClass } from './styles';

  interface Props extends Omit<HTMLTextareaAttributes, 'class'> {
    class?: string;
    label?: string;
    error?: string;
    hint?: string;
  }

  let { label, error, hint, value = $bindable(''), class: cls = '', rows = 4, ...rest }: Props = $props();
</script>

<Field {label} {error} {hint} class={cls}>
  <textarea class="{inputClass} resize-y {error ? 'border-bad' : ''}" {rows} bind:value {...rest}></textarea>
</Field>
