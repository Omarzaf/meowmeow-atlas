# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

The approved visual target is the original editorial-index mock (held locally by
the maintainer; not committed). Preserve its warm paper surface, serif display
title, deep-red accent, left taxonomy rail, wide search, compact filters, and
unboxed table-like content — the shipped UI is the reference implementation of
that target, so match it when the mock is unavailable.

The current product identity is exact camel-caps `MeowMeow` in the wordmark,
display heading, and browser title; retain “Gen Z Protest Atlas” as the
descriptive label. This supersedes the earlier all-lowercase `meowmeow` rule,
which the owner overturned on 31 July 2026 — do not revert it. The descriptive
label stays because a cat name alone tells a researcher nothing about the
contents, and it carries the search and citation weight in every page title.

The wordmark mark is the walking cat in `src/WalkingCat.tsx`, not a Phosphor
glyph: an inline SVG silhouette whose diagonal leg pairs are counter-phased on
a 1.05s cycle. Its motion is guarded by `prefers-reduced-motion`, which settles
the legs mid-stride rather than snapping them to rest, so the reduced-motion
state is still a deliberate walking pose. Keep the Georgia/Helvetica editorial
typography and use text-labeled Phosphor icons elsewhere to make navigation and
filtering easier to scan.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Use pnpm for all project commands. Before a Sites handoff, run `pnpm build` and `pnpm test:sites`; the build must leave `dist/client/index.html`, `dist/client/visual-archive.html`, `dist/client/404.html`, `dist/client/sitemap.xml`, `dist/client/robots.txt`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Architectural invariants

These are load-bearing. Changing one without the others reintroduces a fixed bug.

- **Schemas run at build time, never in the browser.** `atlasSchema.ts` and
  `visualArchiveSchema.ts` import Zod and are used by `src/corpus.test.ts` (the
  `prebuild` gate) and the unit tests. `atlasData.ts` and `visualArchiveData.ts`
  are the runtime modules and must stay Zod-free — the corpus is a bundled
  constant, so re-parsing it per page load costs every visitor and can never
  surface a new failure.
- **`visualArchiveData.ts` must not import `atlasData.ts`.** That import pulled
  the whole 61-record corpus into the archive route. Referential integrity
  between `related_case_id` and the atlas is checked in `corpus.test.ts` instead.
- **All URLs are https-only**, enforced by `httpsUrl` in `schemaPrimitives.ts`.
  Zod's `.url()` accepts `javascript:` and `data:`, and every URL in the corpus
  is rendered into an `href`. The schema is the trust boundary for imported
  batches.
- **Route metadata lives in `src/data/routes.json`**, consumed by both
  `main.tsx` (dev) and `scripts/prepare-sites-build.mjs` (prerendered shells).
  Adding a route means adding it there, not just in `main.tsx`.
- **Responsive image widths live in `src/data/image-widths.json`**, shared by
  `scripts/build-images.mjs` and `VisualArchivePage.tsx` so they cannot drift.
  Archival originals in `public/visual-archive/` are committed and digest-
  attested; `derived/` is regenerable and gitignored.
- **Unknown routes must return HTTP 404**, not the homepage with 200. Soft-404s
  make rotted citation links look like they resolved.
- **Counts shown in UI copy must be derived**, never written as words. "Seven
  more records" silently lied the moment an eighth was added.
