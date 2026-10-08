<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Field from './Field.svelte';
  import { inputClass } from './styles';

  interface Props extends Omit<HTMLInputAttributes, 'class'> {
    class?: string;
    label?: string;
    error?: string;
    hint?: string;
  }

  let { label, error, hint, value = $bindable(''), class: cls = '', ...rest }: Props = $props();
</script>

<Field {label} {error} {hint} class={cls}>
  <input class="{inputClass} {error ? 'border-bad' : ''}" bind:value {...rest} />
</Field>
