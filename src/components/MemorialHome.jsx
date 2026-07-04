"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const MARQUEE_TEXT =
  "Hoà Bình không dễ có • Đời Đời nhớ ơn các anh Hùng liệt sĩ • ";

function formatCount(value) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function heroName(guide) {
  const raw = String(guide.title1 || guide.title || "").trim();
  const dashIndex = raw.indexOf(" - ");

  if (dashIndex > 0) {
    return raw.slice(0, dashIndex);
  }

  return raw;
}

function heroYears(guide) {
  const years = String(guide.title3 || guide.subtitle || guide.title2 || "").trim();
  return years.replace(/^\(|\)$/g, "");
}

function CandleIcon({ lit = false, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 48"
      className={`${className} ${lit ? "memorial-candle-lit" : "memorial-candle-dim"}`}
    >
      <ellipse cx="12" cy="42" rx="5" ry="2.2" fill="rgba(0,0,0,0.35)" />
      <rect x="8.5" y="18" width="7" height="24" rx="1.5" fill="#f3e3b8" />
      <rect x="9.2" y="18" width="1.2" height="24" rx="0.6" fill="rgba(255,255,255,0.35)" />
      <path d="M12 18c-2.2-2.8-3.4-5.2-3.4-7.4 0-2.8 1.6-4.4 3.4-5.8 1.8 1.4 3.4 3 3.4 5.8 0 2.2-1.2 3.6-3.4 7.4Z" fill="#ffb347" />
      <path d="M12 10.8c-1 1.4-1.5 2.8-1.5 4 0 1.4.5 2.8 1.5 4.2 1-1.4 1.5-2.8 1.5-4.2 0-1.2-.5-2.6-1.5-4Z" fill="#fff4bf" />
    </svg>
  );
}

function FlyingCandle({ candle, onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1800);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const style = {
    left: `${candle.startX}px`,
    top: `${candle.startY}px`,
    "--fly-x": `${candle.endX - candle.startX}px`,
    "--fly-y": `${candle.endY - candle.startY}px`,
  };

  return (
    <div className="memorial-flying-candle pointer-events-none fixed z-50" style={style}>
      <CandleIcon lit className="h-14 w-7" />
    </div>
  );
}

function CornerCandle({ side, index }) {
  const offset = 8 + index * 14;

  return (
    <div
      className={`memorial-corner-candle absolute top-2 ${side === "left" ? "left-2" : "right-2"}`}
      style={{
        transform: `translate(${side === "left" ? offset : -offset}px, ${index * 10}px)`,
      }}
    >
      <CandleIcon lit className="h-8 w-4 opacity-90" />
    </div>
  );
}

function HeroCard({ guide }) {
  const name = heroName(guide);
  const years = heroYears(guide);

  return (
    <Link
      href={`/?id=${guide.id}`}
      className="memorial-card group block overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="memorial-card-frame">
        <div className="memorial-card-photo">
          <img
            src={guide.imageUrl || "/images/guide-placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover object-top grayscale-[0.15] sepia-[0.12]"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/images/guide-placeholder.svg";
            }}
          />
        </div>
        <div className="memorial-card-caption">
          <p className="memorial-card-name">{name.toUpperCase()}</p>
          {years ? <p className="memorial-card-years">{years}</p> : null}
        </div>
      </div>
    </Link>
  );
}

export default function MemorialHome({ guides, initialCount }) {
  const [count, setCount] = useState(initialCount);
  const [lighting, setLighting] = useState(false);
  const [flyingCandles, setFlyingCandles] = useState([]);
  const [cornerCandles, setCornerCandles] = useState([]);
  const buttonRef = useRef(null);

  const removeFlyingCandle = useCallback((id) => {
    setFlyingCandles((current) => current.filter((item) => item.id !== id));
  }, []);

  async function lightCandle() {
    if (lighting || !buttonRef.current) {
      return;
    }

    setLighting(true);

    const rect = buttonRef.current.getBoundingClientRect();
    const side = Math.random() < 0.5 ? "left" : "right";
    const startX = rect.left + rect.width / 2 - 14;
    const startY = rect.top - 36;
    const endX = side === "left" ? 18 : window.innerWidth - 34;
    const endY = 18;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setFlyingCandles((current) => [
      ...current,
      { id, startX, startY, endX, endY, side },
    ]);

    try {
      const response = await fetch("/api/candles", { method: "POST" });
      const result = await response.json();

      if (response.ok) {
        setCount(result.count);
      } else {
        setCount((value) => value + 1);
      }
    } catch {
      setCount((value) => value + 1);
    }

    window.setTimeout(() => {
      setCornerCandles((current) => [...current, { id, side }].slice(-24));
      setLighting(false);
    }, 1800);
  }

  return (
    <main className="memorial-home relative min-h-dvh overflow-hidden bg-[#17120f] text-[#f6ead0]">
      <div className="memorial-wall pointer-events-none absolute inset-0" />

      <div className="memorial-marquee-wrap relative z-10 border-b border-[#4a3a28]/80 bg-[#120e0b]/95 py-2">
        <div className="memorial-marquee whitespace-nowrap text-[clamp(11px,2.8vw,16px)] font-semibold tracking-[0.08em] text-[#efe2c8]">
          <span>{MARQUEE_TEXT.repeat(3)}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-42px)] w-full max-w-[1080px] flex-col px-[clamp(8px,2vw,18px)] pb-[clamp(150px,24dvh,240px)] pt-[clamp(10px,2dvh,18px)]">
        <div className="memorial-grid grid flex-1 grid-cols-5 gap-[clamp(4px,1vw,10px)]">
          {guides.map((guide) => (
            <HeroCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>

      <div className="memorial-candle-field pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[clamp(150px,24dvh,240px)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[clamp(150px,24dvh,240px)]">
        {cornerCandles.map((candle, index) => {
          const sideIndex =
            cornerCandles.slice(0, index + 1).filter((item) => item.side === candle.side).length - 1;

          return (
            <CornerCandle key={candle.id} side={candle.side} index={sideIndex} />
          );
        })}
      </div>

      {flyingCandles.map((candle) => (
        <FlyingCandle
          key={candle.id}
          candle={candle}
          onDone={() => removeFlyingCandle(candle.id)}
        />
      ))}

      <div className="absolute inset-x-0 bottom-[clamp(18px,4dvh,34px)] z-40 flex justify-center px-4">
        <div className="inline-flex flex-col items-center">
          <button
            ref={buttonRef}
            type="button"
            disabled={lighting}
            onClick={lightCandle}
            className="memorial-light-btn rounded-md px-[clamp(18px,5vw,42px)] py-[clamp(10px,2.2dvh,16px)] text-[clamp(13px,3.2vw,22px)] font-black uppercase tracking-[0.06em] text-[#fff6df] disabled:opacity-80"
          >
            HÃY THẮP 1 NGỌN NẾN
          </button>
          <p className="memorial-candle-count mt-[5px] max-w-[82%] text-center text-[clamp(9px,1.9vw,12px)] font-medium leading-tight text-[#f0dfbf]">
            {formatCount(count)} ngọn nến đã được thắp.
          </p>
        </div>
      </div>
    </main>
  );
}
