/**
 * Base-path aware routing.
 *
 * The atlas is written with root-absolute paths, which is correct when it is
 * served from an origin root (Sites, a Worker, a custom domain). GitHub Pages
 * project sites serve from a subdirectory instead, so every in-app link and
 * local asset needs the deployment base in front of it.
 *
 * `import.meta.env.BASE_URL` is supplied by Vite's `base` option, always with a
 * trailing slash. It is "/" for a root deployment, so this is a no-op there.
 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** Prefixes a root-absolute app path with the deployment base. */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${base}${path}` || "/";
}

/**
 * Strips the deployment base from a browser pathname so route matching can stay
 * written in terms of the app's own paths.
 */
export function stripBase(pathname: string): string {
  // The build emits one .html shell per route. Static hosts serve those
  // extensionless, but a direct link to the file is still a valid way to reach
  // the page, so both spellings must resolve to the same route.
  const withoutTrailing = pathname.replace(/\.html$/, "").replace(/\/+$/, "");

  if (!base) return withoutTrailing || "/";
  if (withoutTrailing === base) return "/";
  return withoutTrailing.startsWith(`${base}/`)
    ? withoutTrailing.slice(base.length) || "/"
    : withoutTrailing || "/";
}
