import { describe, expect, test } from "vitest";
import {
  atlasCases,
  corpusIsStale,
  corpusLastChecked,
  filterCases,
  filterSources,
  initialFilters,
  languageBreakdown,
  relatedCasesFor,
  sourceRecords,
  UNDATED_YEAR,
} from "./atlasData";
import { humanizeValue } from "./vocabulary";

describe("atlas research data", () => {
  test("preserves evidence-status boundaries across the corpus", () => {
    expect(sourceRecords.length).toBeGreaterThanOrEqual(60);
    expect(sourceRecords.every((record) => record.schema_version === 3)).toBe(true);
    expect(atlasCases.filter((record) => record.status === "Corroborated")).toHaveLength(9);
    expect(atlasCases.filter((record) => record.status === "Corroboration limited")).toHaveLength(1);
    expect(atlasCases.filter((record) => record.status === "Watchlist")).toHaveLength(1);
    expect(
      sourceRecords.filter((record) => record.verification_status === "verified").length,
    ).toBeGreaterThanOrEqual(40);
    expect(
      sourceRecords.filter((record) => record.verification_status === "needs_review"),
    ).toHaveLength(1);
  });

  test("discloses limited publisher independence on the case it affects", () => {
    const morocco = atlasCases.find((record) => record.id === "morocco-2025");

    expect(morocco?.status).toBe("Corroboration limited");
    expect(morocco?.evidenceNote).toMatch(/share one independence group/);
  });

  test("searches across case prose and structured research profiles", () => {
    expect(
      filterCases(atlasCases, initialFilters, "Finance Bill").map((record) => record.geography),
    ).toEqual(["Kenya"]);
    expect(
      filterSources(sourceRecords, initialFilters, "false positive").some(
        (record) => record.id === "monitor-ooni-explorer",
      ),
    ).toBe(true);
    expect(
      filterSources(sourceRecords, initialFilters, "least intrusive means").some(
        (record) => record.id === "legal-ohchr-general-comment-37-2020",
      ),
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
    const selected = atlasCases.find((record) => record.id === "bangladesh-2024");
    const matches = filterSources(
      sourceRecords,
      { ...initialFilters, caseId: "bangladesh-2024" },
      "",
    );

    expect(selected).toBeDefined();
    expect(matches.map((record) => record.id).sort()).toEqual(
      [...(selected?.sourceIds ?? [])].sort(),
    );
  });

  test("search ignores case and surrounding whitespace", () => {
    const lower = filterSources(sourceRecords, initialFilters, "ooni");

    expect(lower.length).toBeGreaterThan(0);
    expect(filterSources(sourceRecords, initialFilters, "  OONI  ").length).toBe(lower.length);
  });

  test("resolves case_ids to named atlas cases", () => {
    const tagged = sourceRecords.find((record) => (record.case_ids ?? []).length > 0);
    expect(tagged).toBeDefined();
    if (!tagged) return;

    const related = relatedCasesFor(tagged);
    expect(related).toHaveLength(tagged.case_ids?.length ?? 0);
    expect(related.every((entry) => entry.name.length > 0)).toBe(true);
  });

  test("reports staleness against the batch check date", () => {
    expect(corpusLastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const dayAfter = new Date(`${corpusLastChecked}T00:00:00Z`);
    dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);
    expect(corpusIsStale(dayAfter)).toBe(false);

    const longAfter = new Date(`${corpusLastChecked}T00:00:00Z`);
    longAfter.setUTCDate(longAfter.getUTCDate() + 400);
    expect(corpusIsStale(longAfter)).toBe(true);
  });

  test("exposes the language distribution behind the coverage caveat", () => {
    expect(languageBreakdown.length).toBeGreaterThan(0);
    expect(languageBreakdown.reduce((total, [, count]) => total + count, 0)).toBe(
      sourceRecords.length,
    );
  });
});

describe("display casing", () => {
  test("preserves organisational acronyms instead of title-casing them", () => {
    expect(humanizeValue("ohchr")).toBe("OHCHR");
    expect(humanizeValue("ooni")).toBe("OONI");
    expect(humanizeValue("c2pa")).toBe("C2PA");
    expect(humanizeValue("un-human-rights-committee")).toBe("UN Human Rights Committee");
    expect(humanizeValue("access-now-keepiton")).toBe("Access Now KeepItOn");
    expect(humanizeValue("journal-of-democracy")).toBe("Journal of Democracy");
  });

  test("still title-cases ordinary controlled values", () => {
    expect(humanizeValue("peaceful_assembly")).toBe("Peaceful Assembly");
    expect(humanizeValue("needs_review")).toBe("Needs Review");
  });
});

describe("geography, publisher-class and undated filtering", () => {
  test("narrows sources by geography without rolling up broader terms", () => {
    const kenya = filterSources(sourceRecords, { ...initialFilters, geography: "Kenya" }, "");

    expect(kenya.length).toBeGreaterThan(0);
    expect(kenya.every((record) => record.geographies.includes("Kenya"))).toBe(true);
    // Flat vocabulary: a country must not sweep in "Global" material.
    expect(kenya.some((record) => record.geographies.includes("Global"))).toBe(false);
  });

  test("narrows sources by publisher class", () => {
    const courts = filterSources(sourceRecords, { ...initialFilters, sourceClass: "court" }, "");

    expect(courts.length).toBeGreaterThan(0);
    expect(courts.every((record) => record.authority.source_class === "court")).toBe(true);
  });

  test("keeps undated records reachable instead of dropping them", () => {
    const undatedRecords = sourceRecords.filter((record) => record.year === null);
    expect(undatedRecords.length).toBeGreaterThan(0);

    const undated = filterSources(
      sourceRecords,
      { ...initialFilters, year: UNDATED_YEAR },
      "",
    );
    expect(undated.map((record) => record.id).sort()).toEqual(
      undatedRecords.map((record) => record.id).sort(),
    );

    // A real year still excludes them rather than absorbing them.
    const dated = filterSources(sourceRecords, { ...initialFilters, year: "2025" }, "");
    expect(dated.length).toBeGreaterThan(0);
    expect(dated.every((record) => record.year === 2025)).toBe(true);
  });

  test("uses one canonical casing for every geography facet term", () => {
    const geographies = new Set(sourceRecords.flatMap((record) => record.geographies));

    expect(geographies.has("Global")).toBe(true);
    expect(geographies.has("global")).toBe(false);
  });
});
