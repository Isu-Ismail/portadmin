<script lang="ts">
  import { AlertCircle, Sparkles } from '@lucide/svelte';
  import type { ProjectData } from '@/core/types';
  import { toast } from '@/core/utils/toast.svelte';
  import Modal from '@/shared/ui/Modal.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import { importProjectsFromJson, SAMPLE_PROJECT_JSON } from '../project-import';

  interface Props {
    open: boolean;
    onclose: () => void;
    onimported: (projects: ProjectData[]) => void;
  }

  let { open, onclose, onimported }: Props = $props();

  let text = $state('');
  let error = $state<string | null>(null);
  let busy = $state(false);

  function format() {
    try {
      error = null;
      text = JSON.stringify(JSON.parse(text.trim()), null, 2);
    } catch (err) {
      error = err instanceof Error ? `Cannot format: ${err.message}` : 'Invalid JSON';
    }
  }

  async function submit() {
    error = null;
    if (!text.trim()) {
      error = 'Paste a valid JSON string first.';
      return;
    }
    busy = true;
    try {
      const saved = await importProjectsFromJson(text);
      toast.success(`Saved ${saved.length} project${saved.length > 1 ? 's' : ''}`);
      onimported(saved);
      text = '';
      onclose();
    } catch (err) {
      error =
        err instanceof SyntaxError
          ? `JSON syntax error: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Failed to parse and save JSON.';
    } finally {
      busy = false;
    }
  }
</script>

<Modal {open} title="Create / import projects from JSON" size="lg" {onclose}>
  <p class="mb-3 text-xs text-ink-3">
    Paste one project object or an array. Fields are validated, IDs are generated from the title when missing, and each
    project is saved to Firestore.
  </p>
  <div class="mb-3 flex gap-2">
    <Button size="sm" onclick={() => ((text = SAMPLE_PROJECT_JSON), (error = null))}>
      <Sparkles size={14} /> Load sample
    </Button>
    <Button size="sm" onclick={format} disabled={!text.trim()}>Format</Button>
  </div>
  {#if error}
    <p class="mb-3 flex items-start gap-2 rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
      <AlertCircle size={14} class="mt-0.5 shrink-0" /> {error}
    </p>
  {/if}
  <textarea
    class="{inputClass} h-80 resize-y font-mono text-xs"
    bind:value={text}
    spellcheck="false"
    placeholder={'{\n  "title": "My Project",\n  "tags": ["FastAPI"]\n}'}
  ></textarea>

  {#snippet footer()}
    <Button onclick={onclose} disabled={busy}>Cancel</Button>
    <Button variant="primary" onclick={submit} disabled={busy || !text.trim()}>
      {busy ? 'Saving…' : 'Validate & create'}
    </Button>
  {/snippet}
</Modal>
