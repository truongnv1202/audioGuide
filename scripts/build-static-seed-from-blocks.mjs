import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TOTAL_GUIDES = 24;
const blocksPath = path.join(process.cwd(), "tmp", "docx_blocks.json");
const seedPath = path.join(process.cwd(), "seed.js");
const guidesPath = path.join(process.cwd(), "data", "guides.json");

function normalizeLine(line) {
  return line.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function cleanLines(value) {
  return value
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => !/^\(\d+\s*ký\s*tự\)$/i.test(line));
}

function parseGuide(id, value) {
  const lines = cleanLines(value);
  const paddedId = String(id).padStart(2, "0");
  const title = lines[0] || `Bài thuyết minh ${paddedId}`;
  const hasSubtitle = lines[1] && /^\(.+\)$/.test(lines[1]);
  const subtitle = hasSubtitle ? lines[1] : "";
  const description = lines.slice(hasSubtitle ? 2 : 1).join("\n\n");

  return {
    id,
    title,
    subtitle,
    description: description || `Nội dung mẫu cho bài thuyết minh số ${paddedId}.`,
    imageUrl: `/images/items/${paddedId}.jpg`,
    audioUrl: `/audio/${paddedId}.mp3`,
  };
}

function buildSeedJs(guides) {
  return `import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const guides = ${JSON.stringify(guides, null, 2)};

const outputPath = process.env.GUIDES_DATA_PATH || path.join(process.cwd(), "data", "guides.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, \`\${JSON.stringify(guides, null, 2)}\\n\`, "utf8");

console.log(\`Created \${outputPath}\`);
console.log(\`Total guides: \${guides.length}\`);
`;
}

const blocks = JSON.parse(await readFile(blocksPath, "utf8"));
const table = blocks.find((block) => block.type === "table");
const guidesById = new Map();

for (const row of table?.rows || []) {
  const id = Number.parseInt(normalizeLine(row[0] || ""), 10);

  if (!Number.isInteger(id) || id < 1 || id > TOTAL_GUIDES) {
    continue;
  }

  const content = row.slice(1).find((cell) => normalizeLine(cell || "").length > 0);

  if (content) {
    guidesById.set(id, parseGuide(id, content));
  }
}

const guides = Array.from({ length: TOTAL_GUIDES }, (_, index) => guidesById.get(index + 1));

if (!guides.every(Boolean)) {
  const missing = guides
    .map((guide, index) => (guide ? null : index + 1))
    .filter(Boolean);
  throw new Error(`Missing guide ids: ${missing.join(", ")}`);
}

await mkdir(path.dirname(guidesPath), { recursive: true });
await writeFile(seedPath, buildSeedJs(guides), "utf8");
await writeFile(guidesPath, `${JSON.stringify(guides, null, 2)}\n`, "utf8");

console.log(`Wrote ${seedPath}`);
console.log(`Wrote ${guidesPath}`);
