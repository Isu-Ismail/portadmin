# Architecture

## Shell and routing
- `src/main.ts` mounts `app/App.svelte`. App renders: spinner while `authState.loading`, `LoginPage` when no user
  (zero-trust: no route renders and nothing is fetched while signed out), else Sidebar + `<Router>`.
- `app/routes.ts` uses `wrap({ asyncComponent })` so each page is a lazy chunk.
- Routes: `/`, `/about`, `/projects`, `/projects/:id` (`new` = create), `/image-studio`, `*`.
- Hash routing, Vite `base: '/portadmin/'`.

## State pattern
- Singletons: `authState` (core/firebase/auth.svelte.ts), `toast`, `aboutStore`, `projectsStore` (in-memory cache so
  route changes do not refetch).
- Edit forms are classes: `AboutForm` (features/about), `ProjectForm` (features/projects). They own data, errors,
  load/save, and the pending-storage-delete queue. Section components take `form` as a prop.
- `GalleryController` (features/projects/gallery.svelte.ts) handles screenshot upload/batch/reorder/renumber.
- `ImageEditor` (shared/image) holds resize/compress state, used by the modal and Image Studio.

## Data
- Firestore: `about/main`, `projects/{id}`. Validation via Zod in `core/schemas`; `firestore.ts` parses on save.
- Storage names are deterministic (see `core/firebase/storage.ts`): `about/resume_pdf.*`, `about/profile.*`,
  `about/certificateN.*`, `about/experience_certificate_N.*`, `projects/{id}/{prefix}{N}.*`, `projects/{id}/certificate.*`.
- `renumberProjectImages` rewrites files via temp names to avoid collisions.

## Image CORS
Plain `fetch()` of Storage download URLs fails CORS on https origins. `core/utils/image.ts#fetchImageAsBlob`
routes Firebase URLs through `getBlob` (SDK). Bucket CORS must still be configured (`cors.json`).

## Build and deploy
`pnpm build` -> `dist/`. GitHub Actions publishes `dist/` to `gh-pages`.
