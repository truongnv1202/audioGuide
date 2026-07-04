import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_COUNT = 125487;

function getCandleCountPath() {
  return process.env.CANDLE_COUNT_PATH || path.join(process.cwd(), "data", "candle-count.json");
}

export async function getCandleCount() {
  const filePath = getCandleCountPath();

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const count = Number(parsed?.count);

    return Number.isFinite(count) && count >= 0 ? count : DEFAULT_COUNT;
  } catch (error) {
    if (error.code === "ENOENT") {
      return DEFAULT_COUNT;
    }

    throw error;
  }
}

export async function incrementCandleCount() {
  const filePath = getCandleCountPath();
  const count = (await getCandleCount()) + 1;

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `${JSON.stringify({ count, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );

  return count;
}
