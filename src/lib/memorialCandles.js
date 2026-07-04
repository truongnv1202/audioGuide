export function getViewportSpawnOrigin() {
  if (typeof window === "undefined") {
    return { fromX: 50, fromY: 97 };
  }

  const height = window.innerHeight || 1;
  const anchorFromBottom = Math.max(64, height * 0.09);

  return {
    fromX: 50,
    fromY: ((height - anchorFromBottom) / height) * 100,
  };
}

export function createUserCandle(id, origin = {}) {
  const spawn = getViewportSpawnOrigin();
  const fromX = origin.fromX ?? spawn.fromX;
  const fromY = origin.fromY ?? spawn.fromY;

  return {
    id,
    fromX,
    fromY,
    targetX: 48 + Math.random() * 4,
    targetY: 14 + Math.random() * 8,
  };
}

export const USER_CANDLE_HOLD_MS = 4500;
export const USER_CANDLE_TOTAL_MS = 10000;

export const USER_CANDLE_HOLD_RATIO = USER_CANDLE_HOLD_MS / USER_CANDLE_TOTAL_MS;
