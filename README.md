# Portfolio Admin (CMS)

Admin panel for editing a personal portfolio stored in Firebase (Firestore + Storage). Sign in with a
Firebase account, then edit About Me, Projects (case studies, galleries), compress images, and inspect
Firestore documents. Deployed as a static SPA under `/portadmin/`.

## Stack

- Svelte 5 (runes) + TypeScript + Vite 8, created with `pnpm create vite` (plain Svelte, no SvelteKit)
- Tailwind CSS v4 (`@tailwindcss/vite`), crimson / orange on black, flat (no gradients, blur or heavy animation)
- `svelte-spa-router` (hash routing, so GitHub Pages needs no 404 trick)
- Firebase modular SDK: Auth, Firestore, Storage
- Zod for runtime validation, `@lucide/svelte` for icons

## Layout

```
src/
  app/            App shell: App.svelte, Sidebar, routes.ts (lazy routes), NotFound
  core/           Framework-free logic
    firebase/     client.ts, auth.svelte.ts, firestore.ts, storage.ts
    schemas/      Zod schemas (about, project, common)
    types/        Shared TS types
    utils/        image.ts (canvas resize/compress), toast, validation
    defaultData.ts  Seed data
  shared/
    ui/           Button, Input, Card, Modal, ListEditor, TagInput, Toasts ...
    image/        ImageEditor (state), ImageUploader, ImageResizerModal, compare/controls
  features/
    auth/ dashboard/ about/ projects/ image-studio/ inspector/
archive/          Old SvelteKit version, reference only (excluded from build/check)
```

Each feature owns its page, `components/`, and a `*.svelte.ts` store or form class holding state and logic.

## Commands

```
pnpm install
pnpm dev          # http://localhost:5173/portadmin/
pnpm run check    # svelte-check + tsc
pnpm build        # outputs dist/ (committed)
```

## Deploy

`dist/` is committed. The workflow (`.github/workflows/deploy.yml`) runs no install or build: it only copies
`dist/` to the `gh-pages` branch (created if missing), and only when the commit message contains `deploy`.

```
pnpm build
git add -A
git commit -m "deploy: <what changed>"
git push
```

A commit without "deploy" in its message does not start the workflow. Vite `base` is `/portadmin/`.

## Firebase notes

- Project `portfolio-c1025`. Config is in `src/core/firebase/client.ts` (web keys are public; access is
  controlled by Firebase security rules and sign-in).
- Firestore: `about/main`, `projects/{id}`. Storage: `about/*`, `projects/{projectId}/*`.
- Image CORS: fetching Storage images from an https origin needs bucket CORS. `cors.json` is provided; apply
  once with `gsutil cors set cors.json gs://portfolio-c1025.firebasestorage.app`. The app also downloads
  Storage images through the SDK (`getBlob`) instead of plain `fetch`.
