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
  const isUser = candle.kind === "user";
  let posX = candle.x;
  let posY = candle.y;

  if (isUser) {
    if (candle.isFlying) {
      posX = candle.fromX;
      posY = candle.fromY;
    } else {
      posX = candle.targetX;
      posY = candle.targetY;
    }
  }

  const style = {
    left: `${posX}%`,
    top: `${posY}%`,
    "--c-scale": candle.scale,
    "--c-opacity": candle.opacity,
    "--c-blur": `${candle.blur}px`,
    "--c-z": `${candle.z}px`,
    "--c-tilt-x": `${candle.tiltX ?? 0}deg`,
    "--sway-delay": `${candle.swayDelay}s`,
    "--sway-duration": `${candle.swayDuration || 3}s`,
    ...(isUser && candle.isFlying
      ? {
          "--fly-from-x": `${candle.fromX}%`,
          "--fly-from-y": `${candle.fromY}%`,
          "--fly-to-x": `${candle.targetX}%`,
          "--fly-to-y": `${candle.targetY}%`,
        }
      : {}),
  };

  const motionClass = candle.isFlying
    ? "memorial-scene-candle-motion-flying"
    : candle.isNew
      ? "memorial-scene-candle-motion-new"
      : "";

  return (
    <div
      className={[
        "memorial-scene-candle",
        isUser ? "memorial-scene-candle-user" : "",
        candle.isFlying ? "memorial-scene-candle-flying" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <div className={`memorial-scene-candle-motion ${motionClass}`}>
        <CandleIcon
          className="memorial-scene-candle-icon"
          flickerDelay={candle.flickerDelay}
        />
      </div>
    </div>
  );
}

function SceneEmber({ ember }) {
  const style = {
    left: `${ember.x}%`,
    top: `${ember.y}%`,
    "--ember-size": `${ember.size}px`,
    "--ember-opacity": ember.opacity,
    "--ember-blur": `${ember.blur}px`,
    "--flicker-delay": `${ember.flickerDelay}s`,
    "--flicker-duration": `${ember.flickerDuration || 2}s`,
  };

  return <div className="memorial-scene-ember" style={style} />;
}

function SceneGlow({ glow }) {
  const style = {
    left: `${glow.x}%`,
    top: `${glow.y}%`,
    "--glow-size": `${glow.size}px`,
    "--glow-opacity": glow.opacity,
    "--flicker-delay": `${glow.flickerDelay}s`,
    "--flicker-duration": `${glow.flickerDuration || 2.5}s`,
  };

  return <div className="memorial-scene-glow" style={style} />;
}

export default function MemorialCandleRoom({ userCandles }) {
  const ambientItems = useMemo(() => createAmbientCandles(), []);
  const ambientCandles = ambientItems.filter((item) => item.kind === "candle");
  const ambientEmbers = ambientItems.filter((item) => item.kind === "ember");
  const ambientGlows = ambientItems.filter((item) => item.kind === "glow");
  const userSceneCandles = userCandles.filter((item) => item.kind !== "ember");

  return (
    <div className="memorial-candle-room pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <div className="memorial-room-corridor">
        <div className="memorial-room-corridor-floor" />
        <div className="memorial-room-corridor-haze" />
      </div>

      <div className="memorial-room-floor" />
      <div className="memorial-room-walls" />
      <div className="memorial-room-vignette absolute inset-0" />
      <div className="memorial-room-ceiling-glow absolute inset-0" />
      <div className="memorial-room-ambient-pulse absolute inset-0" />
      <div className="memorial-room-sparkle-shimmer absolute inset-0" />
      <div className="memorial-room-sparkle-shimmer memorial-room-sparkle-shimmer-alt absolute inset-0" />
      <div className="memorial-room-bokeh absolute inset-0" />

      <div className="memorial-candle-stage absolute inset-0">
        {ambientGlows.map((glow) => (
          <SceneGlow key={glow.id} glow={glow} />
        ))}
        {ambientEmbers.map((ember) => (
          <SceneEmber key={ember.id} ember={ember} />
        ))}
        {ambientCandles.map((candle) => (
          <SceneCandle key={candle.id} candle={candle} />
        ))}
        {userSceneCandles.map((candle) => (
          <SceneCandle key={candle.id} candle={candle} />
        ))}
      </div>
    </div>
  );
}
