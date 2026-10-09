# Session Handoff

_Last updated: 2026-10-08_

## State of the project
Full rewrite from SvelteKit to plain Svelte 5 + Vite + Tailwind v4 + hash router + Firebase modular SDK.
`pnpm run check` passes (0 errors); `pnpm build` succeeds. Not yet smoke-tested in a browser by an agent
(the Chrome extension was not connected). Directory is not a git repo from the agent's view.

## What's in place now
- All original features ported: login gate, dashboard (stats, backup export/import, seed), About editor, Projects
  list (search, delete, JSON import, Firestore inspector), project editor (overview, case study, narratives, gallery
  with batch upload/renumber, certificate, raw JSON editor), Image Studio, resizer modal with original-vs-edited compare.
- Sidebar layout, flat black/crimson/orange theme, shared UI kit in `src/shared/ui`.
- Skeleton loaders (`Skeleton`, `FormSkeleton`, `ProjectCardSkeleton`) on About, Projects and project edit pages.
- Section components bind through a local alias (`const data = $derived(form.data)`) to avoid Svelte's
  `ownership_invalid_binding` dev warning. Keep this pattern for new sections.
- Skill Cards feature: Skill categories are managed as separate cards in `SkillsSection.svelte` with `ListEditor`
  (each card has a title and a dedicated `TagInput` for its skills). `data.skills` is automatically kept in sync
  as a flattened array of all card items on save for backward compatibility.
- Instant Static Chrome & Scoped Data Skeletons: Static UI elements (the sidebar navigation,
  page titles like "About Me" / "Projects", action buttons like "Fields", "Reload", "Defaults",
  "Save & publish", "New project", "From JSON", "Refresh", and search filters) render
  instantaneously without flashing fake skeleton boxes.
  - `routes.ts` imports page components directly instead of lazy `wrap({ loadingComponent: FormSkeleton })`,
    eliminating route chunk network delay and whole-page skeleton flash.
  - `App.svelte` mounts the layout shell with `<Sidebar />` and `<Router {routes} />` immediately
    for known users so the active page header and buttons appear on frame 0.
  - `index.html` renders the clean static sidebar shell with real branding and no fake gray skeleton rectangles.
  - Skeletons (`FormSkeleton`, `ProjectCardSkeleton`) are now strictly scoped to in-flight dynamic data
    sections (form cards, project cards grid) beneath the static headers.
- Resume Pairs & Version History: Implemented dedicated `ResumeSection.svelte` for uploading
  paired PDF and preview image files together (`about/resume_pdf_<uid>.pdf` and
  `about/resume_image_<uid>.webp`) sharing the same random UID. Automatically compresses image to
  WebP (1600px max, 0.85 quality). Displays list of available versions with thumbnail, PDF link,
  date, and interactive "Active" / "Set Active" toggle. Seamlessly updates `data.resume` and
  `data.images.resume_image` for 100% backward compatibility with `port`.
- Storage self-deletion protection: prevented in-place overwritten assets (like deterministic
  `about/resume_image.webp`, `about/profile.webp`, `about/certificate*.webp`) from being deleted
  on form save. `AboutForm.save()` and `ProjectForm.save()` now filter `pendingDeletes` against
  active storage paths currently referenced in the form (`getActiveStoragePaths`), so re-uploaded
  files sharing the same storage path are never deleted.
- Old SvelteKit code is in `archive/` (config files renamed `*.archived`).

## Firebase config (live)
- `storage.rules` and `firestore.rules` deployed: public read, write only for `ismailisims1@gmail.com`.
  Deploy with `firebase deploy --only "storage,firestore:rules"` (quotes needed in PowerShell).
  `firebase.json` / `.firebaserc` target project `portfolio-c1025`.
- Bucket CORS applied (`cors.json`: GET/HEAD from any origin). Run with
  `gsutil cors set cors.json gs://portfolio-c1025.firebasestorage.app` (no trailing dot).
  Needed so the resizer can download existing Storage images.

## Deploy flow
`dist/` is committed. Workflow only copies it to `gh-pages`, and only for commits whose message contains "deploy".
Build locally first (`pnpm build`), commit `dist/`, push.

## Project image naming (new)
- Uploads are auto-named `<slug>_<4 random>.<ext>`; no renumbering. Gallery supports drag-and-drop + arrow reorder
  (Firestore order only). Remove/replace queues Storage deletion until the project is saved.
- Bulk "Optimize to WebP" converts only non-WebP gallery images (new random names, old ones queued for delete).
- Legacy files: run `pnpm migrate:images` (dry run) then `pnpm migrate:images -- --apply`. Needs
  `gcloud auth application-default login` first. NOT yet run against production.

## Behavior differences vs the old app
- Project list no longer falls back to `defaultProjects` when Firestore is empty (use dashboard "Seed").
- Gallery file extension follows the chosen output format.
- Storage image downloads use SDK `getBlob`.

## Known open items
- Main JS chunk is ~636 kB (Firebase Auth + shell); could split Firebase via manualChunks.
- Run the image-name migration (dry run first), then smoke test.
- Browser smoke test of every page with a real login (upload, save, delete, JSON import, resize existing image).

## Next agent: what to check
Run `pnpm dev`, sign in, click through each page; confirm Resize on an existing image works now that CORS is set.

## How to use this file
Overwrite each session; it is current state, not a changelog.
