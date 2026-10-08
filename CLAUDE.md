# CLAUDE.md

Read `README.md`, then `.knowledge/session_handoff.md`, before starting.

## Project rules

- Plain Svelte 5 SPA (not SvelteKit). No `$app/*` imports. Routing is hash-based via `svelte-spa-router`
  (v5: use `router.location`, `push`, `replace`; route components receive a `params` prop).
- Use Tailwind utilities with the theme tokens in `src/app.css` (`bg-bg`, `border-line`, `text-ink`,
  `crimson`, `orange`). Reuse `src/shared/ui` components; do not add scoped CSS blobs.
- Style constraints from the owner: no gradients, no backdrop blur, no scroll effects, no complex animation.
  Hover = raise contrast or opacity only.
- Keep logic out of pages: put it in `*.svelte.ts` store/form classes or `src/core`. Keep pages thin.
- Import with the `@/` alias (maps to `src/`).
- No `.env`: Firebase config lives in `src/core/firebase/client.ts`; access depends on being signed in.
- `archive/` is the old SvelteKit app. Read it for reference only. Never import from it.
- No test suite. Verify with `pnpm run check` and `pnpm build`, and manually in the browser.
- Storage cleanup rule: replaced/removed uploads are queued and deleted only when the form is saved.
- For SEO work use the `search-engine-optimization` skill (admin app should stay non-indexed).

## Handoff rule

**After every edit you make to this project, update `.knowledge/session_handoff.md` before ending your
turn.** Do this without being asked. Write what you changed, why, what is in progress, and what the next
agent should know. Keep it current, not a log: overwrite stale items. There is one `session_handoff.md`;
overwrite it, do not create new files per session.

If your edit changes a feature's behavior, architecture, or file layout, also update the relevant file in
`.knowledge/` in the same turn.
