import { describe, expect, test } from "vitest";
import { sourceRecordSchema, validateAtlasData, type SourceRecord } from "./atlasSchema";
import rawSources from "./data/verified_sources.json";

const records = sourceRecordSchema.array().parse(rawSources);

function recordWith(predicate: (record: SourceRecord) => boolean): SourceRecord {
  const found = records.find(predicate);
  if (!found) throw new Error("fixture record not found");
  return found;
}

describe("v3 source contract", () => {
  test("rejects unknown keys", () => {
    const record = recordWith(() => true);
    expect(
      sourceRecordSchema.safeParse({ ...record, unexpected_field: "not allowed" }).success,
    ).toBe(false);
  });

  test("requires a technical profile on monitors and a legal profile on legal material", () => {
    const monitor = recordWith((record) => record.resource_type === "monitor");
    const legal = recordWith((record) =>
      ["case_law", "legal_standard", "treaty"].includes(record.resource_type),
    );

    const { technical_profile: _technical, ...monitorWithout } = monitor;
    const { legal_profile: _legal, ...legalWithout } = legal;

    expect(sourceRecordSchema.safeParse(monitorWithout).success).toBe(false);
    expect(sourceRecordSchema.safeParse(legalWithout).success).toBe(false);
  });

  test("rejects impossible calendar dates and year/date disagreement", () => {
    const dated = recordWith((record) => record.published_date !== null);

    expect(
      sourceRecordSchema.safeParse({ ...dated, published_date: "2026-02-30", year: 2026 }).success,
    ).toBe(false);
    expect(
      sourceRecordSchema.safeParse({ ...dated, published_date: "2024-01-01", year: 2025 }).success,
    ).toBe(false);
  });

  test("rejects non-https URLs in every URL-bearing field", () => {
    const record = recordWith(() => true);

    for (const url of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://insecure.example/item",
      "ftp://files.example/item",
    ]) {
      expect(sourceRecordSchema.safeParse({ ...record, url }).success).toBe(false);
      expect(
        sourceRecordSchema.safeParse({
          ...record,
          identifiers: { ...record.identifiers, archived_url: url },
        }).success,
      ).toBe(false);
    }
  });

  test("refuses records marked do_not_publish", () => {
    const record = recordWith(() => true);

    expect(
      sourceRecordSchema.safeParse({
        ...record,
        safety_profile: {
          sensitivity: "do_not_publish",
          exclusions: ["personal_identifiers"],
          display_note: "Withheld.",
        },
      }).success,
    ).toBe(false);
  });

  test("requires the primary topic to appear in topics", () => {
    const record = recordWith(() => true);

    expect(
      sourceRecordSchema.safeParse({
        ...record,
        taxonomy: {
          primary_topic: "safety_ethics",
          topics: record.taxonomy.topics.filter((topic) => topic !== "safety_ethics"),
        },
      }).success,
    ).toBe(false);
  });

  test("reports duplicate identifiers and unresolved case links", () => {
    const record = recordWith(() => true);
    const report = validateAtlasData(
      [record, record],
      [
        {
          case_id: "example-2026",
          case_name: "Example",
          period: "2026",
          geography: "Example",
          summary: "Example",
          source_ids: ["missing-a", "missing-b"],
          corroboration_note: "Example",
        },
      ],
    );

    expect(report.duplicateIds).toEqual([record.id]);
    expect(report.duplicateUrls).toHaveLength(1);
    expect(report.missingCaseSourceIds).toEqual(["missing-a", "missing-b"]);
    expect(report.limitedIndependenceCaseIds).toEqual(["example-2026"]);
  });
});
