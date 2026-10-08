# Session Handoff

_Last updated: 2026-10-08_

## State of the project
Full rewrite from SvelteKit to plain Svelte 5 + Vite + Tailwind v4 + hash router + Firebase modular SDK.
`pnpm run check` passes (0 errors); `pnpm build` succeeds. NOT yet verified in a browser (the Chrome extension was
not connected), and not committed (directory is not a git repo).

## What's in place now
- All original features ported: login gate, dashboard (stats, backup export/import, seed), About editor (identity,
  stat cards, profile/resume uploads, contact, skills/interests, education, experience, certificates), Projects list
  (search, delete, JSON import, Firestore inspector), project editor (overview, case study, narratives, gallery with
  batch upload/renumber, certificate, raw JSON editor), Image Studio, resizer modal with original-vs-edited compare.
- New sidebar layout, black/crimson/orange flat theme, shared UI kit in `src/shared/ui`.
- Old SvelteKit code is in `archive/` (config files renamed `*.archived` so tools ignore them).

## Behavior differences vs the old app
- Project list no longer falls back to showing `defaultProjects` when Firestore is empty (use dashboard "Seed").
- Gallery file extension follows the chosen output format (old code always used `.webp` for edited singles).
- Image/PDF fetches for Storage URLs use SDK `getBlob`.

## Known open items
- Apply bucket CORS: `gsutil cors set cors.json gs://portfolio-c1025.firebasestorage.app` (user action).
- Main JS chunk is ~636 kB (Firebase Auth + app shell); could split Firebase via manualChunks.
- Browser smoke test of every page with a real login is still needed.

## Next agent: what to check
Run `pnpm dev`, sign in, click through each page, test an upload, a save, a delete, and the JSON import.

## How to use this file
Overwrite each session; it is current state, not a changelog.
