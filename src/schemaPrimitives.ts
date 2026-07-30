/**
 * Zod primitives shared by the two import contracts.
 *
 * Build- and test-time only. Runtime modules must not import this file — it
 * pulls Zod into whatever bundle reaches it. Date and freshness helpers live in
 * `freshness.ts` for that reason.
 */
import { z } from "zod";
import { isRealDate } from "./freshness";

/**
 * Zod's `.url()` delegates to the URL constructor, which accepts `javascript:`
 * and `data:` URLs. Every URL in this corpus is rendered directly into an
 * `href`, and the schema is the trust boundary for imported research batches,
 * so the scheme has to be constrained here rather than at the render site.
 */
export const httpsUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "must be an https:// URL");

export const dateOnly = z
  .string()
  .refine(isRealDate, "Expected a real calendar date in YYYY-MM-DD format");
