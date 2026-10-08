import { getAboutMe, saveAboutMe } from '@/core/firebase/firestore';
import { deleteStorageFile } from '@/core/firebase/storage';
import { defaultAboutData } from '@/core/defaultData';
import { AboutDataSchema } from '@/core/schemas/about';
import type { AboutData } from '@/core/types';
import { toast } from '@/core/utils/toast.svelte';
import { validateWithSchema } from '@/core/utils/validation';
import { aboutStore } from './about.store.svelte';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** Edit-form state and persistence logic for the About Me document. */
export class AboutForm {
  data = $state<AboutData>(clone(defaultAboutData));
  errors = $state<Record<string, string>>({});
  loading = $state(true);
  saving = $state(false);
  /** Storage files replaced/removed during editing; deleted only when saved. */
  private pendingDeletes: string[] = [];

  async load(): Promise<void> {
    this.loading = true;
    try {
      const doc = await getAboutMe();
      if (doc) {
        this.data = {
          ...defaultAboutData,
          ...doc,
          images: { ...defaultAboutData.images, ...(doc.images || {}) },
          contact: { ...defaultAboutData.contact, ...(doc.contact || {}) },
          stats: doc.stats?.length ? doc.stats : defaultAboutData.stats
        };
        aboutStore.set(doc);
      }
      this.pendingDeletes = [];
    } catch (err) {
      console.error(err);
      toast.error('Could not load About Me data from Firestore.');
    } finally {
      this.loading = false;
    }
  }

  resetToDefaults(): void {
    this.data = clone(defaultAboutData);
    toast.info('Form reset to default data (not saved yet).');
  }

  clearError(field: string): void {
    if (!this.errors[field]) return;
    const next = { ...this.errors };
    delete next[field];
    this.errors = next;
  }

  queueStorageDelete = (url: string | null | undefined): void => {
    if (url && url.includes('firebasestorage.googleapis.com') && !this.pendingDeletes.includes(url)) {
      this.pendingDeletes.push(url);
    }
  };

  async save(): Promise<void> {
    const res = validateWithSchema(AboutDataSchema, this.data);
    if (!res.success) {
      this.errors = res.errors;
      toast.error(res.errorSummary || 'Fix the highlighted errors before saving.');
      return;
    }
    this.errors = {};
    this.saving = true;
    try {
      const toDelete = this.pendingDeletes.splice(0);
      await Promise.all(toDelete.map((u) => deleteStorageFile(u)));
      await saveAboutMe(res.data as AboutData);
      aboutStore.set(res.data as AboutData);
      toast.success('About Me published to Firestore');
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      this.saving = false;
    }
  }
}
