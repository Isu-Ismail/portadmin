<script lang="ts">
  import { ExternalLink, Upload } from '@lucide/svelte';
  import { uploadProfileImage, uploadResumeImage, uploadResumePdf } from '@/core/firebase/storage';
  import { toast } from '@/core/utils/toast.svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Field from '@/shared/ui/Field.svelte';
  import Spinner from '@/shared/ui/Spinner.svelte';
  import { inputClass } from '@/shared/ui/styles';
  import ImageUploader from '@/shared/image/ImageUploader.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);
  let uploadingPdf = $state(false);

  async function uploadPdf(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    form.queueStorageDelete(data.resume);
    uploadingPdf = true;
    try {
      data.resume = await uploadResumePdf(file, file.name);
      toast.success('Resume PDF uploaded');
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      uploadingPdf = false;
      input.value = '';
    }
  }

  function profileUpload(file: File | Blob, name: string) {
    form.queueStorageDelete(data.images.profile);
    return uploadProfileImage(file, name);
  }

  function resumeImageUpload(file: File | Blob, name: string) {
    form.queueStorageDelete(data.images.resume_image);
    return uploadResumeImage(file, name);
  }
</script>

<Card title="Profile image">
  <ImageUploader
    bind:value={data.images.profile}
    label="Profile picture"
    description="Square avatar used in the header and about card"
    uploadHandler={profileUpload}
  />
</Card>

<Card title="Resume">
  <div class="grid gap-4 md:grid-cols-2">
    <Field label="Resume PDF (URL or upload)">
      <div class="flex gap-2">
        <input class={inputClass} bind:value={data.resume} placeholder="Storage URL or ./assets/resume.pdf" />
        {#if data.resume}
          <a
            href={data.resume}
            target="_blank"
            rel="noreferrer"
            class="rounded-md border border-line p-2.5 text-ink-2 hover:border-line-strong hover:text-ink"
            title="Open PDF"
          >
            <ExternalLink size={14} />
          </a>
        {/if}
      </div>
      <div class="flex items-center gap-3">
        <label
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink"
        >
          <Upload size={14} /> Upload PDF
          <input type="file" accept="application/pdf" class="hidden" onchange={uploadPdf} />
        </label>
        {#if uploadingPdf}<Spinner size={14} />{/if}
      </div>
    </Field>

    <ImageUploader
      bind:value={data.images.resume_image}
      label="Resume preview image"
      description="Thumbnail shown before download"
      uploadHandler={resumeImageUpload}
    />
  </div>
</Card>
