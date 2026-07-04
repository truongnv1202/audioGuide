"use client";

import { useMemo } from "react";

import { createAmbientCandles } from "@/lib/memorialCandles";

function CandleIcon({ className = "", flickerDelay = 0 }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 48" className={className}>
      <ellipse cx="12" cy="42" rx="5" ry="2.2" fill="rgba(0,0,0,0.38)" />
      <rect x="8.5" y="18" width="7" height="24" rx="1.5" fill="#f3e3b8" />
      <rect x="9.2" y="18" width="1.2" height="24" rx="0.6" fill="rgba(255,255,255,0.32)" />
      <g
        className="memorial-flame"
        style={{ "--flicker-delay": `${flickerDelay}s` }}
      >
        <path d="M12 18c-2.2-2.8-3.4-5.2-3.4-7.4 0-2.8 1.6-4.4 3.4-5.8 1.8 1.4 3.4 3 3.4 5.8 0 2.2-1.2 3.6-3.4 7.4Z" fill="#ffb347" />
        <path d="M12 10.8c-1 1.4-1.5 2.8-1.5 4 0 1.4.5 2.8 1.5 4.2 1-1.4 1.5-2.8 1.5-4.2 0-1.2-.5-2.6-1.5-4Z" fill="#fff4bf" />
      </g>
    </svg>
  );
}

function SceneCandle({ candle }) {
  const style = {
    left: `${candle.x}%`,
    top: `${candle.y}%`,
    "--c-scale": candle.scale,
    "--c-opacity": candle.opacity,
    "--c-blur": `${candle.blur}px`,
    "--c-z": `${candle.z}px`,
    "--c-tilt-x": `${candle.tiltX ?? 0}deg`,
    "--sway-delay": `${candle.swayDelay}s`,
    "--sway-duration": `${candle.swayDuration || 3}s`,
  };

  return (
    <div className="memorial-scene-candle" style={style}>
      <div
        className={`memorial-scene-candle-motion ${candle.isNew ? "memorial-scene-candle-motion-new" : ""}`}
      >
        <CandleIcon
          className="memorial-scene-candle-icon"
          flickerDelay={candle.flickerDelay}
        />
      </div>
    </div>
  );
}

export default function MemorialCandleRoom({ userCandles }) {
  const ambientCandles = useMemo(() => createAmbientCandles(), []);

  return (
    <div className="memorial-candle-room pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <div className="memorial-room-floor" />
      <div className="memorial-room-walls" />
      <div className="memorial-room-vignette absolute inset-0" />
      <div className="memorial-room-ceiling-glow absolute inset-0" />
      <div className="memorial-room-ambient-pulse absolute inset-0" />

      <div className="memorial-candle-stage absolute inset-0">
        {ambientCandles.map((candle) => (
          <SceneCandle key={candle.id} candle={candle} />
        ))}
        {userCandles.map((candle) => (
          <SceneCandle key={candle.id} candle={candle} />
        ))}
      </div>
    </div>
  );
}
