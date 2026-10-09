<script lang="ts">
  import { Check, ExternalLink, FileText, ImageIcon, Sparkles, Trash2, Upload } from '@lucide/svelte';
  import { processImage } from '@/core/utils/image';
  import { randomUid, uploadResumePair } from '@/core/firebase/storage';
  import { toast } from '@/core/utils/toast.svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Button from '@/shared/ui/Button.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  const data = $derived(form.data);

  let title = $state('');
  let pdfFile = $state<File | null>(null);
  let imageFile = $state<File | null>(null);
  let imagePreviewUrl = $state<string | null>(null);
  let uploading = $state(false);

  function onPdfChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    pdfFile = input.files?.[0] || null;
  }

  function onImageChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0] || null;
    imageFile = file;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    imagePreviewUrl = file ? URL.createObjectURL(file) : null;
  }

  async function handleUploadPair() {
    if (!pdfFile || !imageFile) {
      toast.error('Please select both a PDF file and a Preview image.');
      return;
    }
    uploading = true;
    try {
      const uid = randomUid(8);
      // 1. Compress image to WebP
      const processed = await processImage(imageFile, {
        format: 'image/webp',
        quality: 0.85,
        maxWidth: 1600,
        maintainAspectRatio: true
      });

      // 2. Upload both files with matching UID
      const { pdfUrl, imageUrl } = await uploadResumePair(uid, pdfFile, processed.blob);

      // 3. Add to resumes and make active
      form.addResumeVersion({
        id: uid,
        name: title.trim() || `Resume ${new Date().toLocaleDateString('default', { month: 'short', year: 'numeric' })}`,
        pdfUrl,
        imageUrl,
        uploadedAt: new Date().toISOString(),
        isActive: true
      });

      // Reset form
      title = '';
      pdfFile = null;
      imageFile = null;
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        imagePreviewUrl = null;
      }
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      uploading = false;
    }
  }

  function formatDate(iso: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  }
</script>

<Card title="Resume Versions (Paired PDF & Preview Image)">
  <p class="text-xs text-ink-3 -mt-2 mb-4">
    Upload a resume PDF and its preview image together as a pair. Both files share a matching UID. Select which version is active on your live portfolio.
  </p>

  <!-- Upload New Resume Pair Box -->
  <div class="rounded-xl border border-line bg-panel p-4 mb-6">
    <h4 class="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
      <Sparkles size={15} class="text-primary" /> Upload New Resume Pair
    </h4>

    <div class="grid gap-4 sm:grid-cols-3 mb-4">
      <div class="sm:col-span-3">
        <Input
          label="Version Title / Label"
          placeholder="e.g. Production Engineer v4 — Oct 2026"
          bind:value={title}
        />
      </div>

      <!-- PDF Picker -->
      <Field label="1. Resume PDF (.pdf)">
        <label
          class="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors {pdfFile ? 'border-primary bg-primary/5 text-ink' : 'border-line hover:border-line-strong text-ink-3 hover:text-ink'}"
        >
          <FileText size={22} class={pdfFile ? 'text-primary' : 'text-ink-3'} />
          <span class="text-xs font-medium truncate max-w-[180px]">
            {pdfFile ? pdfFile.name : 'Choose PDF file'}
          </span>
          {#if pdfFile}
            <span class="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
              <Check size={12} /> Ready
            </span>
          {/if}
          <input type="file" accept="application/pdf" class="hidden" onchange={onPdfChange} />
        </label>
      </Field>

      <!-- Image Picker -->
      <Field label="2. Preview Image (.png, .webp, .jpg)">
        <label
          class="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors {imageFile ? 'border-primary bg-primary/5 text-ink' : 'border-line hover:border-line-strong text-ink-3 hover:text-ink'}"
        >
          {#if imagePreviewUrl}
            <img src={imagePreviewUrl} alt="Preview" class="h-10 w-8 object-cover rounded shadow border border-line" />
          {:else}
            <ImageIcon size={22} class="text-ink-3" />
          {/if}
          <span class="text-xs font-medium truncate max-w-[180px]">
            {imageFile ? imageFile.name : 'Choose image (auto-compressed)'}
          </span>
          {#if imageFile}
            <span class="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
              <Check size={12} /> Ready
            </span>
          {/if}
          <input type="file" accept="image/*" class="hidden" onchange={onImageChange} />
        </label>
      </Field>

      <!-- Submit Action -->
      <div class="flex flex-col justify-end">
        <Button
          variant="primary"
          class="w-full h-11"
          disabled={!pdfFile || !imageFile || uploading}
          onclick={handleUploadPair}
        >
          {#if uploading}
            <Spinner size={14} /> Compressing & Uploading…
          {:else}
            <Upload size={14} /> Upload & Activate Pair
          {/if}
        </Button>
      </div>
    </div>
  </div>

  <!-- List of Resume Versions -->
  <h4 class="text-sm font-semibold text-ink mb-3">Available Versions</h4>

  {#if !data.resumes || data.resumes.length === 0}
    <div class="rounded-lg border border-line/60 bg-surface/50 p-6 text-center text-xs text-ink-3">
      No resume versions uploaded yet. Upload your first pair above.
    </div>
  {:else}
    <div class="flex flex-col gap-3">
      {#each data.resumes as resume (resume.id)}
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-3.5 transition-all {resume.isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-line bg-panel hover:border-line-strong'}"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Thumbnail Image -->
            <div class="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md border border-line bg-surface shadow-xs">
              {#if resume.imageUrl}
                <img src={resume.imageUrl} alt={resume.name} class="h-full w-full object-cover" />
              {:else}
                <div class="flex h-full w-full items-center justify-center text-ink-3">
                  <FileText size={16} />
                </div>
              {/if}
            </div>

            <!-- Details -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-sm text-ink truncate">{resume.name || 'Untitled Resume'}</span>
                {#if resume.isActive}
                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Active
                  </span>
                {/if}
              </div>
              <p class="text-[11px] text-ink-3 mt-0.5">
                {formatDate(resume.uploadedAt)}
              </p>
              <div class="flex items-center gap-3 mt-1.5 text-xs">
                {#if resume.pdfUrl}
                  <a
                    href={resume.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-ink-2 hover:text-primary transition-colors"
                  >
                    <FileText size={12} /> View PDF <ExternalLink size={10} />
                  </a>
                {/if}
                {#if resume.imageUrl}
                  <a
                    href={resume.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-ink-3 hover:text-ink transition-colors"
                  >
                    <ImageIcon size={12} /> Preview Image
                  </a>
                {/if}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 self-end sm:self-center">
            {#if !resume.isActive}
              <Button size="sm" variant="secondary" onclick={() => form.setActiveResume(resume.id)}>
                Set Active
              </Button>
            {/if}
            <button
              type="button"
              class="p-2 text-ink-3 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              disabled={resume.isActive}
              title={resume.isActive ? 'Cannot delete active resume' : 'Delete version'}
              onclick={() => form.removeResumeVersion(resume.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Card>
