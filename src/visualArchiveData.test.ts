import { describe, expect, test } from "vitest";
import { atlasCases } from "./atlasData";
import rawVisualArchive from "./data/visual_archive.json";
import {
  featuredVisualRecord,
  supportingVisualRecords,
  validateVisualArchiveData,
  visualArchive,
  visualArchiveCaseCount,
  visualArchiveRecords,
} from "./visualArchiveData";
import { createVisualArchiveSchema, visualArchiveRecordSchema } from "./visualArchiveSchema";

const knownCaseIds = new Set(atlasCases.map((record) => record.id));
const archiveSchema = createVisualArchiveSchema(knownCaseIds);

describe("visual archive data", () => {
  test("exposes one featured record and the rest as supporting", () => {
    expect(visualArchive.schema_version).toBe(1);
    expect(featuredVisualRecord.id).toBe("bangladesh-bangla-blockade-2024");
    expect(supportingVisualRecords).toHaveLength(visualArchiveRecords.length - 1);
    expect(supportingVisualRecords.every((record) => !record.featured)).toBe(true);
    expect(visualArchiveCaseCount).toBe(
      new Set(visualArchiveRecords.map((record) => record.related_case_id)).size,
    );
  });

  test("resolves every record against a known atlas case", () => {
    expect(validateVisualArchiveData(knownCaseIds)).toEqual({
      duplicateIds: [],
      duplicateImagePaths: [],
      duplicateOriginUrls: [],
      missingCaseIds: [],
      featuredCount: 1,
    });
  });

  test("keeps two independent context publishers beside every photograph", () => {
    for (const record of visualArchiveRecords) {
      const publishers = record.context_sources.map((source) =>
        source.publisher.toLocaleLowerCase(),
      );

      expect(record.context_sources.length).toBeGreaterThanOrEqual(2);
      expect(new Set(publishers).size).toBe(record.context_sources.length);
      expect(record.context_sources.every((source) => source.url.startsWith("https://"))).toBe(true);
    }
  });

  test("labels transnational solidarity separately from direct records", () => {
    expect(
      visualArchiveRecords.filter((record) => record.display_tag === "International solidarity"),
    ).toHaveLength(1);
  });
});

describe("visual archive contract", () => {
  test("rejects unknown keys and mismatched image paths", () => {
    expect(
      visualArchiveRecordSchema.safeParse({
        ...featuredVisualRecord,
        unexpected_field: "not allowed",
      }).success,
    ).toBe(false);

    expect(
      visualArchiveRecordSchema.safeParse({
        ...featuredVisualRecord,
        image: { ...featuredVisualRecord.image, src: "/visual-archive/not-the-record-id.jpg" },
      }).success,
    ).toBe(false);
  });

  test("rejects non-https rights and context URLs", () => {
    for (const url of ["javascript:alert(1)", "http://insecure.example/photo"]) {
      expect(
        visualArchiveRecordSchema.safeParse({
          ...featuredVisualRecord,
          image: { ...featuredVisualRecord.image, origin_url: url },
        }).success,
      ).toBe(false);

      expect(
        visualArchiveRecordSchema.safeParse({
          ...featuredVisualRecord,
          image: { ...featuredVisualRecord.image, license_url: url },
        }).success,
      ).toBe(false);
    }
  });

  test("requires exactly one featured record", () => {
    expect(
      archiveSchema.safeParse({
        ...rawVisualArchive,
        records: visualArchive.records.map((record) => ({ ...record, featured: false })),
      }).success,
    ).toBe(false);

    expect(
      archiveSchema.safeParse({
        ...rawVisualArchive,
        records: visualArchive.records.map((record) => ({ ...record, featured: true })),
      }).success,
    ).toBe(false);
  });

  test("rejects records pointing at an unknown case", () => {
    expect(
      createVisualArchiveSchema(new Set(["something-else"])).safeParse(rawVisualArchive).success,
    ).toBe(false);
  });
});
