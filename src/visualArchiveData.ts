/**
 * Runtime visual-archive data.
 *
 * Deliberately does not import `atlasData`: the archive page needs case labels,
 * which each record already carries, not the 61-record source corpus. Referential
 * integrity between `related_case_id` and the atlas is checked at build time by
 * `scripts/validate-corpus.mjs` and in the unit tests.
 */
import rawVisualArchive from "./data/visual_archive.json";
import type { VisualArchive, VisualArchiveRecord } from "./visualArchiveSchema";

export type { VisualArchive, VisualArchiveRecord } from "./visualArchiveSchema";

export const visualArchive = rawVisualArchive as unknown as VisualArchive;
export const visualArchiveRecords: VisualArchiveRecord[] = visualArchive.records;

const featured = visualArchiveRecords.find((record) => record.featured);
if (!featured) {
  throw new Error("visual_archive.json must contain exactly one featured record");
}

export const featuredVisualRecord: VisualArchiveRecord = featured;
export const supportingVisualRecords = visualArchiveRecords.filter((record) => !record.featured);

/** Distinct movements represented, used for the archive scope summary. */
export const visualArchiveCaseCount = new Set(
  visualArchiveRecords.map((record) => record.related_case_id),
).size;

export type VisualArchiveReport = {
  duplicateIds: string[];
  duplicateImagePaths: string[];
  duplicateOriginUrls: string[];
  missingCaseIds: string[];
  featuredCount: number;
};

function duplicates(values: string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateVisualArchiveData(
  knownCaseIds: ReadonlySet<string>,
): VisualArchiveReport {
  return {
    duplicateIds: duplicates(visualArchiveRecords.map((record) => record.id)),
    duplicateImagePaths: duplicates(visualArchiveRecords.map((record) => record.image.src)),
    duplicateOriginUrls: duplicates(
      visualArchiveRecords.map((record) => record.image.origin_url),
    ),
    missingCaseIds: visualArchiveRecords
      .filter((record) => !knownCaseIds.has(record.related_case_id))
      .map((record) => record.related_case_id),
    featuredCount: visualArchiveRecords.filter((record) => record.featured).length,
  };
}
