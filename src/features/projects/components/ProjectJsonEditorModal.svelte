<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';
  import Modal from '@/shared/ui/Modal.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import type { ProjectForm } from '../project-form.svelte';

  interface Props {
    open: boolean;
    form: ProjectForm;
    onclose: () => void;
  }

  let { open, form, onclose }: Props = $props();

  let text = $state('');
  let error = $state<string | null>(null);

  // Refresh the editor from the form each time the modal opens.
  $effect(() => {
    if (open) {
      text = JSON.stringify(form.project, null, 2);
      error = null;
    }
  });

  function format() {
    try {
      error = null;
      text = JSON.stringify(JSON.parse(text.trim()), null, 2);
    } catch (err) {
      error = err instanceof Error ? `Cannot format: ${err.message}` : 'Invalid JSON';
    }
  }

  function apply() {
    error = form.applyJson(text);
    if (!error) onclose();
  }
</script>

<Modal {open} title="Raw project JSON" size="lg" {onclose}>
  <p class="mb-3 text-xs text-ink-3">
    Edit or paste the project as JSON. It is validated and applied to the form fields; nothing is saved until you save the
    project.
  </p>
  <div class="mb-3"><Button size="sm" onclick={format} disabled={!text.trim()}>Format</Button></div>
  {#if error}
    <p class="mb-3 flex items-start gap-2 rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
      <AlertCircle size={14} class="mt-0.5 shrink-0" /> {error}
    </p>
  {/if}
  <textarea class="{inputClass} h-96 resize-y font-mono text-xs" bind:value={text} spellcheck="false"></textarea>

  {#snippet footer()}
    <Button onclick={onclose}>Cancel</Button>
    <Button variant="primary" onclick={apply} disabled={!text.trim()}>Apply to form</Button>
  {/snippet}
</Modal>
