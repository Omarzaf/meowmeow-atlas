/**
 * Controlled vocabularies and display helpers.
 *
 * This module deliberately has no Zod dependency: it is imported by the browser
 * bundle, while the schemas that consume these vocabularies (`atlasSchema.ts`,
 * `visualArchiveSchema.ts`) run only at build time and in tests.
 */

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

export const artifactHandlingModes = [
  "context_recorded",
  "original_preserved",
  "hash_recorded",
  "archived_copy",
  "chain_of_custody_documented",
] as const;

export const privacyPractices = [
  "consent_considered",
  "identity_minimization",
  "location_minimization",
  "redaction_considered",
  "do_no_harm_review",
] as const;

export const safetyExclusions = [
  "personal_identifiers",
  "live_location",
  "participant_roster",
  "device_or_account_identifier",
  "evasion_instructions",
  "unredacted_sensitive_media",
] as const;

export const cadences = [
  "continuous",
  "periodic",
  "event_driven",
  "on_demand",
  "static",
] as const;

export const sensitivityLevels = ["public", "context_limited", "do_not_publish"] as const;

export type TopicCode = (typeof topicCodes)[number];

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

/**
 * Segment-wise title casing mangles the acronyms that dominate this corpus
 * ("ohchr" became "Ohchr", "c2pa" became "C2pa"). Provenance display is the one
 * place where that inaccuracy is least acceptable, so known tokens are cased
 * explicitly and anything unrecognised falls back to title case.
 */
const knownCasing = new Map<string, string>(
  [
    "ACHPR",
    "ACLED",
    "API",
    "BGP",
    "C2PA",
    "CIPESA",
    "CPA",
    "DNS",
    "ECNL",
    "ECtHR",
    "EFF",
    "HRW",
    "IACHR",
    "ICCPR",
    "ICNC",
    "IODA",
    "IP",
    "ITU",
    "KeepItOn",
    "MVT",
    "NDT7",
    "ODIHR",
    "OHCHR",
    "OONI",
    "OSCE",
    "OSINT",
    "PeaceRep",
    "ProofMode",
    "SWP",
    "TCP",
    "TIMEP",
    "TLS",
    "UK",
    "UN",
    "US",
    "WITNESS",
    "WRI",
    "eyeWitness",
  ].map((token) => [token.toLocaleLowerCase(), token]),
);

/** Kept lowercase inside a name, but capitalised when they lead it. */
const particles = new Set(["a", "and", "for", "of", "the", "to"]);

export function humanizeValue(value: string): string {
  return value
    .split(/[_-]/)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const lower = part.toLocaleLowerCase();
      const known = knownCasing.get(lower);
      if (known) return known;
      if (index > 0 && particles.has(lower)) return lower;
      return `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}
