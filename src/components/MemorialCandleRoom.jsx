"use client";

function CandleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 48" className="memorial-flying-candle-icon">
      <ellipse cx="12" cy="42" rx="5" ry="2.2" fill="rgba(0,0,0,0.38)" />
      <rect x="8.5" y="18" width="7" height="24" rx="1.5" fill="#f3e3b8" />
      <rect x="9.2" y="18" width="1.2" height="24" rx="0.6" fill="rgba(255,255,255,0.32)" />
      <path
        d="M12 18c-2.2-2.8-3.4-5.2-3.4-7.4 0-2.8 1.6-4.4 3.4-5.8 1.8 1.4 3.4 3 3.4 5.8 0 2.2-1.2 3.6-3.4 7.4Z"
        fill="#ffb347"
      />
      <path
        d="M12 10.8c-1 1.4-1.5 2.8-1.5 4 0 1.4.5 2.8 1.5 4.2 1-1.4 1.5-2.8 1.5-4.2 0-1.2-.5-2.6-1.5-4Z"
        fill="#fff4bf"
      />
    </svg>
  );
}

function FlyingCandle({ candle }) {
  const style = {
    "--fly-from-x": `${candle.fromX}%`,
    "--fly-from-y": `${candle.fromY}%`,
    "--fly-to-x": `${candle.targetX}%`,
    "--fly-to-y": `${candle.targetY}%`,
  };

  return (
    <div className="memorial-flying-candle" style={style}>
      <CandleIcon />
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
