import { describe, expect, test } from "vitest";
import {
  atlasCases,
  filterCases,
  filterSources,
  initialFilters,
  sourceRecordSchema,
  sourceRecords,
  validateAtlasData,
} from "./atlasData";

describe("atlas research data", () => {
  test("parses the v3 corpus and preserves evidence-status boundaries", () => {
    expect(sourceRecords.length).toBeGreaterThanOrEqual(60);
    expect(sourceRecords.every((record) => record.schema_version === 3)).toBe(true);
    expect(atlasCases.filter((record) => record.status === "Corroborated")).toHaveLength(9);
    expect(
      atlasCases.filter((record) => record.status === "Corroboration limited"),
    ).toHaveLength(1);
    expect(atlasCases.filter((record) => record.status === "Watchlist")).toHaveLength(1);
    expect(sourceRecords.filter((record) => record.verification_status === "verified").length)
      .toBeGreaterThanOrEqual(40);
    expect(
      sourceRecords.filter((record) => record.verification_status === "needs_review"),
    ).toHaveLength(1);
    expect(sourceRecords.filter((record) => record.legal_profile).length)
      .toBeGreaterThanOrEqual(15);
    expect(sourceRecords.filter((record) => record.technical_profile).length)
      .toBeGreaterThanOrEqual(19);
    expect(sourceRecords.filter((record) => record.evidence_profile).length)
      .toBeGreaterThanOrEqual(12);
    expect(sourceRecords.filter((record) => record.safety_profile).length)
      .toBeGreaterThanOrEqual(18);
    expect(
      sourceRecords.filter((record) =>
        ["verified", "partially_verified", "needs_review", "unavailable"].includes(
          record.verification_status,
        ),
      ),
    ).toHaveLength(sourceRecords.length);
  });

  test("has unique provenance identifiers and resolved case evidence", () => {
    expect(validateAtlasData()).toEqual({
      duplicateIds: [],
      duplicateUrls: [],
      duplicateTitles: [],
      duplicateDocumentIds: [],
      missingCaseSourceIds: [],
      unknownCaseIds: [],
      limitedIndependenceCaseIds: ["morocco-2025"],
    });
  });

  test("searches across case prose and structured research profiles", () => {
    const caseMatches = filterCases(atlasCases, initialFilters, "Finance Bill");
    const sourceMatches = filterSources(sourceRecords, initialFilters, "false positive");
    const legalMatches = filterSources(sourceRecords, initialFilters, "least intrusive means");

    expect(caseMatches.map((record) => record.geography)).toEqual(["Kenya"]);
    expect(sourceMatches.some((record) => record.id === "monitor-ooni-explorer")).toBe(true);
    expect(
      legalMatches.some((record) => record.id === "legal-ohchr-general-comment-37-2020"),
    ).toBe(true);
  });

  test("filters by explicit taxonomy rather than identifier prefixes", () => {
    const matches = filterSources(
      sourceRecords,
      { ...initialFilters, topic: "legal_rights" },
      "Catt",
    );

    expect(matches.map((record) => record.id)).toEqual(["case-echr-catt-uk-2019"]);
  });

  test("connects a selected case to only its cited source records", () => {
    const selectedCase = atlasCases.find((record) => record.id === "bangladesh-2024");
    expect(selectedCase).toBeDefined();

    const matches = filterSources(
      sourceRecords,
      { ...initialFilters, caseId: "bangladesh-2024" },
      "",
    );

    expect(matches.map((record) => record.id).sort()).toEqual(
      [...(selectedCase?.sourceIds ?? [])].sort(),
    );
  });

  test("rejects invalid cross-field and unknown-key records", () => {
    const monitor = sourceRecords.find((record) => record.id === "monitor-ooni-explorer");
    const legal = sourceRecords.find(
      (record) => record.id === "legal-ohchr-general-comment-37-2020",
    );
    const dated = sourceRecords.find((record) => record.published_date !== null);

    expect(monitor).toBeDefined();
    expect(legal).toBeDefined();
    expect(dated).toBeDefined();

    if (!monitor || !legal || !dated) return;

    const { technical_profile: _technicalProfile, ...monitorWithoutMethod } = monitor;
    const { legal_profile: _legalProfile, ...legalWithoutAuthority } = legal;

    expect(sourceRecordSchema.safeParse(monitorWithoutMethod).success).toBe(false);
    expect(sourceRecordSchema.safeParse(legalWithoutAuthority).success).toBe(false);
    expect(
      sourceRecordSchema.safeParse({
        ...dated,
        published_date: "2026-02-30",
        year: 2026,
      }).success,
    ).toBe(false);
    expect(
      sourceRecordSchema.safeParse({
        ...dated,
        unexpected_field: "not allowed",
      }).success,
    ).toBe(false);
  });
});
