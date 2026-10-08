<script lang="ts">
  import { Briefcase } from '@lucide/svelte';
  import { uploadExperienceCertificate } from '@/core/firebase/storage';
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
    form.queueStorageDelete(data.experience[index]?.certificateLink);
    return uploadExperienceCertificate(index + 1, file, name);
  }
</script>

<Card>
  <ListEditor
    bind:items={data.experience}
    title="Work experience & internships"
    icon={Briefcase}
    addLabel="Add experience"
    emptyText="No experience entries yet."
    create={() => ({ role: '', company: '', period: '', description: '', certificateLink: '' })}
    onremove={(item) => form.queueStorageDelete(item.certificateLink)}
  >
    {#snippet children(item, i)}
      <div class="grid gap-3 md:grid-cols-3">
        <Input label="Role" placeholder="Industrial Intern" bind:value={item.role} />
        <Input label="Company" placeholder="Company name" bind:value={item.company} />
        <Input label="Period" placeholder="June 2026" bind:value={item.period} />
        <div class="md:col-span-3">
          <ImageUploader
            bind:value={item.certificateLink}
            label="Certificate image #{i + 1}"
            description="Internship / experience proof (auto-compressed)"
            uploadHandler={(file, name) => upload(i, file, name)}
          />
        </div>
        <Textarea class="md:col-span-3" label="Description" rows={3} bind:value={item.description} />
      </div>
    {/snippet}
  </ListEditor>
</Card>
