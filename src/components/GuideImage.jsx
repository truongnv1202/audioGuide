"use client";

import { useState } from "react";

export default function GuideImage({ src, alt, className = "h-full w-full object-cover" }) {
  const [imageSrc, setImageSrc] = useState(src || "/images/guide-placeholder.svg");

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setImageSrc("/images/guide-placeholder.svg")}
    />
  );
}
