# Contributing

Most contributions here are research, not code. The bar for a source is higher
than "it's a real link", so this document is mostly about that.

## Getting set up

```bash
corepack enable
pnpm install
pnpm dev --host 127.0.0.1 --port 4178 --strictPort
```

Verify before opening a pull request:

```bash
pnpm build && pnpm test && pnpm test:sites && pnpm test:e2e
```

`pnpm build` refuses to run if the corpus violates the v3 contract, so a bad
record fails locally rather than in review.

## Adding a source record

The contract is `agent-reference/research-output-schema-v3.md`, enforced by
`src/atlasSchema.ts`. A record is rejected at build time if it fails any of it.

What the schema cannot check, and reviewers will:

- **Cite the canonical URL**, not a mirror, an aggregator, or a PDF someone
  rehosted. If only a rehosted copy exists, say so in `verification_notes` and
  mark it `partially_verified`.
- **Keep the four judgments separate.** Metadata verification, claim status,
  legal authority, and attribution are different questions. A rights report is
  not binding law. A measured anomaly is not an established shutdown. Authentic
  provenance is not proof the depicted claim is true.
- **Use `verified` only when you actually loaded the document** and confirmed
  title, publisher, author, date, and scope. Otherwise `partially_verified`,
  with the reason.
- **Record what the source cannot establish** in the profile `limitations` and
  `caveats`. These fields are not padding; they are the point.
- **`null` beats a guess** for `published_date` and `year`.

## Adding or changing a case summary

A case summary needs at least two source records from at least two editorially
independent groups (`authority.independence_group`). If the cited records share
a group, the build still passes but the case is labelled **Corroboration
limited** in the UI and the reason is shown to readers. Do not work around that
label — either find an independent source or leave the label.

Prefer bounded claims. Casualty totals, arrest totals, platform-effect claims,
surveillance attribution, and constitutional conclusions do not go in unless
independent sources directly support them.

## Adding a photograph

Harder than adding a source, and reviewed more strictly.

1. The image must carry CC0 or a Creative Commons license at its origin.
2. Download it and commit the original to `public/visual-archive/`. Nothing is
   hotlinked.
3. Record the SHA-256 of the committed file in `image.sha256`. Tests verify it.
4. Preserve creator, source record URL, license code, license URL, attribution
   string, and any `transformation_note`.
5. Provide two context sources **from distinct publishers**.
6. Write the `safety_note`. Non-graphic content only. If the photograph makes a
   participant identifiable in a way that could expose them, it does not go in.
7. If it was taken somewhere other than where the protest happened, tag it
   `International solidarity` and say so in `location_note`. Geographic
   conflation is a documented failure mode of protest imagery.

Run `node scripts/build-images.mjs` to generate responsive derivatives. Those
are gitignored — only the original is committed.

## Language coverage

Every record in the corpus is currently in English, which is a real limitation
for cases in Nepal, Indonesia, Iran, Sudan, Morocco, Serbia, Bangladesh, Kenya,
Sri Lanka, and Madagascar. **Local-language sources are the most valuable
contribution available right now.** Set `language` accurately and, where the
title is not in English, keep the original title and gloss it in `summary`.

## Checking for rot

```bash
pnpm check:links
```

Requests every canonical URL, archived snapshot, and context source, and reports
what is unreachable or has moved. It never edits the corpus — promoting a
failure into `verification_status`, or recording an `archived_url`, is a human
decision.

A weekly workflow runs the same check and files a report artifact.

## Safety

Read `SECURITY.md` before contributing research. The dataset deliberately
excludes personal identifiers, live locations, participant rosters, device and
account identifiers, unredacted sensitive media, and individualised evasion
instructions. Records marked `do_not_publish` are rejected by the build.

If you are unsure whether something crosses that line, open a private report
rather than a pull request.
