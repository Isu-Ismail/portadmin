import { getAboutMe, saveAboutMe } from '@/core/firebase/firestore';
import { deleteStorageFile, storagePathFromUrl } from '@/core/firebase/storage';
import { defaultAboutData } from '@/core/defaultData';
import { AboutDataSchema } from '@/core/schemas/about';
import type { AboutData, ResumeVersion } from '@/core/types';
import { toast } from '@/core/utils/toast.svelte';
import { validateWithSchema } from '@/core/utils/validation';
import { aboutStore } from './about.store.svelte';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function getActiveStoragePaths(data: AboutData): Set<string> {
  const paths = new Set<string>();
  const add = (u: string | null | undefined) => {
    const p = storagePathFromUrl(u);
    if (p) paths.add(p);
  };
  add(data.resume);
  add(data.images?.profile);
  add(data.images?.hero);
  add(data.images?.resume_image);
  for (const c of data.certificates || []) add(c.image);
  for (const e of data.experience || []) add(e.certificateLink);
  for (const r of data.resumes || []) {
    add(r.pdfUrl);
    add(r.imageUrl);
  }
  return paths;
}

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
        const initialResumes: ResumeVersion[] =
          doc.resumes && Array.isArray(doc.resumes) && doc.resumes.length > 0
            ? doc.resumes
            : doc.resume
              ? [
                  {
                    id: 'current',
                    name: 'Current Resume',
                    pdfUrl: doc.resume,
                    imageUrl: doc.images?.resume_image || '',
                    uploadedAt: new Date().toISOString(),
                    isActive: true
                  }
                ]
              : [];

        this.data = {
          ...defaultAboutData,
          ...doc,
          resumes: initialResumes,
          images: { ...defaultAboutData.images, ...(doc.images || {}) },
          contact: { ...defaultAboutData.contact, ...(doc.contact || {}) },
          stats: doc.stats?.length ? doc.stats : defaultAboutData.stats,
          skillCards:
            doc.skillCards && Array.isArray(doc.skillCards) && doc.skillCards.length
              ? doc.skillCards
              : defaultAboutData.skillCards
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

  setActiveResume(versionId: string): void {
    if (!this.data.resumes) return;
    const target = this.data.resumes.find((r) => r.id === versionId);
    if (!target) return;
    this.data.resumes = this.data.resumes.map((r) => ({
      ...r,
      isActive: r.id === versionId
    }));
    this.data.resume = target.pdfUrl;
    if (target.imageUrl) {
      this.data.images.resume_image = target.imageUrl;
    }
    toast.success(`Active resume switched to "${target.name || 'Selected version'}"`);
  }

  addResumeVersion(version: ResumeVersion): void {
    if (!this.data.resumes) this.data.resumes = [];
    this.data.resumes = this.data.resumes.map((r) => ({ ...r, isActive: false }));
    this.data.resumes = [version, ...this.data.resumes];
    this.data.resume = version.pdfUrl;
    if (version.imageUrl) {
      this.data.images.resume_image = version.imageUrl;
    }
    toast.success(`New resume version "${version.name}" uploaded and set as active.`);
  }

  removeResumeVersion(versionId: string): void {
    if (!this.data.resumes) return;
    const target = this.data.resumes.find((r) => r.id === versionId);
    if (!target) return;
    if (target.isActive) {
      toast.error('Cannot delete the active resume. Set another resume as active first.');
      return;
    }
    this.queueStorageDelete(target.pdfUrl);
    this.queueStorageDelete(target.imageUrl);
    this.data.resumes = this.data.resumes.filter((r) => r.id !== versionId);
    toast.info('Resume version removed.');
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
    if (this.data.skillCards && this.data.skillCards.length > 0) {
      this.data.skills = this.data.skillCards.flatMap((c) => c.items || []);
    }
    const res = validateWithSchema(AboutDataSchema, this.data);
    if (!res.success) {
      this.errors = res.errors;
      toast.error(res.errorSummary || 'Fix the highlighted errors before saving.');
      return;
    }
    this.errors = {};
    this.saving = true;
    try {
      const activePaths = getActiveStoragePaths(this.data);
      const toDelete = this.pendingDeletes
        .splice(0)
        .filter((u) => {
          const path = storagePathFromUrl(u);
          // Never delete a file if the current form data uses that storage path!
          return Boolean(path && !activePaths.has(path));
        });
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
