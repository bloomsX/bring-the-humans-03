// bring-the-humans-03 — the entry program (Node 22, standard library only).
//
// The entry is the TikTok video itself; this program only hands the house
// the video's address. It reads VIDEO.json from the repository root, checks
// the address has the shape the gate accepts
// (https://www.tiktok.com/@<handle>/video/<digits>), and copies the file to
// the output directory, where the house reads it. Nothing else is written:
// the house reads the video's views from TikTok on its own.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const VIDEO_FILE = "VIDEO.json";

// A TikTok video address, as the gate reads it: the handle, then /video/,
// then digits only. A short link (vm.tiktok.com, vt.tiktok.com, tiktok.com/t)
// or a photo address (/photo/<id>) does not match and is refused.
const VIDEO_URL = /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+\/?$/;

function fail(message: string): never {
  console.error(`VIDEO.json: ${message}`);
  process.exit(1);
}

const sourcePath = join(BOT_DIR, VIDEO_FILE);
if (!existsSync(sourcePath)) {
  fail(`not found at ${sourcePath}`);
}

let video: unknown;
try {
  video = JSON.parse(readFileSync(sourcePath, "utf8"));
} catch (err) {
  fail(`not valid JSON: ${(err as Error).message}`);
}
if (typeof video !== "object" || video === null || !("url" in video)) {
  fail("must be a JSON object with a url field");
}

const url = (video as { url: unknown }).url;
if (typeof url === "string" && (url.includes("<handle>") || url.includes("<id>"))) {
  fail("still holds the placeholder — replace it with the posted video's address");
}
if (typeof url !== "string" || !VIDEO_URL.test(url)) {
  fail(
    `url must look like https://www.tiktok.com/@<handle>/video/<id>, got ${JSON.stringify(url)}`,
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(sourcePath, join(OUTPUT_DIR, VIDEO_FILE));
console.log(`VIDEO.json copied to ${OUTPUT_DIR} for ${url}`);
