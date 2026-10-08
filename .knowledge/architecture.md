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
- About assets keep deterministic names (`about/resume_pdf.*`, `about/profile.*`, `about/certificateN.*`,
  `about/experience_certificate_N.*`).
- Project files (gallery images + certificate) are always named `projects/{id}/{slug}_{4 random A-Z0-9}.{ext}`
  (`newProjectFileName`). Names are never reused or renamed: reorder only changes the `images` array order in
  Firestore; replaced/removed files are queued (`ProjectForm.queueStorageDelete`) and deleted from Storage on save.
- `scripts/migrate-image-names.mjs` (Admin SDK) one-time renames legacy `1.png`-style files and rewrites Firestore URLs.

## Image CORS
Plain `fetch()` of Storage download URLs fails CORS on https origins. `core/utils/image.ts#fetchImageAsBlob`
routes Firebase URLs through `getBlob` (SDK). Bucket CORS must still be configured (`cors.json`).

## Build and deploy
`pnpm build` -> `dist/` (committed to git). The workflow does no install/build: when a pushed commit message contains
"deploy", it force-pushes `dist/` as an orphan commit to `gh-pages` (created if missing).
