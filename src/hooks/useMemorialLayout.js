"use client";

import { useEffect, useState } from "react";

import { resolveCandleTier } from "@/lib/memorialCandleTier";

export function useMemorialPerfTier() {
  const [tier, setTier] = useState("low");

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateTier() {
      setTier(resolveCandleTier());
    }

    updateTier();
    window.addEventListener("resize", updateTier, { passive: true });
    window.addEventListener("orientationchange", updateTier, { passive: true });
    mobileQuery.addEventListener("change", updateTier);
    motionQuery.addEventListener("change", updateTier);

    return () => {
      window.removeEventListener("resize", updateTier);
      window.removeEventListener("orientationchange", updateTier);
      mobileQuery.removeEventListener("change", updateTier);
      motionQuery.removeEventListener("change", updateTier);
    };
  }, []);

  return tier;
}

export function useMemorialOrientation() {
  const [landscape, setLandscape] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(orientation: landscape)");

    function updateOrientation() {
      setLandscape(query.matches);
    }

    updateOrientation();
    query.addEventListener("change", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation, { passive: true });

    return () => {
      query.removeEventListener("change", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  return landscape;
}
