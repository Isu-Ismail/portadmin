import { deleteProject, getProject, saveProject } from '@/core/firebase/firestore';
import { deleteStorageFile, storagePathFromUrl, uploadCertificateImage } from '@/core/firebase/storage';
import { ProjectDataSchema } from '@/core/schemas/project';
import type { ProjectData } from '@/core/types';
import { toast } from '@/core/utils/toast.svelte';
import { validateWithSchema } from '@/core/utils/validation';
import { projectsStore } from './projects.store.svelte';

export function emptyProject(): ProjectData {
  const now = new Date();
  return {
    id: '',
    title: '',
    description: '',
    tags: ['React', 'FastAPI'],
    link: '',
    status: 'Completed',
    duration: `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`,
    stars: 5,
    subtitle: '',
    architectureTitle: 'System Architecture',
    metrics: [],
    techSpecs: [],
    architectureNodes: [],
    narratives: [],
    images: [],
    certificate: ''
  };
}

/** Edit-form state and persistence logic for one project document. */
export class ProjectForm {
  project = $state<ProjectData>(emptyProject());
  errors = $state<Record<string, string>>({});
  isNew = $state(true);
  loading = $state(true);
  saving = $state(false);
  private pendingDeletes: string[] = [];

  /** Load by route id. Resolves false when the project does not exist. */
  async load(id: string): Promise<boolean> {
    this.loading = true;
    this.errors = {};
    this.pendingDeletes = [];
    try {
      if (id === 'new') {
        this.project = emptyProject();
        this.isNew = true;
        return true;
      }
      const found = await getProject(id);
      if (!found) {
        toast.error(`Project "${id}" not found`);
        return false;
      }
      this.project = {
        ...found,
        metrics: found.metrics || [],
        techSpecs: found.techSpecs || [],
        architectureNodes: found.architectureNodes || [],
        narratives: found.narratives || [],
        images: found.images || [],
        certificate: found.certificate || ''
      };
      this.isNew = false;
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to load project details.');
      return true;
    } finally {
      this.loading = false;
    }
  }

  clearError(field: string): void {
    if (!this.errors[field]) return;
    const next = { ...this.errors };
    delete next[field];
    this.errors = next;
  }

  queueStorageDelete(url: string | undefined): void {
    if (url && url.includes('firebasestorage.googleapis.com') && !this.pendingDeletes.includes(url)) {
      this.pendingDeletes.push(url);
    }
  }

  uploadCertificate = (file: File | Blob, name: string) => {
    this.queueStorageDelete(this.project.certificate);
    return uploadCertificateImage(this.project.id || 'project', file, name);
  };

  /** Save; returns the saved project, or null when validation/save failed. */
  async save(): Promise<ProjectData | null> {
    const res = validateWithSchema(ProjectDataSchema, this.project);
    if (!res.success) {
      this.errors = res.errors;
      toast.error(res.errorSummary || 'Fix the highlighted errors before saving.');
      return null;
    }
    this.errors = {};
    this.saving = true;
    try {
      const activePaths = new Set<string>();
      const add = (u: string | null | undefined) => {
        const p = storagePathFromUrl(u);
        if (p) activePaths.add(p);
      };
      add(this.project.certificate);
      for (const img of this.project.images || []) add(img);

      const toDelete = this.pendingDeletes
        .splice(0)
        .filter((u) => {
          const path = storagePathFromUrl(u);
          return Boolean(path && !activePaths.has(path));
        });
      await Promise.all(toDelete.map((u) => deleteStorageFile(u)));
      const saved = res.data as ProjectData;
      await saveProject(saved.id, saved);
      this.project = saved;
      this.isNew = false;
      projectsStore.upsert(saved);
      toast.success(`Project "${saved.title}" saved`);
      return saved;
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : 'unknown error'}`);
      return null;
    } finally {
      this.saving = false;
    }
  }

  async remove(): Promise<boolean> {
    if (this.isNew) return false;
    try {
      await deleteProject(this.project.id);
      projectsStore.remove(this.project.id);
      toast.success('Project deleted');
      return true;
    } catch (err) {
      toast.error(`Delete failed: ${err instanceof Error ? err.message : 'unknown error'}`);
      return false;
    }
  }

  /**
   * Merge raw JSON text into the form. Returns an error message, or null on success.
   */
  applyJson(text: string): string | null {
    if (!text.trim()) return 'Paste a valid JSON string first.';
    try {
      const parsed = JSON.parse(text.trim());
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return 'Project must be a single JSON object.';
      }
      const p = this.project;
      const merged: ProjectData = {
        id: this.isNew ? parsed.id || p.id : p.id,
        title: String(parsed.title || p.title),
        description: String(parsed.description || ''),
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : p.tags,
        link: String(parsed.link ?? p.link),
        status: parsed.status === 'In Progress' ? 'In Progress' : 'Completed',
        duration: String(parsed.duration ?? p.duration),
        stars: typeof parsed.stars === 'number' ? parsed.stars : p.stars,
        subtitle: String(parsed.subtitle ?? p.subtitle),
        architectureTitle: String(parsed.architectureTitle ?? p.architectureTitle),
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : p.metrics,
        techSpecs: Array.isArray(parsed.techSpecs) ? parsed.techSpecs : p.techSpecs,
        architectureNodes: Array.isArray(parsed.architectureNodes) ? parsed.architectureNodes : p.architectureNodes,
        narratives: Array.isArray(parsed.narratives) ? parsed.narratives : p.narratives,
        images: Array.isArray(parsed.images) ? parsed.images : p.images,
        certificate: String(parsed.certificate ?? p.certificate)
      };
      const res = validateWithSchema(ProjectDataSchema, merged);
      if (!res.success) return `Validation error in JSON: ${res.errorSummary}`;
      this.project = res.data as ProjectData;
      this.errors = {};
      toast.success('Form fields updated from JSON');
      return null;
    } catch (err) {
      return err instanceof SyntaxError ? `JSON syntax error: ${err.message}` : err instanceof Error ? err.message : 'Failed to parse JSON.';
    }
  }
}
