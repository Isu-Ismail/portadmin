<script lang="ts" generics="T">
  import type { Component, Snippet } from 'svelte';
  import { ArrowDown, ArrowUp, Plus, Trash2 } from '@lucide/svelte';
  import Button from './Button.svelte';

  interface Props {
    items: T[];
    title: string;
    description?: string;
    icon?: Component<{ size?: number; class?: string }>;
    addLabel: string;
    emptyText: string;
    create: () => T;
    /** compact = single-line rows, no reorder chrome */
    compact?: boolean;
    itemLabel?: string;
    onremove?: (item: T, index: number) => void;
    children: Snippet<[item: T, index: number]>;
  }

  let {
    items = $bindable([]),
    title,
    description,
    icon: Icon,
    addLabel,
    emptyText,
    create,
    compact = false,
    itemLabel = '#',
    onremove,
    children
  }: Props = $props();

  function add() {
    items = [...items, create()];
  }

  function remove(i: number) {
    onremove?.(items[i], i);
    items = items.filter((_, idx) => idx !== i);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    items = copy;
  }

  const iconBtn = 'rounded p-1.5 text-ink-3 hover:bg-panel hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-2.5">
      {#if Icon}<Icon size={17} class="text-orange" />{/if}
      <div>
        <h3 class="text-sm font-semibold">{title}</h3>
        {#if description}<p class="text-xs text-ink-3">{description}</p>{/if}
      </div>
    </div>
    <Button size="sm" variant="primary" onclick={add}><Plus size={14} /> {addLabel}</Button>
  </div>

  {#if items.length === 0}
    <p class="rounded-md border border-dashed border-line px-4 py-6 text-center text-xs text-ink-3">{emptyText}</p>
  {:else}
    <div class="flex flex-col gap-3">
      {#each items as item, i (i)}
        {#if compact}
          <div class="flex items-start gap-2">
            <div class="min-w-0 flex-1">{@render children(item, i)}</div>
            <button type="button" class={iconBtn + ' hover:text-bad'} onclick={() => remove(i)} title="Delete" aria-label="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        {:else}
          <div class="rounded-md border border-line bg-bg">
            <div class="flex items-center justify-between border-b border-line px-3 py-1.5">
              <span class="text-xs font-semibold text-ink-3">{itemLabel}{i + 1}</span>
              <div class="flex">
                <button type="button" class={iconBtn} disabled={i === 0} onclick={() => move(i, -1)} title="Move up" aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  class={iconBtn}
                  disabled={i === items.length - 1}
                  onclick={() => move(i, 1)}
                  title="Move down"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button type="button" class={iconBtn + ' hover:text-bad'} onclick={() => remove(i)} title="Delete" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div class="p-3">{@render children(item, i)}</div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
