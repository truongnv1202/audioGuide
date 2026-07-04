"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import MemorialCandleRoom from "@/components/MemorialCandleRoom";
import { createUserCandle } from "@/lib/memorialCandles";

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

function HeroCard({ guide }) {
  const name = heroName(guide);

  return (
    <Link href={`/?id=${guide.id}`} className="memorial-card group">
      <div className="memorial-card-frame">
        <div className="memorial-card-photo">
          <img
            src={guide.imageUrl || "/images/guide-placeholder.svg"}
            alt={name}
            className="memorial-card-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/images/guide-placeholder.svg";
            }}
          />
        </div>
        <div className="memorial-card-caption">
          <p className="memorial-card-name">{name.toUpperCase()}</p>
        </div>
      </div>
    </Link>
  );
}

export default function MemorialHome({ guides, initialCount, marqueeText }) {
  const [count, setCount] = useState(initialCount);
  const [lighting, setLighting] = useState(false);
  const [userCandles, setUserCandles] = useState([]);

  const trimUserCandles = useCallback((list) => list.slice(-40), []);

  async function lightCandle() {
    if (lighting) {
      return;
    }

    setLighting(true);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newCandle = createUserCandle(id);

    setUserCandles((current) => trimUserCandles([...current, newCandle]));

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
      setUserCandles((current) =>
        current.map((candle) => (candle.id === id ? { ...candle, isNew: false } : candle)),
      );
      setLighting(false);
    }, 900);
  }

  const marqueeContent = String(marqueeText || "").trim() || "Hoà Bình không dễ có • ";

  return (
    <main className="memorial-home relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-transparent text-[#f6ead0]">
      <div className="memorial-wall pointer-events-none absolute inset-0 z-0" />
      <MemorialCandleRoom userCandles={userCandles} />

      <header className="memorial-marquee-wrap relative z-20 shrink-0 border-b border-[#4a3a28]/80 py-2">
        <div className="memorial-marquee whitespace-nowrap text-[clamp(11px,2.8vw,16px)] font-semibold tracking-[0.08em] text-[#efe2c8]">
          <span>{marqueeContent.repeat(3)}</span>
        </div>
      </header>

      <div className="memorial-scroll relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div className="memorial-scroll-inner mx-auto w-full max-w-[1080px] px-[clamp(6px,1.8vw,14px)] pb-[clamp(12px,2dvh,18px)] pt-[clamp(8px,1.6dvh,14px)]">
          <div className="memorial-grid-stage">
            <div className="memorial-grid">
              {guides.map((guide) => (
                <HeroCard key={guide.id} guide={guide} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="memorial-footer relative z-30 shrink-0">
        <div className="relative flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-[clamp(14px,3dvh,22px)]">
          <div className="inline-flex flex-col items-center">
            <button
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
      </footer>
    </main>
  );
}
