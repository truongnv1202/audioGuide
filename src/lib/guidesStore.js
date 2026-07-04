import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  normalizeAudioGenerationCount,
  normalizeGuideDisplay,
  normalizePlaybackRate,
} from "@/lib/guideDefaults";
import { createSampleGuides } from "@/lib/sampleGuides";

const EDITABLE_STRING_FIELDS = [
  "title",
  "subtitle",
  "title1",
  "title2",
  "title3",
  "homeTitle",
  "description",
  "imageUrl",
  "audioUrl",
  "audioGeneratedAt",
];
const EDITABLE_NUMBER_FIELDS = ["playbackRate", "audioGenerationCount"];
const EDITABLE_OBJECT_FIELDS = ["titleLayout", "imageLayout"];

export function getGuidesDataPath() {
  return process.env.GUIDES_DATA_PATH || path.join(process.cwd(), "data", "guides.json");
}

export function getGuidesDataDir() {
  return process.env.GUIDES_DATA_DIR || path.join(path.dirname(getGuidesDataPath()), "guides");
}

function guideFileName(id) {
  return `${String(id).padStart(2, "0")}.json`;
}

function guideFilePath(id) {
  return path.join(getGuidesDataDir(), guideFileName(id));
}

async function writeGuide(guide) {
  await mkdir(getGuidesDataDir(), { recursive: true });
  await writeFile(guideFilePath(guide.id), `${JSON.stringify(guide, null, 2)}\n`, "utf8");
}

async function writeGuides(guides) {
  await mkdir(getGuidesDataDir(), { recursive: true });
  await Promise.all(guides.map((guide) => writeGuide(guide)));
}

export async function ensureGuidesFile() {
  await mkdir(getGuidesDataDir(), { recursive: true });

  try {
    const files = await readdir(getGuidesDataDir());

    if (files.some((file) => /^\d+\.json$/.test(file))) {
      return;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  try {
    const raw = await readFile(getGuidesDataPath(), "utf8");
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      await writeGuides(parsed.map((guide) => normalizeGuideDisplay(guide)));
      return;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await writeGuides(createSampleGuides());
}

export async function getGuides() {
  await ensureGuidesFile();

  const files = (await readdir(getGuidesDataDir()))
    .filter((file) => /^\d+\.json$/.test(file))
    .sort((left, right) => left.localeCompare(right));
  const parsed = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(path.join(getGuidesDataDir(), file), "utf8"))),
  );

  return parsed
    .map((guide) => normalizeGuideDisplay(guide))
    .sort((left, right) => left.id - right.id);
}

export async function getGuideById(id) {
  const numericId = Number(id);
  const guides = await getGuides();
  return guides.find((guide) => guide.id === numericId) ?? null;
}

export async function updateGuideById(id, payload) {
  const numericId = Number(id);
  const guide = await getGuideById(numericId);

  if (!guide) {
    return null;
  }

  const updates = Object.fromEntries(
    EDITABLE_STRING_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(payload, field))
      .map((field) => [field, String(payload[field] ?? "")]),
  );

  for (const field of EDITABLE_NUMBER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] =
        field === "playbackRate"
          ? normalizePlaybackRate(payload[field])
          : normalizeAudioGenerationCount(payload[field]);
    }
  }

  for (const field of EDITABLE_OBJECT_FIELDS) {
    if (
      Object.prototype.hasOwnProperty.call(payload, field) &&
      payload[field] &&
      typeof payload[field] === "object" &&
      !Array.isArray(payload[field])
    ) {
      updates[field] = {
        ...(guide[field] || {}),
        ...payload[field],
      };
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, "title1")) {
    updates.title = updates.title1;
  } else if (Object.prototype.hasOwnProperty.call(updates, "title")) {
    updates.title1 = updates.title;
  }

  if (Object.prototype.hasOwnProperty.call(updates, "title2")) {
    updates.subtitle = updates.title2;
  } else if (Object.prototype.hasOwnProperty.call(updates, "subtitle")) {
    updates.title2 = updates.subtitle;
  }

  const updatedGuide = {
    ...guide,
    ...updates,
    id: numericId,
  };

  await writeGuide(updatedGuide);
  return normalizeGuideDisplay(updatedGuide);
}

export async function resetSampleGuides() {
  const guides = createSampleGuides();
  await writeGuides(guides);
  return guides;
}
