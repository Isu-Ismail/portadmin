import { getAboutMe } from '@/core/firebase/firestore';
import type { AboutData } from '@/core/types';

class AboutStore {
  data = $state<AboutData | null>(null);
  loading = $state(false);
  loaded = $state(false);

  async load(force = false): Promise<void> {
    if (this.loading || (this.loaded && !force)) return;
    this.loading = true;
    try {
      this.data = await getAboutMe();
      this.loaded = true;
    } finally {
      this.loading = false;
    }
  }

  set(data: AboutData): void {
    this.data = data;
    this.loaded = true;
  }
}

export const aboutStore = new AboutStore();
