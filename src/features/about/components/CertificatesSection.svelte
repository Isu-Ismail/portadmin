<script lang="ts">
  import { Award } from '@lucide/svelte';
  import { uploadAboutCertificate } from '@/core/firebase/storage';
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Textarea from '@/shared/ui/Textarea.svelte';
  import ListEditor from '@/shared/ui/ListEditor.svelte';
  import ImageUploader from '@/shared/image/ImageUploader.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);

  function upload(index: number, file: File | Blob, name: string) {
    form.queueStorageDelete(data.certificates[index]?.image);
    return uploadAboutCertificate(index + 1, file, name);
  }
</script>

<Card>
  <ListEditor
    bind:items={data.certificates}
    title="Certificates & credentials"
    icon={Award}
    addLabel="Add certificate"
    emptyText="No certificates yet."
    create={() => ({ title: '', image: '', desc: '' })}
    onremove={(item) => form.queueStorageDelete(item.image)}
  >
    {#snippet children(item, i)}
      <div class="flex flex-col gap-3">
        <Input label="Title" placeholder="Manufacturing Strategy (NPTEL)" bind:value={item.title} />
        <ImageUploader
          bind:value={item.image}
          label="Certificate image #{i + 1}"
          description="Scanned certificate (auto-compressed)"
          uploadHandler={(file, name) => upload(i, file, name)}
        />
        <Textarea label="Description / score / issuer" rows={2} bind:value={item.desc} />
      </div>
    {/snippet}
  </ListEditor>
</Card>
