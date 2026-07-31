/**
 * The v3 import contract.
 *
 * These schemas are the trust boundary for human-reviewed research batches.
 * They run at build time (`scripts/validate-corpus.mjs`) and in tests, never in
 * the browser: the corpus is a bundled constant, so re-validating it on every
 * page load costs every visitor and can never surface a new failure.
 */
import { z } from "zod";
import { dateOnly, httpsUrl } from "./schemaPrimitives";
import {
  accessLevels,
  artifactHandlingModes,
  authorityLevels,
  cadences,
  claimStatuses,
  collectionModes,
  dataAccessModes,
  evidenceMethods,
  evidenceRoles,
  legalSystems,
  materialRoles,
  privacyPractices,
  protectedRights,
  resourceTypes,
  restrictionTests,
  safetyExclusions,
  sensitivityLevels,
  sourceClasses,
  technicalLayers,
  technicalSystemTypes,
  topicCodes,
  verificationStatuses,
} from "./vocabulary";

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
  archived_url: httpsUrl.optional(),
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
  cadence: z.enum(cadences),
  geographic_resolution: z.string().min(1).nullable(),
  temporal_resolution: z.string().min(1).nullable(),
  data_access: z.array(z.enum(dataAccessModes)).min(1),
  validation_requirements: z.array(z.string().min(1)).min(1),
  limitations: z.array(z.string().min(1)).min(1),
});

const evidenceProfileSchema = z.strictObject({
  role: z.enum(evidenceRoles),
  methods: z.array(z.enum(evidenceMethods)).min(1),
  artifact_handling: z.array(z.enum(artifactHandlingModes)),
  privacy_practices: z.array(z.enum(privacyPractices)).min(1),
  claim_status: z.enum(claimStatuses),
  limitations: z.array(z.string().min(1)).min(1),
});

const safetyProfileSchema = z.strictObject({
  sensitivity: z.enum(sensitivityLevels),
  exclusions: z.array(z.enum(safetyExclusions)).min(1),
  display_note: z.string().min(1),
});

const sourceRecordBaseSchema = z.strictObject({
  schema_version: z.literal(3),
  id: z.string().min(1),
  title: z.string().min(1),
  url: httpsUrl,
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

export const sourceRecordSchema = sourceRecordBaseSchema.superRefine((record, context) => {
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
    !record.taxonomy.topics.some((topic) => ["legal_rights", "legal_remedies"].includes(topic))
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
    !record.taxonomy.topics.some((topic) => ["osint_evidence", "media_verification"].includes(topic))
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

  const arraysToCheck: Array<{ path: Array<string | number>; values: string[] }> = [
    { path: ["authors"], values: record.authors },
    { path: ["taxonomy", "topics"], values: record.taxonomy.topics },
    { path: ["themes"], values: record.themes },
    { path: ["geographies"], values: record.geographies },
    { path: ["cases"], values: record.cases },
    { path: ["case_ids"], values: record.case_ids ?? [] },
  ];

  if (record.legal_profile) {
    const profile = record.legal_profile;
    arraysToCheck.push(
      { path: ["legal_profile", "instruments"], values: profile.instruments },
      { path: ["legal_profile", "applies_to"], values: profile.applies_to },
      { path: ["legal_profile", "rights"], values: profile.rights },
      { path: ["legal_profile", "restriction_tests"], values: profile.restriction_tests },
      { path: ["legal_profile", "remedies"], values: profile.remedies },
      { path: ["legal_profile", "caveats"], values: profile.caveats },
    );
  }

  if (record.technical_profile) {
    const profile = record.technical_profile;
    arraysToCheck.push(
      { path: ["technical_profile", "methods"], values: profile.methods },
      { path: ["technical_profile", "technical_layers"], values: profile.technical_layers },
      { path: ["technical_profile", "collection_modes"], values: profile.collection_modes },
      { path: ["technical_profile", "data_access"], values: profile.data_access },
      { path: ["technical_profile", "signals"], values: profile.signals },
      {
        path: ["technical_profile", "validation_requirements"],
        values: profile.validation_requirements,
      },
      { path: ["technical_profile", "limitations"], values: profile.limitations },
    );
  }

  if (record.evidence_profile) {
    const profile = record.evidence_profile;
    arraysToCheck.push(
      { path: ["evidence_profile", "methods"], values: profile.methods },
      { path: ["evidence_profile", "artifact_handling"], values: profile.artifact_handling },
      { path: ["evidence_profile", "privacy_practices"], values: profile.privacy_practices },
      { path: ["evidence_profile", "limitations"], values: profile.limitations },
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
      context.addIssue({ code: "custom", message: "duplicate values are not allowed", path });
    }
  }
});

export const caseSummarySchema = z
  .strictObject({
    case_id: z.string().min(1),
    case_name: z.string().min(1),
    period: z.string().min(1),
    geography: z.string().min(1),
    summary: z.string().min(1),
    source_ids: z.array(z.string().min(1)).min(2),
    corroboration_note: z.string().min(1),
  })
  .superRefine((record, context) => {
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
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

/**
 * Free-text facet terms that differ only by case. These are filter facets, so
 * "Global" and "global" would split one facet into two and silently halve each
 * result set — a hard failure, not a disclosure.
 */
function caseVariantTerms(values: string[]): string[] {
  const byFold = new Map<string, Set<string>>();

  for (const value of values) {
    const fold = value.toLocaleLowerCase();
    byFold.set(fold, (byFold.get(fold) ?? new Set<string>()).add(value));
  }

  return [...byFold.values()]
    .filter((variants) => variants.size > 1)
    .flatMap((variants) => [...variants].sort());
}

export type AtlasDataReport = {
  duplicateIds: string[];
  duplicateUrls: string[];
  duplicateTitles: string[];
  duplicateDocumentIds: string[];
  missingCaseSourceIds: string[];
  unknownCaseIds: string[];
  limitedIndependenceCaseIds: string[];
  caseVariantGeographies: string[];
  caseVariantCases: string[];
  caseVariantThemes: string[];
};

/**
 * Corpus-level invariants that no single record can express. `duplicateIds`
 * through `unknownCaseIds` are hard failures; `limitedIndependenceCaseIds` is a
 * disclosure that the UI surfaces rather than an error.
 */
export function validateAtlasData(
  sourceRecords: SourceRecord[],
  caseSummaries: CaseSummary[],
): AtlasDataReport {
  const sourceById = new Map(sourceRecords.map((record) => [record.id, record]));
  const knownCaseIds = new Set(caseSummaries.map((record) => record.case_id));

  const independenceGroupsFor = (sourceIds: string[]): Set<string> =>
    new Set(
      sourceIds.flatMap((id) => {
        const source = sourceById.get(id);
        return source ? [source.authority.independence_group] : [];
      }),
    );

  return {
    duplicateIds: duplicateValues(sourceRecords.map((record) => record.id)),
    duplicateUrls: duplicateValues(sourceRecords.map((record) => canonicalizeUrl(record.url))),
    duplicateTitles: duplicateValues(sourceRecords.map((record) => normalizedTitle(record.title))),
    duplicateDocumentIds: duplicateValues(
      sourceRecords.flatMap((record) =>
        record.identifiers?.official_document_id
          ? [record.identifiers.official_document_id.toLocaleLowerCase()]
          : [],
      ),
    ),
    missingCaseSourceIds: [
      ...new Set(
        caseSummaries.flatMap((record) => record.source_ids).filter((id) => !sourceById.has(id)),
      ),
    ],
    unknownCaseIds: [
      ...new Set(
        sourceRecords.flatMap((record) => record.case_ids ?? []).filter((id) => !knownCaseIds.has(id)),
      ),
    ],
    limitedIndependenceCaseIds: caseSummaries
      .filter((record) => independenceGroupsFor(record.source_ids).size < 2)
      .map((record) => record.case_id),
    caseVariantGeographies: caseVariantTerms(
      sourceRecords.flatMap((record) => record.geographies),
    ),
    caseVariantCases: caseVariantTerms(sourceRecords.flatMap((record) => record.cases)),
    caseVariantThemes: caseVariantTerms(sourceRecords.flatMap((record) => record.themes)),
  };
}
