/**
 * Date and freshness helpers.
 *
 * Zod-free by design: the runtime modules need these, and importing them from
 * a module that also builds schemas would drag the whole validator into the
 * browser bundle.
 */
const dateShape = /^\d{4}-\d{2}-\d{2}$/;

export function isRealDate(value: string): boolean {
  if (!dateShape.test(value)) return false;

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Records carry a single batch `last_checked` stamp. Freshness is therefore a
 * property of the pass, not of an individual source, and the UI has to say so.
 */
export const STALE_AFTER_DAYS = 180;

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const checked = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(checked)) return Number.POSITIVE_INFINITY;
  return Math.floor((now.getTime() - checked) / 86_400_000);
}

export function isStale(isoDate: string, now: Date = new Date()): boolean {
  return daysSince(isoDate, now) > STALE_AFTER_DAYS;
}
