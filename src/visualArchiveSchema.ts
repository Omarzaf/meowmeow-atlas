/**
 * Visual-archive import contract.
 *
 * Like `atlasSchema.ts`, this runs at build time and in tests only. Known case
 * identifiers are injected rather than imported so that the archive's runtime
 * module does not have to pull in the whole source corpus.
 */
import { z } from "zod";
import { dateOnly, httpsUrl } from "./schemaPrimitives";

const contextSourceSchema = z.strictObject({
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: httpsUrl,
});

const imageSchema = z.strictObject({
  src: z.string().regex(/^\/visual-archive\/[a-z0-9-]+\.jpg$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(20),
  caption: z.string().min(20),
  photographer: z.string().min(1),
  photographer_url: httpsUrl.nullable(),
  origin_title: z.string().min(1),
  origin_url: httpsUrl,
  license_code: z.enum(["CC0-1.0", "CC-BY-SA-4.0", "CC-BY-SA-2.0"]),
  license_name: z.string().min(1),
  license_url: httpsUrl,
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

export type VisualArchiveRecord = z.infer<typeof visualArchiveRecordSchema>;

export function createVisualArchiveSchema(knownCaseIds: ReadonlySet<string>) {
  return z
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

      const uniqueness: Array<{ label: string; values: string[] }> = [
        { label: "Visual record identifiers", values: archive.records.map((r) => r.id) },
        { label: "Local image paths", values: archive.records.map((r) => r.image.src) },
        { label: "Original image URLs", values: archive.records.map((r) => r.image.origin_url) },
        { label: "Image digests", values: archive.records.map((r) => r.image.sha256) },
      ];

      for (const { label, values } of uniqueness) {
        if (new Set(values).size !== values.length) {
          context.addIssue({ code: "custom", message: `${label} must be unique`, path: ["records"] });
        }
      }

      archive.records.forEach((record, index) => {
        if (!knownCaseIds.has(record.related_case_id)) {
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
}

export type VisualArchive = z.infer<ReturnType<typeof createVisualArchiveSchema>>;
