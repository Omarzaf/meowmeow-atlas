import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  featuredVisualRecord,
  validateVisualArchiveData,
  visualArchive,
  visualArchiveRecordSchema,
  visualArchiveRecords,
  visualArchiveSchema,
} from "./visualArchiveData";

describe("visual archive data", () => {
  test("parses eight rights-cleared records with one featured image", () => {
    expect(visualArchive.schema_version).toBe(1);
    expect(visualArchiveRecords).toHaveLength(8);
    expect(featuredVisualRecord.id).toBe("bangladesh-bangla-blockade-2024");
    expect(validateVisualArchiveData()).toEqual({
      duplicateIds: [],
      duplicateImagePaths: [],
      duplicateOriginUrls: [],
      missingCaseIds: [],
      featuredCount: 1,
    });
    expect(
      visualArchiveRecords.filter((record) => record.display_tag === "International solidarity"),
    ).toHaveLength(1);
  });

  test("keeps two independent context publishers beside every photograph", () => {
    visualArchiveRecords.forEach((record) => {
      const publishers = record.context_sources.map((source) => source.publisher.toLowerCase());
      expect(new Set(publishers).size).toBe(record.context_sources.length);
      expect(record.context_sources).toHaveLength(2);
      expect(record.context_sources.every((source) => source.url.startsWith("https://"))).toBe(
        true,
      );
    });
  });

  test("matches every local asset to its declared SHA-256 digest", () => {
    visualArchiveRecords.forEach((record) => {
      const relativePath = record.image.src.replace(/^\//, "");
      const assetPath = join(process.cwd(), "public", relativePath);
      const bytes = readFileSync(assetPath);
      const digest = createHash("sha256").update(bytes).digest("hex");

      expect(statSync(assetPath).size).toBeGreaterThan(50_000);
      expect(digest).toBe(record.image.sha256);
    });
  });

  test("rejects unknown keys, mismatched image paths, and invalid archive composition", () => {
    expect(
      visualArchiveRecordSchema.safeParse({
        ...featuredVisualRecord,
        unexpected_field: "not allowed",
      }).success,
    ).toBe(false);

    expect(
      visualArchiveRecordSchema.safeParse({
        ...featuredVisualRecord,
        image: {
          ...featuredVisualRecord.image,
          src: "/visual-archive/not-the-record-id.jpg",
        },
      }).success,
    ).toBe(false);

    expect(
      visualArchiveSchema.safeParse({
        ...visualArchive,
        records: visualArchive.records.map((record) => ({ ...record, featured: false })),
      }).success,
    ).toBe(false);
  });
});
