import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSampleGuides } from "@/lib/sampleGuides";

const EDITABLE_FIELDS = ["title", "subtitle", "description", "imageUrl", "audioUrl"];

export function getGuidesDataPath() {
  return process.env.GUIDES_DATA_PATH || path.join(process.cwd(), "data", "guides.json");
}

async function writeGuides(guides) {
  const dataPath = getGuidesDataPath();
  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(guides, null, 2)}\n`, "utf8");
}

export async function ensureGuidesFile() {
  try {
    await readFile(getGuidesDataPath(), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await writeGuides(createSampleGuides());
  }
}

export async function getGuides() {
  await ensureGuidesFile();

  const raw = await readFile(getGuidesDataPath(), "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("guides.json must contain an array");
  }

  return parsed.sort((left, right) => left.id - right.id);
}

export async function getGuideById(id) {
  const numericId = Number(id);
  const guides = await getGuides();
  return guides.find((guide) => guide.id === numericId) ?? null;
}

export async function updateGuideById(id, payload) {
  const numericId = Number(id);
  const guides = await getGuides();
  const index = guides.findIndex((guide) => guide.id === numericId);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    EDITABLE_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(payload, field))
      .map((field) => [field, String(payload[field] ?? "")]),
  );

  guides[index] = {
    ...guides[index],
    ...updates,
    id: numericId,
  };

  await writeGuides(guides);
  return guides[index];
}

export async function resetSampleGuides() {
  const guides = createSampleGuides();
  await writeGuides(guides);
  return guides;
}
