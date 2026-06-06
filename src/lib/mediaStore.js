import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const AUDIO_TYPES = new Map([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
]);

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp3: "audio/mpeg",
};

function getUploadsRoot() {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "data", "uploads");
}

function getPublicAudioRoot() {
  return process.env.PUBLIC_AUDIO_DIR || path.join(process.cwd(), "public", "audio");
}

function getExtensionFromName(name) {
  return path.extname(name || "").replace(".", "").toLowerCase();
}

function resolveExtension(file, allowedTypes) {
  const extensionFromType = allowedTypes.get(file.type);
  const extensionFromName = getExtensionFromName(file.name);

  if (extensionFromType) {
    return extensionFromType;
  }

  if ([...allowedTypes.values()].includes(extensionFromName)) {
    return extensionFromName;
  }

  return null;
}

export function getMediaPath(kind, filename) {
  const safeFilename = path.basename(filename);
  const directory = kind === "images" ? "images" : kind === "audio" ? "audio" : "";

  if (!directory || safeFilename !== filename) {
    return null;
  }

  return path.join(getUploadsRoot(), directory, safeFilename);
}

export function getMediaContentType(filename) {
  return CONTENT_TYPES[getExtensionFromName(filename)] || "application/octet-stream";
}

export async function readMediaFile(kind, filename) {
  const mediaPath = getMediaPath(kind, filename);

  if (!mediaPath) {
    return null;
  }

  try {
    return await readFile(mediaPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function saveGuideUpload(guideId, fieldName, file) {
  const numericId = Number(guideId);
  const paddedId = String(numericId).padStart(2, "0");
  const isImage = fieldName === "image";
  const isAudio = fieldName === "audio";

  if (!Number.isInteger(numericId) || numericId < 1 || (!isImage && !isAudio)) {
    return null;
  }

  const extension = resolveExtension(file, isImage ? IMAGE_TYPES : AUDIO_TYPES);

  if (!extension) {
    throw new Error(isImage ? "Unsupported image type" : "Unsupported audio type");
  }

  const directory = isImage ? "images" : "audio";
  const filename = `${paddedId}.${extension}`;
  const outputPath = path.join(getUploadsRoot(), directory, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  return {
    field: isImage ? "imageUrl" : "audioUrl",
    url: `/media/${directory}/${filename}`,
  };
}

export async function saveGeneratedGuideAudio(guideId, audioBuffer, generationCount) {
  const numericId = Number(guideId);

  if (!Number.isInteger(numericId) || numericId < 1 || !Buffer.isBuffer(audioBuffer)) {
    return null;
  }

  const paddedId = String(numericId).padStart(2, "0");
  const filename = `${paddedId}.mp3`;
  const outputPath = path.join(getPublicAudioRoot(), filename);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, audioBuffer);

  return {
    field: "audioUrl",
    url: `/audio/${filename}`,
  };
}
