"use client";

import { useState } from "react";

const FALLBACK_IMAGE = "/images/guide-placeholder.svg";

function clampOpacity(value, fallback = 0.8) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(Math.max(numeric, 0), 1);
}

export default function HeroGuideImage({ src, alt, imageLayout }) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGE);
  const overlayOpacity = clampOpacity(imageLayout?.overlayOpacity);
  const backgroundOpacity = clampOpacity(imageLayout?.backgroundOpacity, 1);

  return (
    <div className="hero-image-frame h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url("${imageSrc}")`,
          backgroundPosition: imageLayout?.backgroundPosition || "center",
          opacity: backgroundOpacity,
        }}
      />
      <div
        className="absolute inset-0 bg-[#fff3ad]"
        style={{ opacity: overlayOpacity }}
      />
      <img
        src={imageSrc}
        alt={alt}
        className="hero-photo relative z-10 h-full w-full object-contain opacity-95 grayscale contrast-110 mix-blend-multiply"
        style={{ objectPosition: imageLayout?.foregroundPosition || "85% center" }}
        onError={() => setImageSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}
