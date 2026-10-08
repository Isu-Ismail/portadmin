<script lang="ts">
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let { open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onconfirm, oncancel }: Props =
    $props();
</script>

<Modal {open} {title} size="sm" onclose={oncancel}>
  <p class="text-sm text-ink-2">{message}</p>
  {#snippet footer()}
    <Button onclick={oncancel}>{cancelText}</Button>
    <Button variant={danger ? 'danger' : 'primary'} onclick={onconfirm}>{confirmText}</Button>
  {/snippet}
</Modal>
