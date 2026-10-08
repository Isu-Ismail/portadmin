<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
    children: Snippet;
  }

  let { variant = 'secondary', size = 'md', type = 'button', class: cls = '', children, ...rest }: Props = $props();

  const variants = {
    primary: 'bg-crimson text-white hover:bg-crimson-hi',
    secondary: 'border border-line bg-panel text-ink-2 hover:border-line-strong hover:text-ink',
    ghost: 'text-ink-2 hover:bg-panel hover:text-ink',
    danger: 'border border-bad/40 text-bad hover:bg-bad hover:text-white'
  };
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-3.5 py-2 text-sm' };
</script>

<button
  {type}
  class="inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 {variants[variant]} {sizes[size]} {cls}"
  {...rest}
>
  {@render children()}
</button>
