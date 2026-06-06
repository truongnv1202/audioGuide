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

function normalizeLine(line) {
  return line.replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "));
}

function cellText(cellHtml) {
  const paragraphs = [...cellHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => normalizeLine(stripHtml(match[1])))
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs.join("\n");
  }

  return normalizeLine(stripHtml(cellHtml));
}

function rowsFromHtml(html) {
  const rows = [];
  const tableRows = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  for (const rowMatch of tableRows) {
    const rowHtml = rowMatch[1];
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((match) => cellText(match[1]))
      .filter((_, index) => index < 4);

    if (cells.some(Boolean)) {
      rows.push(cells);
    }
  }

  return rows;
}

function cleanContent(value) {
  return value
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => !/^\(\d+\s*ký\s*tự\)$/i.test(line));
}

function guideFromRow(row) {
  const id = Number.parseInt(normalizeLine(row[0]), 10);
  const lines = cleanContent(row[1] ?? "");
  const title = lines[0] || `Audio guide ${String(id).padStart(2, "0")}`;
  const subtitle = lines[1] && /^\(.+\)$/.test(lines[1]) ? lines[1] : "";
  const descriptionStart = subtitle ? 2 : 1;

  return {
    id,
    title,
    subtitle,
    description: lines.slice(descriptionStart).join("\n\n"),
    imageUrl: `/images/items/${String(id).padStart(2, "0")}.jpg`,
    audioUrl: `/audio/${String(id).padStart(2, "0")}.mp3`,
  };
}

function guideRowsFromHtml(html) {
  return rowsFromHtml(html).filter((row) => {
    const id = Number.parseInt(normalizeLine(row[0] ?? ""), 10);
    return Number.isInteger(id) && id >= 1 && id <= TOTAL_GUIDES && row[1];
  });
}

function guideRowsFromRawText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
  const rows = [];

  for (let index = 0; index < lines.length; index += 1) {
    const id = Number.parseInt(lines[index], 10);
    if (!Number.isInteger(id) || id < 1 || id > TOTAL_GUIDES) {
      continue;
    }

    const nextIndex = lines.findIndex((line, offset) => {
      if (offset <= index) {
        return false;
      }

      const nextId = Number.parseInt(line, 10);
      return nextId === id + 1;
    });
    const contentLines = lines.slice(index + 1, nextIndex === -1 ? lines.length : nextIndex);
    rows.push([String(id), contentLines.join("\n")]);
  }

  return rows;
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
  const htmlResult = await mammoth.convertToHtml({ path: docxPath });
  let rows = guideRowsFromHtml(htmlResult.value);

  if (rows.length !== TOTAL_GUIDES) {
    const rawResult = await mammoth.extractRawText({ path: docxPath });
    rows = guideRowsFromRawText(rawResult.value);
  }

  if (rows.length !== TOTAL_GUIDES) {
    throw new Error(`Expected ${TOTAL_GUIDES} guide rows, found ${rows.length}.`);
  }

  const guides = rows.map(guideFromRow);
  const ids = guides.map((guide) => guide.id);
  const expectedIds = Array.from({ length: TOTAL_GUIDES }, (_, index) => index + 1);
  if (ids.join(",") !== expectedIds.join(",")) {
    throw new Error(`Guide ids are not sequential: ${ids.join(",")}.`);
  }

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
