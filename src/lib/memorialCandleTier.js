export const CANDLE_TIER_CONFIG = {
  high: {
    floorRows: 16,
    colsPerRow: 18,
    aisleCount: 40,
    fieldCount: 50,
    emberCount: 220,
    glowCount: 50,
    maxSvg: 200,
  },
  low: {
    floorRows: 9,
    colsPerRow: 11,
    aisleCount: 14,
    fieldCount: 0,
    emberCount: 88,
    glowCount: 20,
    maxSvg: 42,
  },
};

export function resolveCandleTier() {
  if (typeof window === "undefined") {
    return "low";
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  const mobileQuery = window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)");

  return mobileQuery.matches ? "low" : "high";
}

export function isMobileViewport() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)").matches;
}

export function maxUserCandlesForTier(tier) {
  return tier === "low" ? 12 : 32;
}
