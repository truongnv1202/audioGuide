"use client";

import MemorialCupCandle from "@/components/MemorialCupCandle";

function FlyingCandle({ candle }) {
  const style = {
    "--fly-from-x": `${candle.fromX}%`,
    "--fly-from-y": `${candle.fromY}%`,
    "--fly-to-x": `${candle.targetX}%`,
    "--fly-to-y": `${candle.targetY}%`,
  };

  return (
    <div className="memorial-flying-candle" style={style}>
      <div className="memorial-flying-candle-halo" aria-hidden="true" />
      <div className="memorial-flying-candle-sparkle" aria-hidden="true" />
      <div className="memorial-flying-candle-sway">
        <MemorialCupCandle className="memorial-flying-candle-icon" withLotus flickerDelay={0} />
      </div>
    </div>
  );
}

export default function MemorialCandleRoom({ userCandles }) {
  return (
    <div className="memorial-static-scene pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <picture>
        <source srcSet="/images/memorial-candle-bg.webp" type="image/webp" />
        <img
          src="/images/memorial-candle-bg.png"
          alt=""
          className="memorial-candle-bg-image"
          decoding="async"
          fetchPriority="low"
        />
      </picture>
      <div className="memorial-candle-bg-overlay absolute inset-0" />

      {userCandles.map((candle) => (
        <FlyingCandle key={candle.id} candle={candle} />
      ))}
    </div>
  );
}
