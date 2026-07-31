#!/usr/bin/env node
/**
 * Link-liveness check for the corpus.
 *
 * `last_checked` is a manual claim. This turns it into something verifiable:
 * every canonical URL, archived snapshot, and visual-archive context source is
 * requested and its status reported. Read-only — it never writes to the corpus
 * and never submits anything to an archiving service; promoting a result into
 * `verification_status` stays a human decision.
 *
 * Usage:
 *   node scripts/check-links.mjs            # check everything
 *   node scripts/check-links.mjs --json     # machine-readable report
 *   node scripts/check-links.mjs --limit 10 # sample the first N
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const limitFlag = args.indexOf("--limit");
const limit = limitFlag === -1 ? Infinity : Number(args[limitFlag + 1]);

const REQUEST_TIMEOUT_MS = 15_000;
const CONCURRENCY = 6;
const USER_AGENT =
  "meowmeow-atlas-link-check/1.0 (+research index maintenance; contact via repository)";

const sources = JSON.parse(
  readFileSync(path.join(root, "src", "data", "verified_sources.json"), "utf8"),
);
const archive = JSON.parse(
  readFileSync(path.join(root, "src", "data", "visual_archive.json"), "utf8"),
);

const targets = [];
for (const record of sources) {
  targets.push({ id: record.id, field: "url", url: record.url });
  if (record.identifiers?.archived_url) {
    targets.push({ id: record.id, field: "archived_url", url: record.identifiers.archived_url });
  }
}
for (const record of archive.records) {
  targets.push({ id: record.id, field: "image.origin_url", url: record.image.origin_url });
  record.context_sources.forEach((source, index) => {
    targets.push({ id: record.id, field: `context_sources[${index}]`, url: source.url });
  });
}

const queue = targets.slice(0, limit);

async function probe(target) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(target.url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT, accept: "*/*" },
      });
      return { status: response.status, finalUrl: response.url };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    // Many publishers reject HEAD outright; fall back to a full GET.
    let result = await attempt("HEAD");
    if ([403, 405, 429, 501].includes(result.status)) {
      result = await attempt("GET");
    }

    return {
      ...target,
      status: result.status,
      // 403/429 from a scripted client is almost always a bot filter, not a
      // dead document — several rights organisations sit behind a WAF. Treat it
      // as "could not verify" so the weekly job does not cry wolf, but keep it
      // visible so a genuine takedown is not hidden by the same status.
      state:
        result.status >= 200 && result.status < 400
          ? "ok"
          : [401, 403, 429].includes(result.status)
            ? "blocked"
            : "dead",
      redirected: result.finalUrl !== target.url ? result.finalUrl : null,
      error: null,
    };
  } catch (error) {
    return {
      ...target,
      status: null,
      state: "dead",
      redirected: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const results = [];
let cursor = 0;

await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (cursor < queue.length) {
      const target = queue[cursor++];
      results.push(await probe(target));
    }
  }),
);

results.sort((a, b) => a.id.localeCompare(b.id) || a.field.localeCompare(b.field));

const dead = results.filter((result) => result.state === "dead");
const blocked = results.filter((result) => result.state === "blocked");
const redirects = results.filter((result) => result.state === "ok" && result.redirected);

if (asJson) {
  console.log(
    JSON.stringify({ checked: results.length, dead, blocked, redirects, results }, null, 2),
  );
} else {
  for (const result of dead) {
    console.log(`DEAD    ${result.status ?? result.error}  ${result.id} (${result.field})`);
    console.log(`        ${result.url}`);
  }
  for (const result of blocked) {
    console.log(`BLOCKED ${result.status}  ${result.id} (${result.field})`);
    console.log(`        ${result.url}`);
  }
  for (const result of redirects) {
    console.log(`MOVED   ${result.status}  ${result.id} (${result.field})`);
    console.log(`        ${result.url}\n     -> ${result.redirected}`);
  }

  console.log(
    `\nChecked ${results.length} links: ${results.length - dead.length - blocked.length} reachable, ` +
      `${dead.length} dead, ${blocked.length} blocked by a bot filter, ${redirects.length} redirected.`,
  );

  if (dead.length > 0) {
    console.log(
      "\nDead links are a signal, not a verdict: confirm by hand, then update " +
        "verification_status and last_checked, or record an archived_url.",
    );
  }
  if (blocked.length > 0) {
    console.log(
      "\nBlocked links could not be verified from a script — several rights " +
        "organisations sit behind a WAF. Open them in a browser to confirm.",
    );
  }
  if (redirects.length > 0) {
    console.log(
      "\nRedirects still resolve, but the corpus should cite the canonical URL. " +
        "Updating a record's url is a research decision, so this script leaves it alone.",
    );
  }
}

// Only genuine disappearance fails the job; bot filters would make it
// permanently red and train everyone to ignore it.
process.exitCode = dead.length > 0 ? 1 : 0;
