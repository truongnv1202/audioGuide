const MAX_CANDLES = 108;
const EMBER_COUNT = 240;
const FLOOR_ROWS = 11;
const COLS_PER_ROW = 14;
const AISLE_COUNT = 36;

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function depthProfile(depth, random) {
  const scale = 0.1 + depth * 1.28;
  const opacity = 0.18 + depth * 0.82;
  const blur = depth < 0.18 ? 2.8 : depth < 0.42 ? 1.4 : depth < 0.68 ? 0.45 : 0;
  const z = -340 + depth * 320;
  const tiltX = -6 + depth * 14 + (random() - 0.5) * 4;

  return { scale, opacity, blur, z, tiltX };
}

function createCandle(id, x, y, depth, random) {
  return {
    id,
    kind: "candle",
    x,
    y,
    ...depthProfile(depth, random),
    depth,
    flickerDelay: random() * 3,
    swayDelay: random() * 4.5,
    swayDuration: 2.2 + random() * 2.6,
  };
}

function pushFloorGrid(candles, random) {
  for (let row = 0; row < FLOOR_ROWS && candles.length < MAX_CANDLES - AISLE_COUNT; row += 1) {
    const depth = row / (FLOOR_ROWS - 1);
    const y = 24 + depth * depth * 74;

    for (let col = 0; col < COLS_PER_ROW && candles.length < MAX_CANDLES - AISLE_COUNT; col += 1) {
      if (row < 3 && random() > 0.55) {
        continue;
      }

      if (row > 2 && random() > 0.9) {
        continue;
      }

      const lane = col / (COLS_PER_ROW - 1);
      const x = -16 + lane * 132 + (random() - 0.5) * (10 - depth * 6);

      candles.push(createCandle(`floor-${row}-${col}`, x, y + (random() - 0.5) * 2, 0.26 + depth * 0.74, random));
    }
  }
}

function pushSideAisles(candles, random) {
  for (let index = 0; index < AISLE_COUNT && candles.length < MAX_CANDLES; index += 1) {
    const depth = random();
    const leftSide = index % 2 === 0;
    const x = leftSide ? -8 + random() * 12 : 96 + random() * 12;
    const y = 10 + depth * 88;

    candles.push(createCandle(`aisle-${index}`, x, y, depth, random));
  }
}

function createEmbers(random, count) {
  const embers = [];

  for (let index = 0; index < count; index += 1) {
    const depth = random();

    embers.push({
      id: `ember-${index}`,
      kind: "ember",
      x: -22 + random() * 144,
      y: 2 + depth * 62,
      size: 2 + random() * 5.5,
      opacity: 0.2 + random() * 0.72,
      blur: depth < 0.35 ? 1.8 : 0.5,
      flickerDelay: random() * 4,
      flickerDuration: 1.2 + random() * 2.6,
    });
  }

  return embers;
}

export function createAmbientCandles() {
  const random = mulberry32(20260404);
  const candles = [];

  pushFloorGrid(candles, random);
  pushSideAisles(candles, random);

  return [...createEmbers(random, EMBER_COUNT), ...candles];
}

export function createUserCandle(id) {
  const depth = 0.78 + Math.random() * 0.2;
  const profile = depthProfile(depth, () => Math.random());

  return {
    id,
    kind: "candle",
    x: -6 + Math.random() * 112,
    y: 84 + Math.random() * 14,
    ...profile,
    opacity: 0.98,
    blur: 0,
    depth,
    flickerDelay: Math.random() * 1.5,
    swayDelay: Math.random() * 2,
    swayDuration: 2 + Math.random() * 2,
    isNew: true,
  };
}
