import { z } from "zod";
import { atlasCases } from "./atlasData";
import rawVisualArchive from "./data/visual_archive.json";

const dateOnly = z.string().refine(
  (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  },
  { message: "Expected a real calendar date in YYYY-MM-DD format" },
);

const contextSourceSchema = z.strictObject({
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
});

const imageSchema = z.strictObject({
  src: z.string().regex(/^\/visual-archive\/[a-z0-9-]+\.jpg$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(20),
  caption: z.string().min(20),
  photographer: z.string().min(1),
  photographer_url: z.string().url().nullable(),
  origin_title: z.string().min(1),
  origin_url: z.string().url(),
  license_code: z.enum(["CC0-1.0", "CC-BY-SA-4.0", "CC-BY-SA-2.0"]),
  license_name: z.string().min(1),
  license_url: z.string().url(),
  attribution: z.string().min(20),
  rights_note: z.string().min(20),
  original_date: dateOnly.nullable(),
  downloaded_date: dateOnly,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  transformation_note: z.string().min(20),
});

export const visualArchiveRecordSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z0-9-]+$/),
    featured: z.boolean(),
    title: z.string().min(1),
    display_tag: z.enum(["Direct protest record", "International solidarity"]),
    image: imageSchema,
    location: z.string().min(1),
    location_note: z.string().min(20),
    protest_date: dateOnly.nullable(),
    related_case_id: z.string().min(1),
    related_case_label: z.string().min(1),
    what_this_shows: z.string().min(40),
    why_it_matters: z.string().min(40),
    context_sources: z.array(contextSourceSchema).min(2),
    verification_note: z.string().min(40),
    manipulation_note: z.string().min(40),
    safety_note: z.string().min(40),
    last_checked: dateOnly,
  })
  .superRefine((record, context) => {
    if (record.image.src !== `/visual-archive/${record.id}.jpg`) {
      context.addIssue({
        code: "custom",
        message: "Image path must match the visual-record identifier",
        path: ["image", "src"],
      });
    }

    const publishers = new Set(
      record.context_sources.map((source) => source.publisher.toLocaleLowerCase()),
    );
    if (publishers.size !== record.context_sources.length) {
      context.addIssue({
        code: "custom",
        message: "Context sources must come from distinct publishers",
        path: ["context_sources"],
      });
    }

    const contextUrls = record.context_sources.map((source) => source.url);
    if (new Set(contextUrls).size !== contextUrls.length) {
      context.addIssue({
        code: "custom",
        message: "Context source URLs must be unique within a record",
        path: ["context_sources"],
      });
    }
  });

const atlasCaseIds = new Set(atlasCases.map((record) => record.id));

export const visualArchiveSchema = z
  .strictObject({
    schema_version: z.literal(1),
    last_checked: dateOnly,
    scope_note: z.string().min(40),
    records: z.array(visualArchiveRecordSchema).min(1),
  })
  .superRefine((archive, context) => {
    const featuredRecords = archive.records.filter((record) => record.featured);
    if (featuredRecords.length !== 1) {
      context.addIssue({
        code: "custom",
        message: "The visual archive must have exactly one featured record",
        path: ["records"],
      });
    }

    const ids = archive.records.map((record) => record.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Visual record identifiers must be unique",
        path: ["records"],
      });
    }

    const imagePaths = archive.records.map((record) => record.image.src);
    if (new Set(imagePaths).size !== imagePaths.length) {
      context.addIssue({
        code: "custom",
        message: "Local image paths must be unique",
        path: ["records"],
      });
    }

    const originUrls = archive.records.map((record) => record.image.origin_url);
    if (new Set(originUrls).size !== originUrls.length) {
      context.addIssue({
        code: "custom",
        message: "Original image URLs must be unique",
        path: ["records"],
      });
    }

    archive.records.forEach((record, index) => {
      if (!atlasCaseIds.has(record.related_case_id)) {
        context.addIssue({
          code: "custom",
          message: `Unknown related case: ${record.related_case_id}`,
          path: ["records", index, "related_case_id"],
        });
      }

      if (record.last_checked !== archive.last_checked) {
        context.addIssue({
          code: "custom",
          message: "Record check date must match the archive check date",
          path: ["records", index, "last_checked"],
        });
      }
    });
  });

export type VisualArchiveRecord = z.infer<typeof visualArchiveRecordSchema>;
export type VisualArchive = z.infer<typeof visualArchiveSchema>;

export const visualArchive: VisualArchive = visualArchiveSchema.parse(rawVisualArchive);
export const visualArchiveRecords = visualArchive.records;
export const featuredVisualRecord = visualArchiveRecords.find((record) => record.featured)!;
export const supportingVisualRecords = visualArchiveRecords.filter((record) => !record.featured);

export function validateVisualArchiveData() {
  const recordIds = visualArchiveRecords.map((record) => record.id);
  const imagePaths = visualArchiveRecords.map((record) => record.image.src);
  const originUrls = visualArchiveRecords.map((record) => record.image.origin_url);

  return {
    duplicateIds: recordIds.filter((id, index) => recordIds.indexOf(id) !== index),
    duplicateImagePaths: imagePaths.filter((path, index) => imagePaths.indexOf(path) !== index),
    duplicateOriginUrls: originUrls.filter((url, index) => originUrls.indexOf(url) !== index),
    missingCaseIds: visualArchiveRecords
      .filter((record) => !atlasCaseIds.has(record.related_case_id))
      .map((record) => record.related_case_id),
    featuredCount: visualArchiveRecords.filter((record) => record.featured).length,
  };
}
