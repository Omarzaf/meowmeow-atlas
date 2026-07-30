import { z } from "zod";
import rawCaseSummaries from "./data/case_summaries.json";
import rawSources from "./data/verified_sources.json";

export const resourceTypes = [
  "article",
  "book",
  "case_law",
  "dataset",
  "guide",
  "legal_standard",
  "methodology",
  "monitor",
  "report",
  "technical_standard",
  "tool",
  "treaty",
  "video",
  "website",
] as const;

export const accessLevels = ["open", "partial", "paywalled", "unknown"] as const;
export const verificationStatuses = [
  "verified",
  "partially_verified",
  "needs_review",
  "unavailable",
] as const;

export const topicCodes = [
  "case_research",
  "movement_theory",
  "civil_resistance",
  "digital_repression",
  "digital_rights",
  "platform_governance",
  "secure_communications",
  "connectivity_monitoring",
  "surveillance_forensics",
  "osint_evidence",
  "media_verification",
  "legal_rights",
  "legal_remedies",
  "political_transition",
  "safety_ethics",
] as const;

export const sourceClasses = [
  "academic",
  "court",
  "international_organization",
  "local_civil_society",
  "media",
  "network_measurement_project",
  "publisher",
  "regional_human_rights_body",
  "rights_organization",
  "technical_operator",
  "think_tank",
  "tool_developer",
  "treaty_body",
  "university",
] as const;

export const materialRoles = [
  "case_reporting",
  "comparative_analysis",
  "legal_interpretation",
  "methodology",
  "monitoring",
  "primary_law",
  "research_synthesis",
  "safety_guidance",
  "tool_documentation",
] as const;

export const legalSystems = [
  "universal",
  "african",
  "european",
  "inter_american",
  "domestic",
  "cross_regional",
] as const;

export const authorityLevels = [
  "binding_treaty",
  "binding_case_law",
  "authoritative_interpretation",
  "non_binding_guidance",
  "institutional_analysis",
] as const;

export const protectedRights = [
  "right_to_life",
  "freedom_from_torture",
  "freedom_of_expression",
  "peaceful_assembly",
  "freedom_of_association",
  "privacy",
  "liberty_and_security",
  "due_process",
  "non_discrimination",
  "effective_remedy",
  "access_to_information",
] as const;

export const restrictionTests = [
  "prescribed_by_law",
  "legitimate_aim",
  "necessity",
  "proportionality",
  "least_intrusive_means",
  "non_discrimination",
  "due_process",
  "prior_authorization",
  "independent_oversight",
  "accountability",
] as const;

export const technicalSystemTypes = [
  "network_measurement",
  "outage_monitor",
  "censorship_observatory",
  "performance_measurement",
  "device_forensics",
  "evidence_capture",
  "provenance_tool",
  "digital_archive",
  "osint_directory",
  "secure_communications",
  "censorship_circumvention",
] as const;

export const technicalLayers = [
  "dns",
  "tcp_ip",
  "tls",
  "http",
  "routing_bgp",
  "network_traffic",
  "active_probing",
  "internet_background_radiation",
  "device",
  "media_metadata",
  "platform_content",
  "visual_geospatial",
  "application_layer",
] as const;

export const collectionModes = [
  "active_measurement",
  "passive_observation",
  "remote_measurement",
  "volunteer_measurement",
  "contextual_reporting",
  "forensic_acquisition",
  "controlled_capture",
  "manual_investigation",
  "mixed",
  "not_applicable",
] as const;

export const dataAccessModes = [
  "open_data",
  "public_dashboard",
  "public_api",
  "download",
  "tool_output",
  "controlled",
  "documentation_only",
  "unknown",
] as const;

export const evidenceRoles = [
  "methodology",
  "capture",
  "preservation",
  "verification",
  "archive",
  "investigation",
] as const;

export const evidenceMethods = [
  "source_discovery",
  "cross_source_corroboration",
  "metadata_review",
  "geolocation",
  "chronolocation",
  "visual_comparison",
  "satellite_imagery",
  "document_authentication",
  "archive_capture",
  "hash_verification",
  "chain_of_custody",
  "network_measurement",
] as const;

export const claimStatuses = [
  "normative_standard",
  "publisher_observation",
  "reported_allegation",
  "corroborated_finding",
  "contested",
  "not_assessed",
] as const;

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const taxonomySchema = z.strictObject({
  primary_topic: z.enum(topicCodes),
  topics: z.array(z.enum(topicCodes)).min(1),
});

const authoritySchema = z.strictObject({
  source_class: z.enum(sourceClasses),
  organization_id: z.string().min(1),
  independence_group: z.string().min(1),
  material_role: z.enum(materialRoles),
});

const identifiersSchema = z.strictObject({
  doi: z.string().min(1).optional(),
  official_document_id: z.string().min(1).optional(),
  archived_url: z.string().url().optional(),
});

const legalProfileSchema = z.strictObject({
  system: z.enum(legalSystems),
  authority_level: z.enum(authorityLevels),
  instruments: z.array(z.string().min(1)).min(1),
  applies_to: z.array(z.string().min(1)).min(1),
  rights: z.array(z.enum(protectedRights)).min(1),
  restriction_tests: z.array(z.enum(restrictionTests)),
  remedies: z.array(z.string().min(1)),
  caveats: z.array(z.string().min(1)).min(1),
});

const technicalProfileSchema = z.strictObject({
  system_type: z.enum(technicalSystemTypes),
  methods: z.array(z.string().min(1)).min(1),
  technical_layers: z.array(z.enum(technicalLayers)).min(1),
  collection_modes: z.array(z.enum(collectionModes)).min(1),
  signals: z.array(z.string().min(1)).min(1),
  cadence: z.enum(["continuous", "periodic", "event_driven", "on_demand", "static"]),
  geographic_resolution: z.string().min(1).nullable(),
  temporal_resolution: z.string().min(1).nullable(),
  data_access: z.array(z.enum(dataAccessModes)).min(1),
  validation_requirements: z.array(z.string().min(1)).min(1),
  limitations: z.array(z.string().min(1)).min(1),
});

const evidenceProfileSchema = z.strictObject({
  role: z.enum(evidenceRoles),
  methods: z.array(z.enum(evidenceMethods)).min(1),
  artifact_handling: z.array(
    z.enum([
      "context_recorded",
      "original_preserved",
      "hash_recorded",
      "archived_copy",
      "chain_of_custody_documented",
    ]),
  ),
  privacy_practices: z.array(
    z.enum([
      "consent_considered",
      "identity_minimization",
      "location_minimization",
      "redaction_considered",
      "do_no_harm_review",
    ]),
  ).min(1),
  claim_status: z.enum(claimStatuses),
  limitations: z.array(z.string().min(1)).min(1),
});

const safetyProfileSchema = z.strictObject({
  sensitivity: z.enum(["public", "context_limited", "do_not_publish"]),
  exclusions: z.array(
    z.enum([
      "personal_identifiers",
      "live_location",
      "participant_roster",
      "device_or_account_identifier",
      "evasion_instructions",
      "unredacted_sensitive_media",
    ]),
  ).min(1),
  display_note: z.string().min(1),
});

const sourceRecordBaseSchema = z.strictObject({
  schema_version: z.literal(3),
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().min(1),
  authors: z.array(z.string().min(1)),
  published_date: dateOnly.nullable(),
  year: z.number().int().min(1900).max(2100).nullable(),
  resource_type: z.enum(resourceTypes),
  access: z.enum(accessLevels),
  geographies: z.array(z.string().min(1)),
  cases: z.array(z.string().min(1)),
  case_ids: z.array(z.string().min(1)).optional(),
  themes: z.array(z.string().min(1)),
  summary: z.string().min(1),
  relevance: z.string().min(1),
  verification_status: z.enum(verificationStatuses),
  verification_notes: z.string().min(1),
  last_checked: dateOnly,
  language: z.string().min(1),
  taxonomy: taxonomySchema,
  authority: authoritySchema,
  identifiers: identifiersSchema.optional(),
  legal_profile: legalProfileSchema.optional(),
  technical_profile: technicalProfileSchema.optional(),
  evidence_profile: evidenceProfileSchema.optional(),
  safety_profile: safetyProfileSchema.optional(),
});

function isRealDate(value: string): boolean {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export const sourceRecordSchema = sourceRecordBaseSchema.superRefine((record, context) => {
  if (record.published_date && !isRealDate(record.published_date)) {
    context.addIssue({
      code: "custom",
      message: "published_date must be a real calendar date",
      path: ["published_date"],
    });
  }

  if (!isRealDate(record.last_checked)) {
    context.addIssue({
      code: "custom",
      message: "last_checked must be a real calendar date",
      path: ["last_checked"],
    });
  }

  if (
    record.published_date &&
    record.year !== null &&
    Number(record.published_date.slice(0, 4)) !== record.year
  ) {
    context.addIssue({
      code: "custom",
      message: "year must agree with published_date",
      path: ["year"],
    });
  }

  if (!record.taxonomy.topics.includes(record.taxonomy.primary_topic)) {
    context.addIssue({
      code: "custom",
      message: "primary_topic must also appear in topics",
      path: ["taxonomy", "topics"],
    });
  }

  if (record.resource_type === "monitor" && !record.technical_profile) {
    context.addIssue({
      code: "custom",
      message: "monitor records require a technical_profile",
      path: ["technical_profile"],
    });
  }

  if (
    ["case_law", "legal_standard", "treaty"].includes(record.resource_type) &&
    !record.legal_profile
  ) {
    context.addIssue({
      code: "custom",
      message: "legal records require a legal_profile",
      path: ["legal_profile"],
    });
  }

  if (
    record.legal_profile &&
    !record.taxonomy.topics.some((topic) =>
      ["legal_rights", "legal_remedies"].includes(topic),
    )
  ) {
    context.addIssue({
      code: "custom",
      message: "legal_profile requires a legal topic",
      path: ["taxonomy", "topics"],
    });
  }

  if (
    record.technical_profile &&
    !record.taxonomy.topics.some((topic) =>
      [
        "connectivity_monitoring",
        "digital_repression",
        "media_verification",
        "osint_evidence",
        "secure_communications",
        "surveillance_forensics",
      ].includes(topic),
    )
  ) {
    context.addIssue({
      code: "custom",
      message: "technical_profile requires a technical topic",
      path: ["taxonomy", "topics"],
    });
  }

  if (
    record.evidence_profile &&
    !record.taxonomy.topics.some((topic) =>
      ["osint_evidence", "media_verification"].includes(topic),
    )
  ) {
    context.addIssue({
      code: "custom",
      message: "evidence_profile requires an evidence topic",
      path: ["taxonomy", "topics"],
    });
  }

  if (record.safety_profile?.sensitivity === "do_not_publish") {
    context.addIssue({
      code: "custom",
      message: "do_not_publish records cannot enter the public atlas",
      path: ["safety_profile", "sensitivity"],
    });
  }

  const arraysToCheck: Array<{ path: string[]; values: string[] }> = [
    { path: ["authors"], values: record.authors },
    { path: ["taxonomy", "topics"], values: record.taxonomy.topics },
    { path: ["themes"], values: record.themes },
    { path: ["geographies"], values: record.geographies },
    { path: ["cases"], values: record.cases },
    { path: ["case_ids"], values: record.case_ids ?? [] },
  ];

  if (record.legal_profile) {
    arraysToCheck.push(
      {
        path: ["legal_profile", "instruments"],
        values: record.legal_profile.instruments,
      },
      {
        path: ["legal_profile", "applies_to"],
        values: record.legal_profile.applies_to,
      },
      { path: ["legal_profile", "rights"], values: record.legal_profile.rights },
      {
        path: ["legal_profile", "restriction_tests"],
        values: record.legal_profile.restriction_tests,
      },
      {
        path: ["legal_profile", "remedies"],
        values: record.legal_profile.remedies,
      },
      {
        path: ["legal_profile", "caveats"],
        values: record.legal_profile.caveats,
      },
    );
  }

  if (record.technical_profile) {
    arraysToCheck.push(
      {
        path: ["technical_profile", "methods"],
        values: record.technical_profile.methods,
      },
      {
        path: ["technical_profile", "technical_layers"],
        values: record.technical_profile.technical_layers,
      },
      {
        path: ["technical_profile", "collection_modes"],
        values: record.technical_profile.collection_modes,
      },
      {
        path: ["technical_profile", "data_access"],
        values: record.technical_profile.data_access,
      },
      {
        path: ["technical_profile", "signals"],
        values: record.technical_profile.signals,
      },
      {
        path: ["technical_profile", "validation_requirements"],
        values: record.technical_profile.validation_requirements,
      },
      {
        path: ["technical_profile", "limitations"],
        values: record.technical_profile.limitations,
      },
    );
  }

  if (record.evidence_profile) {
    arraysToCheck.push(
      {
        path: ["evidence_profile", "methods"],
        values: record.evidence_profile.methods,
      },
      {
        path: ["evidence_profile", "artifact_handling"],
        values: record.evidence_profile.artifact_handling,
      },
      {
        path: ["evidence_profile", "privacy_practices"],
        values: record.evidence_profile.privacy_practices,
      },
      {
        path: ["evidence_profile", "limitations"],
        values: record.evidence_profile.limitations,
      },
    );
  }

  if (record.safety_profile) {
    arraysToCheck.push({
      path: ["safety_profile", "exclusions"],
      values: record.safety_profile.exclusions,
    });
  }

  for (const { path, values } of arraysToCheck) {
    if (new Set(values).size !== values.length) {
      context.addIssue({
        code: "custom",
        message: "duplicate values are not allowed",
        path,
      });
    }
  }
});

const caseSummarySchema = z.strictObject({
  case_id: z.string().min(1),
  case_name: z.string().min(1),
  period: z.string().min(1),
  geography: z.string().min(1),
  summary: z.string().min(1),
  source_ids: z.array(z.string().min(1)).min(2),
  corroboration_note: z.string().min(1),
}).superRefine((record, context) => {
  if (new Set(record.source_ids).size !== record.source_ids.length) {
    context.addIssue({
      code: "custom",
      message: "case source_ids must be unique",
      path: ["source_ids"],
    });
  }
});

export type SourceRecord = z.infer<typeof sourceRecordSchema>;
export type CaseSummary = z.infer<typeof caseSummarySchema>;
export type ResourceType = SourceRecord["resource_type"];
export type VerificationStatus = SourceRecord["verification_status"];
export type TopicCode = SourceRecord["taxonomy"]["primary_topic"];

export const sourceRecords = sourceRecordSchema.array().parse(rawSources);
export const caseSummaries = caseSummarySchema.array().parse(rawCaseSummaries);

export const topicOptions = [
  { value: "case_research", label: "Case research" },
  { value: "movement_theory", label: "Movement theory" },
  { value: "civil_resistance", label: "Civil resistance" },
  { value: "digital_repression", label: "Digital repression" },
  { value: "digital_rights", label: "Digital rights" },
  { value: "platform_governance", label: "Platform governance" },
  { value: "secure_communications", label: "Secure communications" },
  { value: "connectivity_monitoring", label: "Connectivity monitoring" },
  { value: "surveillance_forensics", label: "Surveillance forensics" },
  { value: "osint_evidence", label: "OSINT & evidence" },
  { value: "media_verification", label: "Media verification" },
  { value: "legal_rights", label: "Legal rights" },
  { value: "legal_remedies", label: "Legal remedies" },
  { value: "political_transition", label: "Political transition" },
  { value: "safety_ethics", label: "Safety & ethics" },
] as const satisfies ReadonlyArray<{ value: TopicCode; label: string }>;

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
  year: string;
  verification: string;
};

export const initialFilters: AtlasFilters = {
  caseId: "",
  topic: "",
  resourceType: "",
  year: "",
  verification: "",
};

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

export function getSourceById(id: string): SourceRecord | undefined {
  return sourceById.get(id);
}

export function getSourceTopic(source: SourceRecord): string {
  return topicLabels.get(source.taxonomy.primary_topic) ?? humanizeValue(source.taxonomy.primary_topic);
}

export function humanizeValue(value: string): string {
  return value
    .split(/[_-]/)
    .map((part) => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`)
    .join(" ");
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

export function filterCases(
  records: AtlasCase[],
  filters: AtlasFilters,
  query: string,
): AtlasCase[] {
  return records.filter((record) => {
    const sources = linkedSources(record);
    const searchable = [
      record.name,
      record.period,
      record.geography,
      record.summary,
      record.evidenceNote,
      record.status,
      ...sources.flatMap((source) => [
        source.title,
        source.publisher,
        ...source.authors,
        ...source.themes,
        ...structuredSearchTerms(source),
      ]),
    ].join(" ");

    return (
      matchesQuery(searchable, query) &&
      (!filters.caseId || record.id === filters.caseId) &&
      (!filters.topic ||
        sources.some((source) => source.taxonomy.topics.includes(filters.topic as TopicCode))) &&
      (!filters.resourceType ||
        sources.some((source) => source.resource_type === filters.resourceType)) &&
      (!filters.year || record.period.includes(filters.year)) &&
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
  const selectedCase = filters.caseId
    ? atlasCases.find((record) => record.id === filters.caseId)
    : undefined;

  return records.filter((record) => {
    const searchable = [
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
    ].join(" ");

    return (
      matchesQuery(searchable, query) &&
      (!selectedCase || selectedCase.sourceIds.includes(record.id)) &&
      (!filters.topic || record.taxonomy.topics.includes(filters.topic as TopicCode)) &&
      (!filters.resourceType || record.resource_type === filters.resourceType) &&
      (!filters.year || record.year?.toString() === filters.year) &&
      (!filters.verification || record.verification_status === filters.verification)
    );
  });
}

function canonicalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

function normalizedTitle(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function duplicateValues(values: string[]): string[] {
  return [
    ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
  ];
}

export function validateAtlasData(): {
  duplicateIds: string[];
  duplicateUrls: string[];
  duplicateTitles: string[];
  duplicateDocumentIds: string[];
  missingCaseSourceIds: string[];
  unknownCaseIds: string[];
  limitedIndependenceCaseIds: string[];
} {
  const ids = sourceRecords.map((record) => record.id);
  const urls = sourceRecords.map((record) => canonicalizeUrl(record.url));
  const titles = sourceRecords.map((record) => normalizedTitle(record.title));
  const documentIds = sourceRecords.flatMap((record) =>
    record.identifiers?.official_document_id
      ? [record.identifiers.official_document_id.toLocaleLowerCase()]
      : [],
  );
  const missingCaseSourceIds = caseSummaries
    .flatMap((record) => record.source_ids)
    .filter((id) => !sourceById.has(id));
  const knownCaseIds = new Set(caseSummaries.map((record) => record.case_id));
  const unknownCaseIds = sourceRecords
    .flatMap((record) => record.case_ids ?? [])
    .filter((id) => !knownCaseIds.has(id));
  const limitedIndependenceCaseIds = caseSummaries
    .filter((record) => independenceGroupsFor(record.source_ids).length < 2)
    .map((record) => record.case_id);

  return {
    duplicateIds: duplicateValues(ids),
    duplicateUrls: duplicateValues(urls),
    duplicateTitles: duplicateValues(titles),
    duplicateDocumentIds: duplicateValues(documentIds),
    missingCaseSourceIds: [...new Set(missingCaseSourceIds)],
    unknownCaseIds: [...new Set(unknownCaseIds)],
    limitedIndependenceCaseIds,
  };
}
