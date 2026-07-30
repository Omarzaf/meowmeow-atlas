# Gen Z Protest Atlas

A source-first research atlas of Gen Z and youth-led protest movements in the
2020s: cases, international rights standards, connectivity monitoring, digital
forensics, OSINT evidence methods, and a rights-cleared photographic archive.

The organising claim is that "verified" is not one confidence label. Metadata
verification, claim status, legal authority, technical observation, attribution,
and publication safety are recorded as separate fields, and the schema refuses
records that collapse them.

## Run locally

```bash
corepack enable && pnpm install
pnpm dev --host 127.0.0.1 --port 4178 --strictPort
```

Open `http://127.0.0.1:4178/`. The case and source index is at `/`; the
photographic archive is at `/visual-archive`.

## Verify

```bash
pnpm build
pnpm test
pnpm test:sites
pnpm test:e2e
```

`pnpm build` runs the corpus contract first, so a record that violates the v3
schema fails the build rather than shipping. CI runs all four on every push and
pull request.

Two further checks:

```bash
pnpm check:corpus   # contract + corpus-level integrity only
pnpm check:links    # request every canonical and context URL, report rot
```

## Deploying

Live at **https://gen-z-protest-atlas.vercel.app**.

Set `SITE_URL` so canonical tags and `sitemap.xml` carry the real origin:

```bash
SITE_URL=https://your-domain.example pnpm build
```

On Vercel this is inferred automatically — production builds use the project's
production domain, preview builds use their own deployment URL and ship
`noindex` plus a disallow-all `robots.txt` so a preview cannot compete with
production in search. Elsewhere the build warns if `SITE_URL` is unset.

Output is `dist/client` (static assets, one prerendered HTML shell per route,
`robots.txt`, `sitemap.xml`), `dist/server/index.js` (the asset worker), and
`dist/.openai/hosting.json`.

Two hosting paths are supported and must stay in step:

- **Vercel** — `vercel.json` sets clean URLs, the security headers, a CSP, and
  immutable caching. Vercel serves `404.html` for unmatched paths, preserving
  the real 404 status.
- **OpenAI Sites** — `worker/index.js` does the same job for the ASSETS binding.

If you change 404 handling or security headers, change both.

## How the data is organised

The local JSON corpus lives in `src/data/`. All records use the strict v3 Zod
contract, including controlled taxonomy and provenance plus conditional legal,
technical-monitoring, OSINT/evidence, and publication-safety profiles.
Cross-field validation rejects unresolved case links, weak source-independence
claims, invalid dates, non-https URLs, and profiles that do not match their
source type.

Validation runs at build time and in tests, not in the browser: the corpus is a
bundled constant, so re-parsing it on every page load would cost every visitor
without ever surfacing a new failure.

Research limitations and next-pass priorities are in
`research/coverage_notes.md`; the import contract is
`agent-reference/research-output-schema-v3.md`.

The paired Workspace Agent returns human-reviewed import batches; it does not
write to this repository or publish the site.

## Known limitations

These are properties of the current pass, not oversights:

- **Every source is in English.** For cases in Nepal, Indonesia, Iran, Sudan,
  Morocco, Serbia, Bangladesh, Kenya, Sri Lanka, and Madagascar, local-language
  reporting, court filings, and civil-society material are absent. The site says
  so on its overview.
- **`last_checked` is one batch stamp**, not a per-source date. The header marks
  the corpus stale once that date passes 180 days.
- **One case carries limited publisher independence** (Morocco) and is labelled
  *Corroboration limited* with the reason shown.
- **One case is a watchlist entry** (India) with no factual summary.
- This is a bounded research pass, not an exhaustive index.

## Image rights

Visual-archive photographs are stored locally for a stable research record and
served as resized derivatives, but they retain their original CC0 or Creative
Commons terms. Each record in `src/data/visual_archive.json` preserves the
creator, source page, license, attribution text, any display transformation, a
SHA-256 digest of the archival original, and a participant-safety note. Creative
Commons images are not relicensed by the surrounding application.

## Licensing

- **Application code:** MIT — see `LICENSE`.
- **Research dataset and prose:** CC BY 4.0 — see `LICENSE-DATA`.
- **Photographs:** their original CC0 / Creative Commons terms only, recorded
  per record. Several are ShareAlike.

Attribution for the dataset:

> Gen Z Protest Atlas (meowmeow), by Omar Zafar, CC BY 4.0.

Reusing a case summary while dropping its verification status, corroboration
note, or stated limitations misrepresents the research, even where the license
permits adaptation.

## Contributing and safety

`CONTRIBUTING.md` covers the evidence bar for adding sources, cases, and
photographs. Local-language sources are the most valuable contribution
available right now.

`SECURITY.md` covers both software vulnerabilities and participant-safety
reports. Safety reports are treated as urgent, and material is withdrawn from
the public build while one is open.
