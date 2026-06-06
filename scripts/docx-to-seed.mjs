import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DEFAULT_DOCX_PATH =
  "C:\\Users\\vsp\\Downloads\\[Chiều 23.4. 2026] KB PHÂN KHU 5 - sửa theo góp ý của X03 (1).docx";
const TOTAL_GUIDES = Number.parseInt(process.env.SEED_TOTAL ?? "24", 10);
const OUTPUT_PATH = path.join(projectRoot, "src", "data", "seed.js");
const PLACEHOLDER_DESCRIPTION =
  "Nội dung thuyết minh sẽ được cập nhật từ file DOCX.";

function normalizeLine(line) {
  return line.replace(/\s+/g, " ").trim();
}

function stripTitlePrefix(line, fallbackId) {
  return line
    .replace(new RegExp(`^(id|mã|bài|điểm|trạm|khu)\\s*[:.\\-]?\\s*${fallbackId}\\s*[:.\\-]?\\s*`, "i"), "")
    .replace(new RegExp(`^${fallbackId}\\s*[).\\-:]\\s*`), "")
    .trim();
}

function getStartedGuideId(line) {
  const normalized = normalizeLine(line);
  const patterns = [
    /^(?:id|mã|bài|điểm|trạm|khu)\s*[:.\-]?\s*(\d{1,2})\b/i,
    /^(\d{1,2})\s*[).\-:]\s+\S+/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const id = Number.parseInt(match[1], 10);
      if (id >= 1 && id <= TOTAL_GUIDES) {
        return id;
      }
    }
  }

  return null;
}

function splitByDetectedIds(lines) {
  const starts = lines
    .map((line, index) => ({ id: getStartedGuideId(line), index }))
    .filter((item) => item.id !== null);

  if (starts.length < Math.min(6, TOTAL_GUIDES)) {
    return null;
  }

  const chunks = new Map();
  starts.forEach((start, position) => {
    const next = starts[position + 1];
    const chunkLines = lines.slice(start.index, next?.index ?? lines.length);
    chunks.set(start.id, chunkLines);
  });

  return Array.from({ length: TOTAL_GUIDES }, (_, index) => chunks.get(index + 1) ?? []);
}

function splitEvenly(lines) {
  const chunkSize = Math.max(1, Math.ceil(lines.length / TOTAL_GUIDES));
  return Array.from({ length: TOTAL_GUIDES }, (_, index) =>
    lines.slice(index * chunkSize, (index + 1) * chunkSize),
  );
}

function buildGuide(id, chunkLines) {
  const lines = chunkLines.map(normalizeLine).filter(Boolean);
  const rawTitle = stripTitlePrefix(lines[0] ?? "", id);
  const maybeSubtitle = lines[1] ?? "";
  const hasSubtitle =
    maybeSubtitle.length > 0 &&
    maybeSubtitle.length <= 80 &&
    (/^\(.+\)$/.test(maybeSubtitle) || !/[.!?]$/.test(maybeSubtitle));
  const descriptionLines = lines.slice(hasSubtitle ? 2 : 1);
  const title = rawTitle || `Audio guide ${String(id).padStart(2, "0")}`;

  return {
    id,
    title,
    subtitle: hasSubtitle ? maybeSubtitle : "",
    description: descriptionLines.join("\n\n") || PLACEHOLDER_DESCRIPTION,
    imageUrl: `/images/items/${String(id).padStart(2, "0")}.jpg`,
    audioUrl: `/audio/${String(id).padStart(2, "0")}.mp3`,
  };
}

function createSeedFile(guides) {
  return `export const guides = ${JSON.stringify(guides, null, 2)};

export function getGuideById(id) {
  const numericId = Number(id);
  return guides.find((guide) => guide.id === numericId) ?? null;
}
`;
}

async function main() {
  const docxPath = process.env.DOCX_PATH || DEFAULT_DOCX_PATH;
  const result = await mammoth.extractRawText({ path: docxPath });
  const lines = result.value
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("DOCX không có nội dung text để tạo seed.");
  }

  const chunks = splitByDetectedIds(lines) ?? splitEvenly(lines);
  const guides = chunks.map((chunkLines, index) => buildGuide(index + 1, chunkLines));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, createSeedFile(guides), "utf8");

  console.log(`Created ${OUTPUT_PATH}`);
  console.log(`Total guides: ${guides.length}`);
  console.log(`Source DOCX: ${docxPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
