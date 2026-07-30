#!/usr/bin/env node
/**
 * Generates responsive derivatives for the visual archive.
 *
 * The archival originals stay untouched — they are the artifacts the SHA-256
 * digests in `visual_archive.json` attest to. Derivatives are regenerable and
 * gitignored. This matters more than usual here: the atlas documents throttling
 * and shutdowns, and its readers are the people most likely to be on a degraded
 * connection, so shipping 1920px originals to a phone is a substantive failure.
 */
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "public", "visual-archive");
const outputDir = path.join(sourceDir, "derived");

/** Shared with the renderer via JSON so the two cannot drift apart. */
const DERIVATIVE_WIDTHS = JSON.parse(
  readFileSync(path.join(root, "src", "data", "image-widths.json"), "utf8"),
);

const archive = JSON.parse(
  readFileSync(path.join(root, "src", "data", "visual_archive.json"), "utf8"),
);

mkdirSync(outputDir, { recursive: true });

let generated = 0;
let reused = 0;
let originalBytes = 0;
let derivedBytes = 0;

for (const record of archive.records) {
  const sourcePath = path.join(root, "public", record.image.src.replace(/^\//, ""));
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing archival original: ${sourcePath}`);
  }

  originalBytes += statSync(sourcePath).size;
  const sourceMtime = statSync(sourcePath).mtimeMs;
  const widths = DERIVATIVE_WIDTHS.filter((width) => width < record.image.width);

  for (const width of widths) {
    for (const [format, options] of [
      ["webp", { quality: 74, effort: 5 }],
      ["jpg", { quality: 76, mozjpeg: true }],
    ]) {
      const target = path.join(outputDir, `${record.id}-${width}.${format}`);

      if (existsSync(target) && statSync(target).mtimeMs >= sourceMtime) {
        derivedBytes += statSync(target).size;
        reused += 1;
        continue;
      }

      const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });
      await (format === "webp" ? pipeline.webp(options) : pipeline.jpeg(options)).toFile(target);

      derivedBytes += statSync(target).size;
      generated += 1;
    }
  }
}

const mb = (bytes) => `${(bytes / 1_048_576).toFixed(1)} MB`;

console.log(
  `Visual archive images: ${generated} generated, ${reused} reused. ` +
    `Originals ${mb(originalBytes)} retained; derivatives ${mb(derivedBytes)}.`,
);
