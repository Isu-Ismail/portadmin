<script lang="ts">
  import { X } from '@lucide/svelte';
  import { inputClass } from './styles';

  interface Props {
    tags: string[];
    placeholder?: string;
  }

  let { tags = $bindable([]), placeholder = 'Type and press Enter' }: Props = $props();
  let draft = $state('');

  function add() {
    const v = draft.trim();
    if (v && !tags.includes(v)) tags = [...tags, v];
    draft = '';
  }

  function remove(i: number) {
    tags = tags.filter((_, idx) => idx !== i);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      remove(tags.length - 1);
    }
  }
</script>

<div class="flex flex-col gap-2">
  <input class={inputClass} bind:value={draft} {onkeydown} onblur={add} {placeholder} />
  {#if tags.length}
    <div class="flex flex-wrap gap-1.5">
      {#each tags as tag, i (tag + i)}
        <span class="inline-flex items-center gap-1 rounded border border-line bg-panel py-0.5 pr-1 pl-2 text-xs text-ink-2">
          {tag}
          <button type="button" class="rounded p-0.5 text-ink-3 hover:text-crimson-hi" onclick={() => remove(i)} aria-label="Remove {tag}">
            <X size={12} />
          </button>
        </span>
      {/each}
    </div>
  {/if}
</div>
