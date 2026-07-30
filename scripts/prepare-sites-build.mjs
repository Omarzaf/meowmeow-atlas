#!/usr/bin/env node
/**
 * Packages the Vite output for the Sites handoff and makes the atlas citable.
 *
 * Beyond copying the worker and hosting manifest, this prerenders one HTML
 * shell per route with its own title, description, canonical URL, and social
 * card, then emits robots.txt and sitemap.xml. Without this every route shipped
 * the homepage's metadata, which is a real problem for something meant to be
 * linked and cited.
 *
 * The public origin comes from SITE_URL. It is only needed for absolute
 * canonical/OG URLs and the sitemap; the placeholder default keeps the build
 * reproducible without pinning a domain into the repository.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const index = path.join(client, "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

const PLACEHOLDER_ORIGIN = "https://example.invalid";

/**
 * SITE_URL wins. Failing that, use the host the platform already knows: on
 * Vercel a production build knows its own domain and a preview build knows its
 * deployment URL, which avoids the chicken-and-egg of needing the URL before
 * the first deploy. Canonical tags on a preview then point at the preview
 * itself rather than at production, which is what you want for a build that
 * should not be indexed.
 */
function resolveSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return PLACEHOLDER_ORIGIN;
}

const siteUrl = resolveSiteUrl().replace(/\/+$/, "");
/** Preview deployments must never be indexed in place of production. */
const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

const routes = JSON.parse(readFileSync(path.join(root, "src", "data", "routes.json"), "utf8"));
const template = readFileSync(index, "utf8");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headFor(route) {
  const canonical = `${siteUrl}${route.path === "/" ? "/" : route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="meowmeow — Gen Z Protest Atlas" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    route.inSitemap && isIndexable ? "" : `<meta name="robots" content="noindex" />`,
  ]
    .filter(Boolean)
    .join("\n    ");
}

/** Swaps the template's head metadata for this route's. */
function renderRoute(route) {
  const stripped = template
    .replace(/\s*<title>[\s\S]*?<\/title>/, "")
    .replace(/\s*<meta name="description"[^>]*\/?>/, "")
    .replace(/\s*<link rel="canonical"[^>]*\/?>/, "");

  return stripped.replace("</head>", `  ${headFor(route)}\n  </head>`);
}

for (const route of routes) {
  const html = renderRoute(route);

  if (route.path === "/") {
    writeFileSync(index, html, "utf8");
    continue;
  }

  const name = route.path.replace(/^\//, "");

  // Emit both shapes. `<name>.html` is what clean-URL rewriting expects;
  // `<name>/index.html` is what directory-index resolution expects. /visual-archive
  // is also a real asset directory, so relying on either one alone leaves the
  // route's resolution up to host-specific precedence rules.
  writeFileSync(path.join(client, `${name}.html`), html, "utf8");

  if (name !== "404") {
    mkdirSync(path.join(client, name), { recursive: true });
    writeFileSync(path.join(client, name, "index.html"), html, "utf8");
  }
}

const today = new Date().toISOString().slice(0, 10);

writeFileSync(
  path.join(client, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    routes
      .filter((route) => route.inSitemap)
      .map((route) =>
        [
          "  <url>",
          `    <loc>${siteUrl}${route.path === "/" ? "/" : route.path}</loc>`,
          `    <lastmod>${today}</lastmod>`,
          `    <changefreq>${route.changefreq}</changefreq>`,
          `    <priority>${route.priority}</priority>`,
          "  </url>",
        ].join("\n"),
      )
      .join("\n") +
    "\n</urlset>\n",
  "utf8",
);

writeFileSync(
  path.join(client, "robots.txt"),
  (isIndexable
    ? [
        "User-agent: *",
        "Allow: /",
        "",
        "# Resized derivatives are regenerable; index the pages instead.",
        "Disallow: /visual-archive/derived/",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
        "",
      ]
    : ["# Preview deployment — not for indexing.", "User-agent: *", "Disallow: /", ""]
  ).join("\n"),
  "utf8",
);

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

if (siteUrl === PLACEHOLDER_ORIGIN) {
  console.warn(
    `Warning: SITE_URL is unset, so canonical URLs and sitemap.xml use ${PLACEHOLDER_ORIGIN}. ` +
      "Set SITE_URL before a public deploy.",
  );
}

console.log(
  `Prepared Sites build: ${routes.length} route shells, sitemap.xml, robots.txt, ` +
    "dist/server/index.js, and dist/.openai/hosting.json",
);
