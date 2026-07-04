import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const DEFAULT_MARQUEE_TEXT =
  "Hoà Bình không dễ có • Đời Đời nhớ ơn các anh Hùng liệt sĩ • ";

function getSiteSettingsPath() {
  return process.env.SITE_SETTINGS_PATH || path.join(process.cwd(), "data", "site-settings.json");
}

export function normalizeMarqueeText(value) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  if (!text) {
    return DEFAULT_MARQUEE_TEXT;
  }

  return text.endsWith(" • ") || text.endsWith("•") ? text : `${text} • `;
}

export async function getSiteSettings() {
  const filePath = getSiteSettingsPath();

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      marqueeText: normalizeMarqueeText(parsed?.marqueeText),
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        marqueeText: DEFAULT_MARQUEE_TEXT,
      };
    }

    throw error;
  }
}

export async function updateSiteSettings(payload) {
  const current = await getSiteSettings();
  const next = {
    marqueeText: Object.prototype.hasOwnProperty.call(payload, "marqueeText")
      ? normalizeMarqueeText(payload.marqueeText)
      : current.marqueeText,
  };

  const filePath = getSiteSettingsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `${JSON.stringify({ ...next, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );

  return next;
}
