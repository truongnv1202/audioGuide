const AMBIENT_COUNT = 148;

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function depthProfile(depth, random) {
  const scale = 0.14 + depth * 1.18;
  const opacity = 0.22 + depth * 0.78;
  const blur = depth < 0.22 ? 2.4 : depth < 0.48 ? 1.1 : depth < 0.72 ? 0.35 : 0;
  const z = -280 + depth * 260;
  const tiltX = -4 + depth * 10 + (random() - 0.5) * 3;

  return { scale, opacity, blur, z, tiltX };
}

export function createAmbientCandles(count = AMBIENT_COUNT) {
  const random = mulberry32(20260404);
  const candles = [];

  for (let index = 0; index < count; index += 1) {
    const depth = random();
    const lane = index % 5;
    let x;
    let y;

    if (lane === 0) {
      x = random() * 100;
      y = 52 + depth * 46;
    } else if (lane === 1) {
      x = random() * 18;
      y = 18 + depth * 78;
    } else if (lane === 2) {
      x = 82 + random() * 18;
      y = 18 + depth * 78;
    } else if (lane === 3) {
      x = 8 + random() * 84;
      y = 8 + depth * 38;
    } else {
      x = random() * 100;
      y = 28 + depth * 62;
    }

    const profile = depthProfile(depth, random);

    candles.push({
      id: `ambient-${index}`,
      x,
      y,
      ...profile,
      depth,
      flickerDelay: random() * 2.8,
      swayDelay: random() * 4,
      swayDuration: 2.4 + random() * 2.8,
    });
  }

  return candles;
}

export function createUserCandle(id) {
  const depth = 0.62 + Math.random() * 0.36;
  const profile = depthProfile(depth, () => Math.random());

  return {
    id,
    x: 6 + Math.random() * 88,
    y: 58 + Math.random() * 38,
    ...profile,
    opacity: 0.96,
    blur: 0,
    depth,
    flickerDelay: Math.random() * 1.5,
    swayDelay: Math.random() * 2,
    swayDuration: 2.2 + Math.random() * 2.2,
    isNew: true,
  };
}
