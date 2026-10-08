import { wrap } from 'svelte-spa-router/wrap';
import NotFound from './NotFound.svelte';

// Each page is lazy-loaded so Firebase Storage / image tooling only ship when needed.
export const routes = {
  '/': wrap({ asyncComponent: () => import('@/features/dashboard/DashboardPage.svelte') }),
  '/about': wrap({ asyncComponent: () => import('@/features/about/AboutPage.svelte') }),
  '/projects': wrap({ asyncComponent: () => import('@/features/projects/ProjectsPage.svelte') }),
  '/projects/:id': wrap({ asyncComponent: () => import('@/features/projects/ProjectEditPage.svelte') }),
  '/image-studio': wrap({ asyncComponent: () => import('@/features/image-studio/ImageStudioPage.svelte') }),
  '*': NotFound
};
