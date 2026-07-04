const FLOOR_ROWS = 20;
const COLS_PER_ROW = 24;
const AISLE_COUNT = 72;
const FIELD_COUNT = 88;
const EMBER_COUNT = 460;
const GLOW_COUNT = 110;

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function depthProfile(depth, random) {
  const scale = 0.12 + depth * 1.32;
  const opacity = 0.28 + depth * 0.72;
  const blur = depth < 0.15 ? 2.2 : depth < 0.38 ? 1.1 : depth < 0.65 ? 0.35 : 0;
  const z = -360 + depth * 340;
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
    flickerDelay: random() * 3.2,
    swayDelay: random() * 4.8,
    swayDuration: 2 + random() * 2.8,
  };
}

function pushFloorGrid(candles, random) {
  for (let row = 0; row < FLOOR_ROWS; row += 1) {
    const depth = row / (FLOOR_ROWS - 1);
    const y = 10 + depth * depth * 88;

    for (let col = 0; col < COLS_PER_ROW; col += 1) {
      if (row < 2 && random() > 0.25) {
        continue;
      }

      if (row < 6 && random() > 0.82) {
        continue;
      }

      if (row >= 6 && random() > 0.97) {
        continue;
      }

      const lane = col / (COLS_PER_ROW - 1);
      const x = -22 + lane * 144 + (random() - 0.5) * (8 - depth * 5);

      candles.push(createCandle(`floor-${row}-${col}`, x, y + (random() - 0.5) * 2.5, 0.2 + depth * 0.8, random));
    }
  }
}

function pushSideAisles(candles, random) {
  for (let index = 0; index < AISLE_COUNT; index += 1) {
    const depth = random();
    const leftSide = index % 2 === 0;
    const x = leftSide ? -14 + random() * 16 : 98 + random() * 16;
    const y = 4 + depth * 94;

    candles.push(createCandle(`aisle-${index}`, x, y, depth, random));
  }
}

function pushFieldFill(candles, random) {
  for (let index = 0; index < FIELD_COUNT; index += 1) {
    const depth = 0.15 + random() * 0.85;
    const x = -24 + random() * 148;
    const y = 6 + random() * 92;

    candles.push(createCandle(`field-${index}`, x, y, depth, random));
  }
}

function createEmbers(random, count) {
  const embers = [];

  for (let index = 0; index < count; index += 1) {
    const band = index % 4;
    let x;
    let y;

    if (band === 0) {
      x = -24 + random() * 148;
      y = random() * 98;
    } else if (band === 1) {
      x = -24 + random() * 148;
      y = 55 + random() * 44;
    } else if (band === 2) {
      x = -24 + random() * 28;
      y = random() * 98;
    } else {
      x = 96 + random() * 28;
      y = random() * 98;
    }

    embers.push({
      id: `ember-${index}`,
      kind: "ember",
      x,
      y,
      size: 1.8 + random() * 6,
      opacity: 0.32 + random() * 0.68,
      blur: random() < 0.35 ? 1.4 : 0.35,
      flickerDelay: random() * 4.5,
      flickerDuration: 0.9 + random() * 2.4,
    });
  }

  return embers;
}

function createGlows(random, count) {
  const glows = [];

  for (let index = 0; index < count; index += 1) {
    glows.push({
      id: `glow-${index}`,
      kind: "glow",
      x: -20 + random() * 140,
      y: 8 + random() * 90,
      size: 10 + random() * 22,
      opacity: 0.22 + random() * 0.55,
      flickerDelay: random() * 5,
      flickerDuration: 1.6 + random() * 3.2,
    });
  }

  return glows;
}

export function createAmbientCandles() {
  const random = mulberry32(20260404);
  const candles = [];

  pushFloorGrid(candles, random);
  pushSideAisles(candles, random);
  pushFieldFill(candles, random);

  return [...createEmbers(random, EMBER_COUNT), ...createGlows(random, GLOW_COUNT), ...candles];
}

export function createUserCandle(id, index = 0) {
  const col = index % 5;
  const row = Math.floor(index / 5) % 2;
  const targetX = 87 - col * 3.2 + Math.random() * 1.5;
  const targetY = 85 - row * 6.5 + Math.random() * 1.5;

  return {
    id,
    kind: "user",
    fromX: 50,
    fromY: 70,
    targetX,
    targetY,
    x: targetX,
    y: targetY,
    scale: 0.64,
    opacity: 1,
    blur: 0,
    z: 140,
    tiltX: 11,
    depth: 0.96,
    isFlying: true,
    flickerDelay: Math.random() * 1.2,
    swayDelay: Math.random() * 2,
    swayDuration: 2.2 + Math.random() * 1.8,
  };
}
