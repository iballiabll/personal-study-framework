import { copyFile, mkdir, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const staging = join(root, "dist-staging");
const output = join(root, "dist");
const files = [
  "index.html",
  "src/app.js",
  "src/style.css",
  "src/study-core.js",
  "src/vocab-recite-api.js",
  "src/exam-scores.js",
  "src/writing-grade.js",
  "schema/study-pack.schema.json",
];

await rm(staging, { recursive: true, force: true });
for (const file of files) {
  const target = join(staging, file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(join(root, file), target);
}
await rm(output, { recursive: true, force: true });
await rename(staging, output);
console.log(`Built ${files.length} framework files.`);
