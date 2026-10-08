import { wrap } from 'svelte-spa-router/wrap';
import FormSkeleton from '@/shared/ui/FormSkeleton.svelte';
import NotFound from './NotFound.svelte';

// Each page is lazy-loaded with a skeleton loader so there is never a blank screen during route transitions.
export const routes = {
  '/': wrap({
    asyncComponent: () => import('@/features/dashboard/DashboardPage.svelte'),
    loadingComponent: FormSkeleton
  }),
  '/about': wrap({
    asyncComponent: () => import('@/features/about/AboutPage.svelte'),
    loadingComponent: FormSkeleton
  }),
  '/projects': wrap({
    asyncComponent: () => import('@/features/projects/ProjectsPage.svelte'),
    loadingComponent: FormSkeleton
  }),
  '/projects/:id': wrap({
    asyncComponent: () => import('@/features/projects/ProjectEditPage.svelte'),
    loadingComponent: FormSkeleton
  }),
  '/image-studio': wrap({
    asyncComponent: () => import('@/features/image-studio/ImageStudioPage.svelte'),
    loadingComponent: FormSkeleton
  }),
  '*': NotFound
};
