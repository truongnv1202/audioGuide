export function createUserCandle(id) {
  return {
    id,
    fromX: 50,
    fromY: 68,
    targetX: 6 + Math.random() * 5,
    targetY: 84 + Math.random() * 8,
  };
}
