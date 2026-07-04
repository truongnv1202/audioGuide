export function createUserCandle(id, origin = {}) {
  const fromX = origin.fromX ?? 50;
  const fromY = origin.fromY ?? 88;

  return {
    id,
    fromX,
    fromY,
    targetX: 47 + Math.random() * 6,
    targetY: 16 + Math.random() * 10,
  };
}

export const USER_CANDLE_HOLD_MS = 3000;
export const USER_CANDLE_TOTAL_MS = 4800;
