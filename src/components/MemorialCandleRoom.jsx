"use client";

import MemorialCupCandle from "@/components/MemorialCupCandle";
import { USER_CANDLE_TOTAL_MS } from "@/lib/memorialCandles";

function FlyingCandle({ candle }) {
  const style = {
    "--fly-from-x": `${candle.fromX}%`,
    "--fly-from-y": `${candle.fromY}%`,
    "--fly-to-x": `${candle.targetX}%`,
    "--fly-to-y": `${candle.targetY}%`,
    "--fly-duration": `${USER_CANDLE_TOTAL_MS}ms`,
  };

  return (
    <div className="memorial-flying-candle" style={style}>
      <div className="memorial-flying-candle-halo" aria-hidden="true" />
      <div className="memorial-flying-candle-aura" aria-hidden="true" />
      <div className="memorial-flying-candle-sway">
        <MemorialCupCandle className="memorial-flying-candle-icon" />
      </div>
    </div>
  );
}

export default function MemorialCandleRoom({ userCandles }) {
  return (
    <>
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
      </div>

      <div className="memorial-flying-candles pointer-events-none fixed inset-0 z-[35] overflow-hidden" aria-hidden="true">
        {userCandles.map((candle) => (
          <FlyingCandle key={candle.id} candle={candle} />
        ))}
      </div>
    </>
  );
}
