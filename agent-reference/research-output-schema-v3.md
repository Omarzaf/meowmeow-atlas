# Gen Z Protest Atlas research output contract — v3

The atlas imports human-reviewed research batches. Return JSON records that
conform to this contract. Never claim that an agent response changed the local
repository, published the site, proved a disputed event, or supplied legal or
operational advice.

## Analytical separations

Keep these judgments separate in every record:

1. **Metadata verification** — whether the title, publisher, author, date, and
   canonical URL were checked.
2. **Claim status** — whether the material states a norm, reports an allegation,
   presents a publisher observation, or supports a corroborated finding.
3. **Legal authority** — whether the material is binding treaty text, binding
   case law, authoritative interpretation, non-binding guidance, or analysis.
4. **Technical evidence** — what was measured or captured, at which layer,
   resolution, cadence, and coverage.
5. **Attribution** — what the evidence can and cannot establish about actor,
   intent, cause, or legality.
6. **Publication safety** — which identities, live locations, identifiers,
   media, and operational detail must be excluded.

An anomaly is not automatically censorship. A disruption is not automatically
a government shutdown. Authentic provenance does not prove that the depicted
claim is true. A rights report is not automatically binding law. Multiple
records in one publisher group do not provide independent corroboration.

## Source record

```json
{
  "schema_version": 3,
  "id": "publisher-short-title-year",
  "title": "Exact source title",
  "url": "https://canonical-source.example/item",
  "publisher": "Publishing institution",
  "authors": ["Author One"],
  "published_date": "2026-07-29",
  "year": 2026,
  "resource_type": "monitor",
  "access": "open",
  "geographies": ["Global"],
  "cases": ["Example case"],
  "case_ids": ["example-2026"],
  "themes": ["network measurement", "internet disruption"],
  "summary": "Neutral description of what the source contains.",
  "relevance": "Why this source belongs in the atlas.",
  "verification_status": "verified",
  "verification_notes": "How metadata and material claims were checked.",
  "last_checked": "2026-07-29",
  "language": "English",
  "taxonomy": {
    "primary_topic": "connectivity_monitoring",
    "topics": [
      "connectivity_monitoring",
      "digital_repression",
      "digital_rights"
    ]
  },
  "authority": {
    "source_class": "network_measurement_project",
    "organization_id": "example-observatory",
    "independence_group": "example-observatory",
    "material_role": "monitoring"
  },
  "identifiers": {
    "doi": "10.example/item",
    "official_document_id": "A/HRC/00/00",
    "archived_url": "https://archive.example/item"
  },
  "legal_profile": {
    "system": "universal",
    "authority_level": "authoritative_interpretation",
    "instruments": ["ICCPR Article 21"],
    "applies_to": ["States parties to the ICCPR"],
    "rights": ["peaceful_assembly", "freedom_of_expression"],
    "restriction_tests": [
      "prescribed_by_law",
      "legitimate_aim",
      "necessity",
      "proportionality"
    ],
    "remedies": ["Effective remedy"],
    "caveats": [
      "This interpretation is not itself a case-specific judgment."
    ]
  },
  "technical_profile": {
    "system_type": "network_measurement",
    "methods": ["Active reachability tests", "Control comparison"],
    "technical_layers": ["dns", "tcp_ip", "tls", "http"],
    "collection_modes": ["active_measurement", "volunteer_measurement"],
    "signals": ["DNS, TCP, TLS, and HTTP anomalies"],
    "cadence": "continuous",
    "geographic_resolution": "Country and network where coverage exists",
    "temporal_resolution": "Per measurement",
    "data_access": ["open_data", "public_dashboard", "public_api"],
    "validation_requirements": [
      "Inspect raw measurements, repeated patterns, controls, and independent context."
    ],
    "limitations": [
      "Coverage is uneven and an anomaly can be a false positive.",
      "The method does not by itself establish actor or intent."
    ]
  },
  "evidence_profile": {
    "role": "verification",
    "methods": [
      "cross_source_corroboration",
      "metadata_review",
      "geolocation",
      "chronolocation"
    ],
    "artifact_handling": [
      "context_recorded",
      "original_preserved",
      "hash_recorded"
    ],
    "privacy_practices": [
      "identity_minimization",
      "location_minimization",
      "do_no_harm_review"
    ],
    "claim_status": "not_assessed",
    "limitations": [
      "Metadata can be absent, altered, or misleading and must be corroborated."
    ]
  },
  "safety_profile": {
    "sensitivity": "context_limited",
    "exclusions": [
      "personal_identifiers",
      "live_location",
      "device_or_account_identifier",
      "participant_roster"
    ],
    "display_note": "Use aggregate patterns and do not identify individual participants."
  }
}
```

Omit optional profiles that do not apply. Do not emit empty profile objects.
Use `null` only for an unknown `published_date`, `year`, or technical resolution.

## Controlled values

### Core

- `resource_type`: `article`, `book`, `case_law`, `dataset`, `guide`,
  `legal_standard`, `methodology`, `monitor`, `report`,
  `technical_standard`, `tool`, `treaty`, `video`, `website`.
- `access`: `open`, `partial`, `paywalled`, `unknown`.
- `verification_status`: `verified`, `partially_verified`, `needs_review`,
  `unavailable`.
- `taxonomy.primary_topic` and `taxonomy.topics`: `case_research`,
  `movement_theory`, `civil_resistance`, `digital_repression`,
  `digital_rights`, `platform_governance`, `secure_communications`,
  `connectivity_monitoring`, `surveillance_forensics`, `osint_evidence`,
  `media_verification`, `legal_rights`, `legal_remedies`,
  `political_transition`, `safety_ethics`.

### Authority and provenance

- `source_class`: `academic`, `court`, `international_organization`,
  `local_civil_society`, `media`, `network_measurement_project`, `publisher`,
  `regional_human_rights_body`, `rights_organization`,
  `technical_operator`, `think_tank`, `tool_developer`, `treaty_body`,
  `university`.
- `material_role`: `case_reporting`, `comparative_analysis`,
  `legal_interpretation`, `methodology`, `monitoring`, `primary_law`,
  `research_synthesis`, `safety_guidance`, `tool_documentation`.

`organization_id` identifies the publishing body. `independence_group`
identifies editorial or institutional control and is the field used for
corroboration. Sister pages or co-branded reports under the same controlling
organization must normally share one independence group.

### Legal profile

- `system`: `universal`, `african`, `european`, `inter_american`, `domestic`,
  `cross_regional`.
- `authority_level`: `binding_treaty`, `binding_case_law`,
  `authoritative_interpretation`, `non_binding_guidance`,
  `institutional_analysis`.
- `rights`: `right_to_life`, `freedom_from_torture`,
  `freedom_of_expression`, `peaceful_assembly`, `freedom_of_association`,
  `privacy`, `liberty_and_security`, `due_process`, `non_discrimination`,
  `effective_remedy`, `access_to_information`.
- `restriction_tests`: `prescribed_by_law`, `legitimate_aim`, `necessity`,
  `proportionality`, `least_intrusive_means`, `non_discrimination`,
  `due_process`, `prior_authorization`, `independent_oversight`,
  `accountability`.

The field combines substantive restriction tests with procedural safeguards;
do not imply that every right or instrument uses every listed value in the same
way. Explain article-specific differences in `caveats`.

Every `treaty`, `case_law`, or `legal_standard` record requires a
`legal_profile`. State the jurisdiction or addressee in `applies_to`. Put
reservations, non-binding status, regional limits, admissibility limits, and
the difference between general standards and case-specific holdings in
`caveats`.

### Technical profile

- `system_type`: `network_measurement`, `outage_monitor`,
  `censorship_observatory`, `performance_measurement`, `device_forensics`,
  `evidence_capture`, `provenance_tool`, `digital_archive`, `osint_directory`,
  `secure_communications`, `censorship_circumvention`.
- `technical_layers`: `dns`, `tcp_ip`, `tls`, `http`, `routing_bgp`,
  `network_traffic`, `active_probing`, `internet_background_radiation`,
  `device`, `media_metadata`, `platform_content`, `visual_geospatial`,
  `application_layer`.
- `collection_modes`: `active_measurement`, `passive_observation`,
  `remote_measurement`, `volunteer_measurement`, `contextual_reporting`,
  `forensic_acquisition`, `controlled_capture`, `manual_investigation`,
  `mixed`, `not_applicable`.
- `data_access`: `open_data`, `public_dashboard`, `public_api`, `download`,
  `tool_output`, `controlled`, `documentation_only`, `unknown`.
- `cadence`: `continuous`, `periodic`, `event_driven`, `on_demand`, `static`.

Every `monitor` record requires a `technical_profile`. Describe what the system
actually observes, not what a marketing page implies. Record sampling bias,
coverage gaps, false positives, aggregation effects, licensing constraints,
privacy exposure, and attribution limits.

### OSINT and evidence profile

- `role`: `methodology`, `capture`, `preservation`, `verification`, `archive`,
  `investigation`.
- `methods`: `source_discovery`, `cross_source_corroboration`,
  `metadata_review`, `geolocation`, `chronolocation`, `visual_comparison`,
  `satellite_imagery`, `document_authentication`, `archive_capture`,
  `hash_verification`, `chain_of_custody`, `network_measurement`.
- `artifact_handling`: `context_recorded`, `original_preserved`,
  `hash_recorded`, `archived_copy`, `chain_of_custody_documented`.
- `privacy_practices`: `consent_considered`, `identity_minimization`,
  `location_minimization`, `redaction_considered`, `do_no_harm_review`.
- `claim_status`: `normative_standard`, `publisher_observation`,
  `reported_allegation`, `corroborated_finding`, `contested`, `not_assessed`.

Verification must be reproducible at a safe level: preserve the original,
record acquisition time and context, hash where appropriate, separate
observation from inference, seek independent corroboration, and document
limitations. Do not expose sensitive source details merely to make a method
appear reproducible.

### Safety profile

- `sensitivity`: `public`, `context_limited`, `do_not_publish`.
- `exclusions`: `personal_identifiers`, `live_location`, `participant_roster`,
  `device_or_account_identifier`, `evasion_instructions`,
  `unredacted_sensitive_media`.

Records marked `do_not_publish` must not enter the public atlas. The research
batch must omit personal contact information, participant rosters, live
locations, persistent device/account identifiers, doxxing material,
individualized evasion playbooks, or unredacted sensitive media.

## Cross-field validation

1. `schema_version` must equal `3`.
2. `published_date` and `last_checked` must be real ISO calendar dates.
3. When both exist, `year` must equal the year in `published_date`.
4. `taxonomy.primary_topic` must appear in `taxonomy.topics`.
5. Legal profiles require `legal_rights` or `legal_remedies` in `topics`.
6. Technical profiles require a relevant technical topic.
7. Evidence profiles require `osint_evidence` or `media_verification`.
8. Arrays must not contain duplicate values.
9. Deduplicate records by canonical URL, DOI, official document identifier,
   and normalized title.
10. `case_ids` must resolve to known case identifiers.
11. A factual case summary needs at least two credible sources from at least
    two `independence_group` values. Otherwise label it
    `corroboration_limited` or keep it on the watchlist.

## Research batch output

Return:

1. `records`: only new or materially changed v3 records.
2. `case_updates`: proposed case links or status changes, with source IDs and
   independence groups.
3. `deduplication`: canonical-URL, title, DOI, and document-ID matches.
4. `gaps`: missing regions, languages, local sources, authority levels,
   measurement coverage, or independent corroboration.
5. `review_notes`: disputes, failed access checks, safety exclusions, and
   questions that require a human reviewer.

Do not silently fill missing metadata, collapse competing claims, infer legal
violations from a monitor signal, or turn general tool documentation into
individualized security advice.
