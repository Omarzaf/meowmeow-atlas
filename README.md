# Gen Z Protest Atlas

A minimal, source-first, one-page research atlas for Gen Z and youth-led protest
movements in the 2020s.

## Run locally

```bash
pnpm install
pnpm dev --host 127.0.0.1 --port 4178 --strictPort
```

Open `http://127.0.0.1:4178/`.

The case and source index is available at `/`; the rights-cleared photographic
archive is available at `/visual-archive`.

## Verify

```bash
pnpm build
pnpm test
pnpm test:sites
pnpm test:e2e
```

The local JSON corpus lives in `src/data/`. All records use the strict v3 Zod
contract, including controlled taxonomy and provenance plus conditional legal,
technical-monitoring, OSINT/evidence, and publication-safety profiles.
Cross-field validation rejects unresolved case links, weak source-independence
claims, invalid dates, and profiles that do not match their source type.
Research limitations and next-pass priorities are documented in
`research/coverage_notes.md`; the import contract is
`agent-reference/research-output-schema-v3.md`.

The paired Workspace Agent returns human-reviewed import batches; it does not
write to this repository or publish the site.

## Image rights

Visual-archive photographs are stored locally for a stable research record, but
they retain their original CC0 or Creative Commons terms. Each record in
`src/data/visual_archive.json` preserves the creator, source page, license,
attribution text, any display transformation, and participant-safety note.
Creative Commons images are not relicensed as part of the surrounding
application.

## Repository license

No project-wide software or content license has been selected. Public
availability on GitHub does not by itself grant permission to reuse the
application code, research text, or datasets. The per-image licenses described
above apply only to their corresponding photographs.
