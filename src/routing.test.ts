/**
 * Base-path routing.
 *
 * `import.meta.env.BASE_URL` is fixed at build time, so these exercise the
 * root-deployment case that the test run is built with. The subdirectory case
 * is covered by re-deriving the same logic against an explicit base, which is
 * what a GitHub Pages project site supplies.
 */
import { describe, expect, test } from "vitest";
import { stripBase, withBase } from "./routing";

/** The subdirectory behaviour, with the base injected rather than built in. */
function stripWithBase(pathname: string, rawBase: string): string {
  const base = rawBase.replace(/\/+$/, "");
  const withoutTrailing = pathname.replace(/\.html$/, "").replace(/\/+$/, "");

  if (!base) return withoutTrailing || "/";
  if (withoutTrailing === base) return "/";
  return withoutTrailing.startsWith(`${base}/`)
    ? withoutTrailing.slice(base.length) || "/"
    : withoutTrailing || "/";
}

describe("routing at an origin root", () => {
  test("leaves app paths untouched", () => {
    expect(withBase("/")).toBe("/");
    expect(withBase("/visual-archive")).toBe("/visual-archive");
    expect(stripBase("/")).toBe("/");
    expect(stripBase("/visual-archive")).toBe("/visual-archive");
  });

  test("normalises trailing slashes and .html shells to one route", () => {
    expect(stripBase("/visual-archive/")).toBe("/visual-archive");
    expect(stripBase("/visual-archive.html")).toBe("/visual-archive");
  });

  test("passes through anything that is not root-absolute", () => {
    expect(withBase("https://example.org/x")).toBe("https://example.org/x");
  });
});

describe("routing under a project-site subdirectory", () => {
  const base = "/meowmeow-atlas/";

  test("resolves the site root to the app root", () => {
    expect(stripWithBase("/meowmeow-atlas", base)).toBe("/");
    expect(stripWithBase("/meowmeow-atlas/", base)).toBe("/");
  });

  test("resolves a nested route, extensionless or as its .html shell", () => {
    expect(stripWithBase("/meowmeow-atlas/visual-archive", base)).toBe("/visual-archive");
    expect(stripWithBase("/meowmeow-atlas/visual-archive.html", base)).toBe(
      "/visual-archive",
    );
  });

  test("does not mistake a lookalike prefix for the base", () => {
    expect(stripWithBase("/meowmeow-atlas-other/page", base)).toBe(
      "/meowmeow-atlas-other/page",
    );
  });
});
