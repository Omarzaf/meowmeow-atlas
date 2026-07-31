/**
 * The build gate.
 *
 * `prebuild` runs this file alone, so a corpus that violates the v3 contract
 * fails `pnpm build` rather than shipping. It re-parses the raw JSON with the
 * real schemas; the runtime modules assert the contract instead of re-checking
 * it in the browser.
 */
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { caseSummarySchema, sourceRecordSchema, validateAtlasData } from "./atlasSchema";
import rawCaseSummaries from "./data/case_summaries.json";
import rawSources from "./data/verified_sources.json";
import rawVisualArchive from "./data/visual_archive.json";
import { createVisualArchiveSchema } from "./visualArchiveSchema";

const sourceRecords = sourceRecordSchema.array().parse(rawSources);
const caseSummaries = caseSummarySchema.array().parse(rawCaseSummaries);

const knownCaseIds = new Set<string>([
  ...caseSummaries.map((record) => record.case_id),
  ...sourceRecords
    .filter((record) => record.verification_status === "needs_review" && record.cases.length > 0)
    .map((record) => `watchlist-${record.id}`),
]);

const visualArchive = createVisualArchiveSchema(knownCaseIds).parse(rawVisualArchive);

describe("corpus contract", () => {
  test("every source record satisfies the v3 contract", () => {
    expect(sourceRecords.length).toBeGreaterThan(0);
    expect(sourceRecords.every((record) => record.schema_version === 3)).toBe(true);
  });

  test("corpus-level integrity invariants hold", () => {
    const report = validateAtlasData(sourceRecords, caseSummaries);

    expect(report.duplicateIds).toEqual([]);
    expect(report.duplicateUrls).toEqual([]);
    expect(report.duplicateTitles).toEqual([]);
    expect(report.duplicateDocumentIds).toEqual([]);
    expect(report.missingCaseSourceIds).toEqual([]);
    expect(report.unknownCaseIds).toEqual([]);
    // Case-variant facet terms split one filter option into two.
    expect(report.caseVariantGeographies).toEqual([]);
    expect(report.caseVariantCases).toEqual([]);
    expect(report.caseVariantThemes).toEqual([]);
    // Not a failure: disclosed in the UI as "Corroboration limited".
    expect(report.limitedIndependenceCaseIds).toEqual(["morocco-2025"]);
  });

  test("every source URL is https", () => {
    for (const record of sourceRecords) {
      expect(new URL(record.url).protocol).toBe("https:");
      if (record.identifiers?.archived_url) {
        expect(new URL(record.identifiers.archived_url).protocol).toBe("https:");
      }
    }
  });

  test("the visual archive resolves against known atlas cases", () => {
    expect(visualArchive.records.length).toBeGreaterThan(0);
    expect(visualArchive.records.filter((record) => record.featured)).toHaveLength(1);
    for (const record of visualArchive.records) {
      expect(knownCaseIds.has(record.related_case_id)).toBe(true);
    }
  });

  test("every archived image matches its declared SHA-256 digest", () => {
    for (const record of visualArchive.records) {
      const assetPath = join(process.cwd(), "public", record.image.src.replace(/^\//, ""));
      const bytes = readFileSync(assetPath);

      expect(statSync(assetPath).size).toBeGreaterThan(50_000);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(record.image.sha256);
    }
  });
});
