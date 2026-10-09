import DashboardPage from '@/features/dashboard/DashboardPage.svelte';
import AboutPage from '@/features/about/AboutPage.svelte';
import ProjectsPage from '@/features/projects/ProjectsPage.svelte';
import ProjectEditPage from '@/features/projects/ProjectEditPage.svelte';
import ImageStudioPage from '@/features/image-studio/ImageStudioPage.svelte';
import NotFound from './NotFound.svelte';

export const routes = {
  '/': DashboardPage,
  '/about': AboutPage,
  '/projects': ProjectsPage,
  '/projects/:id': ProjectEditPage,
  '/image-studio': ImageStudioPage,
  '*': NotFound
};
