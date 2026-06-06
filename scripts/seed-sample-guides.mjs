import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSampleGuides } from "../src/lib/sampleGuides.js";

const outputPath = process.env.GUIDES_DATA_PATH || path.join(process.cwd(), "data", "guides.json");
const outputDir = process.env.GUIDES_DATA_DIR || path.join(path.dirname(outputPath), "guides");
const guides = createSampleGuides();

await mkdir(outputDir, { recursive: true });
await Promise.all(
  guides.map((guide) =>
    writeFile(
      path.join(outputDir, `${String(guide.id).padStart(2, "0")}.json`),
      `${JSON.stringify(guide, null, 2)}\n`,
      "utf8",
    ),
  ),
);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(guides, null, 2)}\n`, "utf8");

console.log(`Created ${outputDir}`);
console.log(`Created ${outputPath}`);
console.log(`Total guides: ${guides.length}`);
