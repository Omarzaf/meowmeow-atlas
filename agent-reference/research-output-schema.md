# Gen Z Protest Atlas research output contract

The website imports human-reviewed research batches. The agent must return JSON
that follows this record shape and must never claim it changed the local site.

## Source record

```json
{
  "id": "publisher-short-title-year",
  "title": "Exact source title",
  "url": "https://canonical-source.example/item",
  "publisher": "Publishing institution",
  "authors": ["Author One"],
  "published_date": "YYYY-MM-DD or null when the date is unknown",
  "year": 2026,
  "resource_type": "report",
  "access": "open",
  "geographies": ["Global"],
  "cases": ["Kenya 2024-2025"],
  "themes": ["digital repression"],
  "summary": "A neutral description of what the source contains.",
  "relevance": "Why this source belongs in the atlas.",
  "verification_status": "verified",
  "verification_notes": "How metadata and material claims were checked.",
  "last_checked": "YYYY-MM-DD",
  "language": "English"
}
```

## Controlled values

- `resource_type`: `article`, `book`, `dataset`, `guide`, `legal_standard`,
  `monitor`, `report`, `tool`, `video`, or `website`.
- `access`: `open`, `partial`, `paywalled`, or `unknown`.
- `verification_status`: `verified`, `partially_verified`,
  `needs_review`, or `unavailable`.

## Requirements

1. Use the canonical URL without tracking parameters.
2. Copy titles, authors, publishers, and dates from the source or authoritative
   bibliographic metadata; do not infer missing values.
3. Use an empty author list and a `verification_notes` explanation when a
   source has no named author.
4. Use `null` for an unknown `published_date` or `year`; never infer a date.
5. Include a case claim only when at least two independent credible sources
   support it. A source record itself may rely on its authoritative document.
6. Mark uncertainty explicitly. Never upgrade `needs_review` merely to make the
   batch look complete.
7. Deduplicate by canonical URL, DOI, and normalized title.
8. Return only new or changed records by default, followed by a gap report.
9. Do not include personal contact information, participant rosters, live
   locations, or other sensitive operational data.
