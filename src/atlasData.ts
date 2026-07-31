/**
 * Runtime atlas data.
 *
 * The JSON corpus is a build-time constant. It is validated against the v3
 * contract by `src/corpus.test.ts` (wired into `prebuild` via `check:corpus`)
 * and by the unit tests, so this module asserts the contract rather than
 * re-parsing it in the browser. Nothing here may import Zod.
 */
import type { CaseSummary, SourceRecord } from "./atlasSchema";
import rawCaseSummaries from "./data/case_summaries.json";
import rawSources from "./data/verified_sources.json";
import { isStale } from "./freshness";
import { humanizeValue, topicOptions, type TopicCode } from "./vocabulary";

export {
  accessLevels,
  humanizeValue,
  resourceTypes,
  topicOptions,
  verificationStatuses,
  type TopicCode,
} from "./vocabulary";
export { STALE_AFTER_DAYS, daysSince, isStale } from "./freshness";
export type { CaseSummary, SourceRecord } from "./atlasSchema";

export type ResourceType = SourceRecord["resource_type"];
export type VerificationStatus = SourceRecord["verification_status"];

export const sourceRecords = rawSources as unknown as SourceRecord[];
export const caseSummaries = rawCaseSummaries as unknown as CaseSummary[];

const topicLabels = new Map<TopicCode, string>(
  topicOptions.map((option) => [option.value, option.label]),
);

export type AtlasCase = {
  id: string;
  name: string;
  period: string;
  geography: string;
  summary: string;
  sourceIds: string[];
  evidenceNote: string;
  status: "Corroborated" | "Corroboration limited" | "Watchlist";
};

export type AtlasFilters = {
  caseId: string;
  topic: string;
  resourceType: string;
  geography: string;
  sourceClass: string;
  year: string;
  verification: string;
};

export const initialFilters: AtlasFilters = {
  caseId: "",
  topic: "",
  resourceType: "",
  geography: "",
  sourceClass: "",
  year: "",
  verification: "",
};

/**
 * Sentinel for the year filter. 17 records carry `year: null` — standing tools
 * and guides with no fixed publication year — so a bare year selection would
 * otherwise make them unreachable rather than merely unranked.
 */
export const UNDATED_YEAR = "undated";

/**
 * Geography terms are recorded at the scale each source itself claims, so this
 * vocabulary deliberately mixes cities, countries, regions and legal-system
 * areas ("New Delhi", "Kenya", "Africa", "Council of Europe", "Global"). It is
 * not a geocoded hierarchy: selecting "Africa" does not roll up the African
 * country records, and selecting "Kenya" does not pull in "Global" material
 * that also covers Kenya.
 */
export const geographyOptions: Array<{ label: string; value: string }> = [
  ...new Set(sourceRecords.flatMap((record) => record.geographies)),
]
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ label: value, value }));

export const sourceClassOptions: Array<{ label: string; value: string }> = [
  ...new Set(sourceRecords.map((record) => record.authority.source_class)),
]
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ label: humanizeValue(value), value }));

export const undatedSourceCount = sourceRecords.filter(
  (record) => record.year === null,
).length;

const sourceById = new Map(sourceRecords.map((source) => [source.id, source]));
const summarizedSourceIds = new Set(caseSummaries.flatMap((record) => record.source_ids));

function independenceGroupsFor(sourceIds: string[]): string[] {
  return [
    ...new Set(
      sourceIds.flatMap((id) => {
        const source = sourceById.get(id);
        return source ? [source.authority.independence_group] : [];
      }),
    ),
  ];
}

const corroboratedCases: AtlasCase[] = caseSummaries.map((record) => {
  const independenceGroups = independenceGroupsFor(record.source_ids);
  const limited = independenceGroups.length < 2;

  return {
    id: record.case_id,
    name: record.case_name,
    period: record.period,
    geography: record.geography,
    summary: record.summary,
    sourceIds: record.source_ids,
    evidenceNote: limited
      ? `${record.corroboration_note} Publisher diversity is limited: the cited records share one independence group.`
      : record.corroboration_note,
    status: limited ? "Corroboration limited" : "Corroborated",
  };
});

const watchlistCases: AtlasCase[] = sourceRecords
  .filter(
    (source) =>
      source.verification_status === "needs_review" &&
      source.cases.length > 0 &&
      !summarizedSourceIds.has(source.id),
  )
  .map((source) => ({
    id: `watchlist-${source.id}`,
    name: source.cases[0] ?? source.title,
    period: source.year?.toString() ?? "Date unverified",
    geography: source.geographies[0] ?? "Geography unverified",
    summary: source.summary,
    sourceIds: [source.id],
    evidenceNote: `${source.relevance} ${source.verification_notes}`,
    status: "Watchlist",
  }));

export const atlasCases = [...corroboratedCases, ...watchlistCases];

const caseNameById = new Map(atlasCases.map((record) => [record.id, record.name]));

/** Case identifiers a source is tagged with, resolved to display names. */
export function relatedCasesFor(source: SourceRecord): Array<{ id: string; name: string }> {
  return (source.case_ids ?? []).flatMap((id) => {
    const name = caseNameById.get(id);
    return name ? [{ id, name }] : [];
  });
}

/**
 * The corpus carries one batch `last_checked` stamp rather than per-source
 * dates, so freshness is a property of the whole pass.
 */
export const corpusLastChecked =
  sourceRecords.map((record) => record.last_checked).sort((a, b) => b.localeCompare(a))[0] ?? "";

export function corpusIsStale(now: Date = new Date()): boolean {
  return corpusLastChecked.length > 0 && isStale(corpusLastChecked, now);
}

export function getSourceById(id: string): SourceRecord | undefined {
  return sourceById.get(id);
}

export function getSourceTopic(source: SourceRecord): string {
  return (
    topicLabels.get(source.taxonomy.primary_topic) ?? humanizeValue(source.taxonomy.primary_topic)
  );
}

export function matchesQuery(value: string, query: string): boolean {
  return value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

function linkedSources(record: AtlasCase): SourceRecord[] {
  return record.sourceIds.flatMap((id) => {
    const source = sourceById.get(id);
    return source ? [source] : [];
  });
}

function structuredSearchTerms(record: SourceRecord): string[] {
  const terms = [
    record.taxonomy.primary_topic,
    ...record.taxonomy.topics,
    record.authority.source_class,
    record.authority.material_role,
    record.authority.organization_id,
  ];

  if (record.legal_profile) {
    terms.push(
      record.legal_profile.system,
      record.legal_profile.authority_level,
      ...record.legal_profile.instruments,
      ...record.legal_profile.applies_to,
      ...record.legal_profile.rights,
      ...record.legal_profile.restriction_tests,
      ...record.legal_profile.remedies,
      ...record.legal_profile.caveats,
    );
  }

  if (record.technical_profile) {
    terms.push(
      record.technical_profile.system_type,
      ...record.technical_profile.methods,
      ...record.technical_profile.technical_layers,
      ...record.technical_profile.collection_modes,
      ...record.technical_profile.signals,
      ...record.technical_profile.data_access,
      ...record.technical_profile.validation_requirements,
      ...record.technical_profile.limitations,
    );
  }

  if (record.evidence_profile) {
    terms.push(
      record.evidence_profile.role,
      ...record.evidence_profile.methods,
      ...record.evidence_profile.artifact_handling,
      ...record.evidence_profile.privacy_practices,
      record.evidence_profile.claim_status,
      ...record.evidence_profile.limitations,
    );
  }

  if (record.safety_profile) {
    terms.push(
      record.safety_profile.sensitivity,
      ...record.safety_profile.exclusions,
      record.safety_profile.display_note,
    );
  }

  return terms.flatMap((term) => [term, humanizeValue(term)]);
}

/**
 * Search text is derived once per record at module load rather than rebuilt on
 * every keystroke, so query cost stays linear in the corpus instead of linear
 * in corpus × renders.
 */
const caseSearchText = new Map<string, string>(
  atlasCases.map((record) => [
    record.id,
    [
      record.name,
      record.period,
      record.geography,
      record.summary,
      record.evidenceNote,
      record.status,
      ...linkedSources(record).flatMap((source) => [
        source.title,
        source.publisher,
        ...source.authors,
        ...source.themes,
        ...structuredSearchTerms(source),
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase(),
  ]),
);

const sourceSearchText = new Map<string, string>(
  sourceRecords.map((record) => [
    record.id,
    [
      record.title,
      record.publisher,
      record.year?.toString() ?? "",
      record.summary,
      record.relevance,
      record.verification_notes,
      record.language,
      ...record.authors,
      ...record.geographies,
      ...record.cases,
      ...record.themes,
      ...structuredSearchTerms(record),
    ]
      .join(" ")
      .toLocaleLowerCase(),
  ]),
);

export function filterCases(
  records: AtlasCase[],
  filters: AtlasFilters,
  query: string,
): AtlasCase[] {
  const needle = query.trim().toLocaleLowerCase();

  return records.filter((record) => {
    if (needle && !(caseSearchText.get(record.id) ?? "").includes(needle)) return false;
    if (filters.caseId && record.id !== filters.caseId) return false;
    // A case period is never "undated", so that selection is answered by its
    // cited sources rather than by the period string.
    if (filters.year && filters.year !== UNDATED_YEAR && !record.period.includes(filters.year)) {
      return false;
    }

    if (
      !filters.topic &&
      !filters.resourceType &&
      !filters.geography &&
      !filters.sourceClass &&
      !filters.verification &&
      filters.year !== UNDATED_YEAR
    ) {
      return true;
    }

    const sources = linkedSources(record);
    return (
      (!filters.topic ||
        sources.some((source) => source.taxonomy.topics.includes(filters.topic as TopicCode))) &&
      (!filters.resourceType ||
        sources.some((source) => source.resource_type === filters.resourceType)) &&
      (!filters.geography ||
        record.geography === filters.geography ||
        sources.some((source) => source.geographies.includes(filters.geography))) &&
      (!filters.sourceClass ||
        sources.some((source) => source.authority.source_class === filters.sourceClass)) &&
      (filters.year !== UNDATED_YEAR || sources.some((source) => source.year === null)) &&
      (!filters.verification ||
        sources.some((source) => source.verification_status === filters.verification))
    );
  });
}

export function filterSources(
  records: SourceRecord[],
  filters: AtlasFilters,
  query: string,
): SourceRecord[] {
  const needle = query.trim().toLocaleLowerCase();
  const selectedCase = filters.caseId
    ? atlasCases.find((record) => record.id === filters.caseId)
    : undefined;
  const citedIds = selectedCase ? new Set(selectedCase.sourceIds) : undefined;

  return records.filter((record) => {
    if (needle && !(sourceSearchText.get(record.id) ?? "").includes(needle)) return false;
    if (citedIds && !citedIds.has(record.id)) return false;
    if (filters.topic && !record.taxonomy.topics.includes(filters.topic as TopicCode)) return false;
    if (filters.resourceType && record.resource_type !== filters.resourceType) return false;
    if (filters.geography && !record.geographies.includes(filters.geography)) return false;
    if (filters.sourceClass && record.authority.source_class !== filters.sourceClass) return false;
    if (filters.year) {
      const matchesYear =
        filters.year === UNDATED_YEAR
          ? record.year === null
          : record.year?.toString() === filters.year;
      if (!matchesYear) return false;
    }
    if (filters.verification && record.verification_status !== filters.verification) return false;
    return true;
  });
}

/** Language coverage, surfaced because English-only sourcing is a real limit. */
export const languageBreakdown = [
  ...sourceRecords
    .reduce((counts, record) => {
      counts.set(record.language, (counts.get(record.language) ?? 0) + 1);
      return counts;
    }, new Map<string, number>())
    .entries(),
].sort((a, b) => b[1] - a[1]);
