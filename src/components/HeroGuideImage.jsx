"use client";

import { useState } from "react";

const FALLBACK_IMAGE = "/images/guide-placeholder.svg";

export default function HeroGuideImage({ src, alt }) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGE);

  return (
    <div
      className="hero-image-frame h-full w-full overflow-hidden"
      style={{ backgroundImage: `url("${imageSrc}")` }}
    >
      <div className="absolute inset-0 bg-[#fff3ad]/80" />
      <img
        src={imageSrc}
        alt={alt}
        className="hero-photo relative z-10 h-full w-full object-contain object-[85%_center] opacity-95 grayscale contrast-110 mix-blend-multiply"
        onError={() => setImageSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}
