# Security and safety reporting

This project publishes research about protest, state repression, and digital
surveillance. Two categories of report matter here, and the second is the one
most projects forget.

## 1. Software vulnerabilities

Report privately through GitHub's **Security → Report a vulnerability** on this
repository. Please do not open a public issue first.

Include what you did, what happened, and what you expected. A proof of concept
helps. Expect an acknowledgement within a week.

In scope: the application code, the build and packaging scripts, the asset
worker, and the import contract in `src/atlasSchema.ts` /
`src/visualArchiveSchema.ts` — the schemas are the trust boundary for imported
research batches, so a way to smuggle an unsafe value past them is a security
bug, not a data-quality one.

Out of scope: the security posture of linked third-party sites, and findings
that require an already-compromised browser or machine.

## 2. Participant-safety concerns

**Treat these as urgent.** If any published material identifies, locates, or
exposes a protest participant, or could be used to do so, report it the same
private way and say "safety" in the title.

This includes:

- a photograph where someone is identifiable in a way that puts them at risk
- a context note, caption, or location note that narrows a person's identity
- a source record that leads to personal identifiers, a participant roster, or
  live location data
- a photographer or subject who has withdrawn consent, or a source that has been
  retracted or taken down for safety reasons

Material will be withdrawn from the public build while the report is assessed.
Removal is the default while a safety question is open — the research record can
be corrected afterwards; a disclosure cannot be undone.

The dataset already excludes personal identifiers, live locations, participant
rosters, device and account identifiers, unredacted sensitive media, and
individualised evasion instructions (`safety_profile.exclusions`). If you find
something that slipped through that boundary, that is exactly what this section
is for.

## What this project will not do

- It will not help identify individuals in protest photographs.
- It will not provide face recognition, de-anonymisation, or location inference.
- It will not publish records marked `do_not_publish`; the schema rejects them
  at build time.
- It does not give legal or operational safety advice. Nothing here is a
  substitute for a lawyer or a security trainer who knows your jurisdiction.
