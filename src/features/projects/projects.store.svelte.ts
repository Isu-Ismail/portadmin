import { listProjects } from '@/core/firebase/firestore';
import type { ProjectData } from '@/core/types';

/** In-memory cache so route changes do not refetch the whole collection. */
class ProjectsStore {
  items = $state<ProjectData[]>([]);
  loading = $state(false);
  loaded = $state(false);

  async load(force = false): Promise<void> {
    if (this.loading || (this.loaded && !force)) return;
    this.loading = true;
    try {
      this.items = await listProjects();
      this.loaded = true;
    } finally {
      this.loading = false;
    }
  }

  upsert(project: ProjectData): void {
    const i = this.items.findIndex((p) => p.id === project.id);
    this.items = i >= 0 ? this.items.map((p, idx) => (idx === i ? project : p)) : [...this.items, project];
  }

  remove(id: string): void {
    this.items = this.items.filter((p) => p.id !== id);
  }

  invalidate(): void {
    this.loaded = false;
  }
}

export const projectsStore = new ProjectsStore();
