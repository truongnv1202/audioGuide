"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import MemorialCandleRoom from "@/components/MemorialCandleRoom";
import { useMemorialOrientation } from "@/hooks/useMemorialLayout";
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
  const landscape = useMemorialOrientation();

  const removeUserCandle = useCallback((id) => {
    setUserCandles((current) => current.filter((candle) => candle.id !== id));
    setLighting(false);
  }, []);

  async function lightCandle() {
    if (lighting) {
      return;
    }

    setLighting(true);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newCandle = createUserCandle(id);

    setUserCandles((current) => [...current, newCandle]);

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
      removeUserCandle(id);
    }, 1900);
  }

  const marqueeContent = String(marqueeText || "").trim() || "Hoà Bình không dễ có • ";
  const marqueeRepeat = landscape ? 2 : 3;

  return (
    <main
      className={[
        "memorial-home relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-transparent text-[#f6ead0]",
        landscape ? "memorial-home-landscape" : "memorial-home-portrait",
      ].join(" ")}
    >
      <MemorialCandleRoom userCandles={userCandles} />

      <header className="memorial-marquee-wrap relative z-20 shrink-0 border-b border-[#4a3a28]/80 py-2">
        <div className="memorial-marquee whitespace-nowrap text-[clamp(11px,2.8vw,16px)] font-semibold uppercase tracking-[0.08em] text-[#efe2c8]">
          <span>{marqueeContent.repeat(marqueeRepeat)}</span>
        </div>
      </header>

      <div className="memorial-scroll memorial-scroll-fill relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div className="memorial-scroll-inner mx-auto flex w-full max-w-[1080px] flex-col px-[clamp(6px,1.8vw,14px)] pb-[clamp(4px,0.8dvh,8px)] pt-[clamp(6px,1.2dvh,10px)]">
          <div className="memorial-grid-stage">
            <div className="memorial-grid">
              {guides.map((guide) => (
                <HeroCard key={guide.id} guide={guide} />
              ))}
            </div>
          </div>

          <div className="memorial-candle-gap" aria-hidden="true" />

          <section className="memorial-actions relative z-20 shrink-0">
            <div className="inline-flex w-full flex-col items-center">
              <button
                type="button"
                disabled={lighting}
                onClick={lightCandle}
                className="memorial-light-btn rounded-md px-[clamp(16px,4.5vw,36px)] py-[clamp(8px,1.6dvh,12px)] text-[clamp(12px,2.8vw,20px)] font-black uppercase tracking-[0.06em] text-[#fff6df] disabled:opacity-80"
              >
                HÃY THẮP 1 NGỌN NẾN
              </button>
              <p className="memorial-candle-count mt-[5px] max-w-[82%] text-center text-[clamp(9px,1.7vw,11px)] font-medium leading-tight text-[#f0dfbf]">
                {formatCount(count)} ngọn nến đã được thắp.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
