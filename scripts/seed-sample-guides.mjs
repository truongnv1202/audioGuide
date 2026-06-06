import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSampleGuides } from "../src/lib/sampleGuides.js";

const outputPath = process.env.GUIDES_DATA_PATH || path.join(process.cwd(), "data", "guides.json");
const guides = createSampleGuides();

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(guides, null, 2)}\n`, "utf8");

console.log(`Created ${outputPath}`);
console.log(`Total guides: ${guides.length}`);
