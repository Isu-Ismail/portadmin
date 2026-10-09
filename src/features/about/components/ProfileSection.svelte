<script lang="ts">
  import { uploadProfileImage } from '@/core/firebase/storage';
  import Card from '@/shared/ui/Card.svelte';
  import ImageUploader from '@/shared/image/ImageUploader.svelte';
  import type { AboutForm } from '../about-form.svelte';

  let { form }: { form: AboutForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const data = $derived(form.data);

  function profileUpload(file: File | Blob, name: string) {
    return uploadProfileImage(file, name);
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
