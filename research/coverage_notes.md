# Gen Z Protest Atlas research coverage

Checked: 2026-07-29. This pass combined the supplied outline with a live,
primary-source web review of international and regional rights standards,
connectivity monitors, digital-forensics methods, and OSINT/evidence tools. It
is a research inventory, not a claim that the web is exhaustively indexed, that
monitoring data proves attribution, or that any source settles disputed events.

## Method

1. Preferred official treaty bodies, courts, regional human-rights systems,
   measurement projects, technical operators, tool developers, local civil
   society, university research centers, and publisher/author pages.
2. Separated metadata verification, claim status, legal authority, technical
   observation, attribution, and publication safety. These fields cannot be
   collapsed into one confidence label.
3. Verified title, publisher, author when displayed, date/year, topical scope,
   geography, method, access conditions, and canonical URL before assigning
   `verified`. Assigned `partially_verified` when the exact document could not
   be loaded, its date was not established, or a method/detail remained
   dependent on publisher metadata.
4. Recorded `null` for unknown publication dates or years. A monitor without a
   publication date is not treated as undated evidence: measurement timestamps
   must be evaluated separately when the monitor is used.
5. Required a legal profile for treaties, case law, and legal standards, with
   system, authority level, instrument, addressee, protected rights,
   restriction tests, remedies, and caveats.
6. Required a technical profile for monitors, including collection method,
   technical layers, signals, cadence, geographic and temporal resolution,
   data access, validation requirements, and limitations.
7. Recorded OSINT/evidence methods separately from claim strength. Metadata,
   hashes, chain of custody, and content credentials can support authenticity
   and integrity but do not independently prove the truth or legality of a
   depicted event.
8. Included factual case summaries only when at least two source records from
   at least two editorially independent groups supported the bounded narrative.
   Morocco is now explicitly `Corroboration limited` because its two cited
   records share one Amnesty independence group. India remains a watchlist item.
9. Excluded personal identifiers, participant rosters, live locations,
   persistent device/account identifiers, unredacted sensitive media, and
   individualized evasion instructions from the public dataset.
10. Avoided exact casualty totals, arrest totals, platform-effect claims,
    surveillance attribution, and constitutional conclusions when sources
    differed, were preliminary, or lacked independent corroboration.

## Structural limitation: the corpus is entirely English

Every one of the 61 records has `language: "English"`. This is not a marginal
diversity gap; it is a structural boundary on what the inventory can support.

The cases span Nepal, Indonesia, Iran, Sudan, Morocco, Serbia, Bangladesh,
Kenya, Sri Lanka, and Madagascar. For each, the corpus reflects what
international organisations, anglophone media, and English-publishing academics
recorded — not what local journalists, domestic courts, national human-rights
institutions, or local civil society recorded in Bengali, Nepali, Bahasa
Indonesia, Persian, Arabic, Serbian, Swahili, Sinhala, Tamil, or Malagasy.

Consequences to carry forward:

1. Domestic legal analysis is absent. The international layer cannot substitute
   for constitutions, statutes, emergency orders, and national case law.
2. Local contestation of contested events is under-represented, which
   systematically favours the framing of large international publishers.
3. Publisher-concentration risk is amplified: Amnesty International is the modal
   organisation in the corpus at 7 records.

The site states this limitation on its overview rather than leaving it in this
file. Sourcing in local languages is the highest-value next addition.

## Coverage counts

- 61 source records total: 41 `verified`, 19 `partially_verified`, and 1
  `needs_review`.
- 9 independently corroborated case summaries: Bangladesh, Kenya, Nepal,
  Serbia, Madagascar, Indonesia, Iran, Sri Lanka, and Sudan.
- 1 case with limited publisher independence: Morocco.
- 1 current watchlist case without a factual summary: India, July 2026.
- 15 records with structured legal profiles; 19 with technical profiles; 12
  with OSINT/evidence profiles; and 18 with explicit safety profiles.
- Cross-cutting coverage: movement theory; civil resistance; digital
  repression; international and regional rights; use-of-force standards;
  secure communications; shutdown and censorship measurement; device
  forensics; documentation, provenance, geolocation, chronolocation,
  preservation, and chain of custody.

## Legal and international-rights coverage

The legal layer distinguishes force from persuasiveness:

- **Universal binding law:** the ICCPR is recorded as a binding treaty for
  states parties. Its application depends on ratification, reservations,
  jurisdiction, and the facts of a case.
- **Authoritative interpretation:** Human Rights Committee General Comments
  Nos. 34, 35, 36, and 37 cover expression, liberty/security, life/use of force,
  and peaceful assembly. They interpret the treaty but are not themselves
  case-specific judgments.
- **UN guidance:** the Basic Principles on the Use of Force and Firearms, the
  UN Human Rights Guidance on Less-Lethal Weapons, the internet-shutdown
  report, the digital-privacy report, and the Model Protocol for Law
  Enforcement Officials add operational standards and analysis. They are not
  all binding instruments.
- **Regional systems:** ACHPR policing-and-assembly guidance, IACHR Internet
  standards, OSCE/Venice Commission assembly guidelines, and the ECtHR
  judgment in *Catt v. the United Kingdom* add African, inter-American,
  cross-regional, and European perspectives. Their legal reach differs by
  system and instrument.

The structured rights vocabulary covers life, freedom from torture,
expression, peaceful assembly, association, privacy, liberty/security, due
process, non-discrimination, information, and effective remedy. Restriction and
safeguards analysis tracks legality, legitimate aim, necessity,
proportionality, least intrusive means, non-discrimination, due process,
authorization, oversight, and accountability; not every right or instrument
uses every element in the same way.

## Monitoring, forensics, and OSINT coverage

- **OONI Explorer** exposes volunteer measurements at DNS, TCP, TLS, HTTP, and
  application layers. An anomaly can be a false positive; coverage is uneven;
  and a measurement does not establish intent or actor.
- **IODA** combines active probing, BGP routing, and internet-background-
  radiation signals. It is strongest for convergent disruption detection, not
  legal or political attribution.
- **Censored Planet** provides remote censorship measurements. Raw anomalies
  require method-specific validation and contextual corroboration.
- **Cloudflare Radar** provides traffic and routing-derived outage views from
  Cloudflare's network vantage point. It is neither universal coverage nor a
  neutral census of all networks, and reuse is subject to its published data
  terms.
- **Access Now STOP** adds documented shutdown episodes and contextual
  reporting. It is non-exhaustive and should be read alongside technical
  signals rather than substituted for them.
- **M-Lab ndt7** measures user-to-server network performance. Public test data
  can include client IP-related fields; it is not a censorship detector by
  itself.
- **Mobile Verification Toolkit** supports forensic extraction and indicator
  matching. A clean result does not prove a device is uncompromised, indicators
  are incomplete, and interpretation requires expertise.
- **Mnemonic, eyeWitness, Tella, ProofMode, C2PA, the Berkeley Protocol, and
  Bellingcat** cover capture, preservation, hashing, provenance, metadata
  review, geolocation, chronolocation, and tool discovery. All retain explicit
  limits: provenance is not truth, IP geolocation is approximate, and
  reproducibility must not expose vulnerable people.

## Case and section coverage

| Outline area | Status | Evidence notes |
| --- | --- | --- |
| Global Gen Z framing and platform/organization theory | Covered | Chenoweth/Cebul, Carnegie, Tufekci, and Bennett/Segerberg establish the analytical vocabulary. The books/hosted PDFs require a final click-through check before a public reading-list release. |
| Civil resistance, transition, and nonviolent strategy | Covered | Chenoweth/Stephan and ICNC are included. The outline's larger tactic, CANVAS, and War Resisters sets were not individually converted to records in this bounded pass; retain them as leads pending exact-link checks. |
| Digital repression, legal rights, and protest safety | Expanded | The ICCPR; HRC General Comments 34–37; UN force, less-lethal, privacy, shutdown, and protest-investigation guidance; regional standards; Amnesty; Freedom House; EFF; and OONI now separate legal force, reporting, measurement, and safety. |
| Secure/offline tools and shutdown resilience | Partly covered | Signal, Briar, Ceno, and OONI official materials are represented. Tor, Psiphon, Meshtastic, and Tails remain outline leads awaiting a current documentation/version review; tool inclusion must never be read as individualized safety advice. |
| Connectivity monitoring and digital forensics | Expanded | OONI, IODA, Censored Planet, Cloudflare Radar, Access Now STOP, M-Lab ndt7, MVT, and Amnesty Security Lab are represented with method, signal, resolution, validation, privacy, and attribution limits. |
| Evidence and OSINT | Expanded | WITNESS, the Berkeley Protocol, Mnemonic, eyeWitness, Tella, ProofMode, C2PA, and Bellingcat cover collection through verification and preservation. Each profile states what the method cannot establish. |
| Bangladesh | Covered | Amnesty's contemporaneous investigation is read alongside comparative Carnegie and Journal of Democracy analysis. |
| Kenya | Covered | HRW's investigation is read alongside global youth-protest/digital-pressure analysis. A Kenya-specific platform-use study remains a useful next addition. |
| Nepal | Covered | Two Carnegie sources and the Journal of Democracy support conservative treatment of the protest and transition; claims of formal authority for Discord are excluded. |
| Serbia | Covered | Journal of Democracy documents organization; the Amnesty/Civil Rights Defenders statement covers reported state response. |
| Morocco | Covered with publisher-diversity caveat | Amnesty's 2025 case report and its 2026 youth-activism report support the basics, but a non-Amnesty Moroccan/academic source should be added before deeper inference. |
| Madagascar | Covered | SWP and Amnesty independently cover the protest/transition arc and ensuing rights concerns. |
| Indonesia | Covered | Two Amnesty investigations plus Carnegie's regional account support conservative factual claims; a local or independent academic source would improve source diversity. |
| Iran | Covered | ARTICLE 19 supports the 2022 digital-repression account; HRW's 2026 blackout is retained as a distinct later episode, not conflated with the protest period. |
| Sri Lanka | Covered | CPA's local survey work and Carnegie's retrospective analysis provide complementary evidence. |
| Sudan | Covered | TIMEP corroborates the committees' decentralized anti-coup protest role, while PeaceRep covers social protection and humanitarian relief. The case is deliberately not described as a simple Gen Z analogue. |
| India, July 2026 | Watchlist only | HRW provides a detailed, very recent account of 20 July events. It needs a second independent source and time for reliable outcome assessment before moving into the case-summary file. |

## Corrections, questionable links, and omissions from the outline

- **Amnesty Gen Z report:** the outline linked a direct upload path (`IOR4011182026ENGLISH.pdf`). The live canonical record is [IOR 40/1118/2026](https://www.amnesty.org/en/documents/ior40/1118/2026/en/), dated 5 June 2026.
- **Freedom on the Net 2025:** the outline's `2025-11` filename was not the live record returned by Freedom House. This inventory uses the 2025 final PDF returned by the publisher, dated 5 December 2025.
- **Telegram FAQ link:** the outline points to a language-path URL ending in `/faq/kk?setln=en`; it was not retained because it is not the clearest canonical English reference for encryption claims. Any app-security language should be rechecked against current official documentation.
- **Hosted PDFs and secondary hosts:** the John Cabot University copy of *The Logic of Connective Action*, several ICNC/WRI PDFs, and the source outline's direct PDFs remain `partially_verified` unless their exact response, current availability, and rights status are checked immediately before public publication.
- **Unrecorded but plausible leads:** the outline's Carnegie Morocco analysis,
  HRW Morocco article, Amnesty Nepal inquiry materials, Access Now Bangladesh
  material, ECNL Iran report, Stanford Sri Lanka analysis, Protection
  International, CANVAS, Tor, Tails, Psiphon, and Meshtastic pages remain leads,
  not rejected facts.
- **Monitor interoperability:** no automated inference merges OONI, IODA,
  Censored Planet, Cloudflare Radar, STOP, or M-Lab into a single “shutdown
  score.” They observe different layers, populations, and time windows.
- **Forensic claims:** the Serbia Cellebrite record documents Amnesty Security
  Lab's published finding and method limits. It is not a general claim about
  every device, deployment, or operator.
- **Do not carry forward without fresh verification:** numerical assertions such as global protest counts, shutdown totals, death totals, detention totals, alleged surveillance systems, and election/transition outcomes. The inventory uses only bounded claims that the reviewed source records directly support.

## Maintenance

`last_checked` is a single batch stamp (2026-07-29) across all 61 records, not a
per-source verification date. Freshness is therefore a property of this pass.
Two mechanisms now hold it accountable:

- `pnpm check:links` requests every canonical URL, archived snapshot, and
  visual-archive context source and reports what is unreachable or has moved. A
  weekly workflow runs it and files a report. It never edits records: promoting
  a failure into `verification_status` stays a human decision.
- The site marks the corpus stale once `last_checked` passes 180 days and tells
  readers to verify against the publisher before citing.

`identifiers.archived_url` is defined by the contract and currently unused —
zero records carry a snapshot. For a corpus about protest and state repression,
where takedowns are a predictable failure mode, filling it is the single change
that most extends the inventory's shelf life. Treat it as required before a
record is promoted to `verified` in the next pass.

## Recommended next research pass

1. Add independent local and non-Amnesty sources for Morocco; strengthen local
   source diversity for Indonesia; and obtain a second independent source for
   the India watchlist. Prioritise local-language material throughout — see the
   structural limitation above.
2. Add domestic constitutions, statutes, emergency orders, court decisions, and
   national human-rights-institution material case by case. The international
   layer cannot substitute for domestic legal analysis.
3. Add country-specific OONI, IODA, Censored Planet, Cloudflare Radar, and STOP
   observations only after aligning timestamps, networks, collection methods,
   baseline periods, and known coverage gaps.
4. Record archive snapshots and exact data-license terms where monitor output
   will be reproduced rather than merely linked.
5. Have legal, regional, language, measurement, and digital-forensics reviewers
   assess any public claims before treating the corpus as publication-ready.
