"use client";

import { useEffect } from "react";

function tryEnterFullscreen() {
  const root = document.documentElement;

  if (document.fullscreenElement) {
    return;
  }

  if (root.requestFullscreen) {
    root.requestFullscreen().catch(() => {});
  } else if (root.webkitRequestFullscreen) {
    root.webkitRequestFullscreen();
  }
}

export default function MemorialFullscreen() {
  useEffect(() => {
    tryEnterFullscreen();

    function onFirstTouch() {
      tryEnterFullscreen();
    }

    function onOrientationChange() {
      window.setTimeout(tryEnterFullscreen, 250);
    }

    window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    window.addEventListener("orientationchange", onOrientationChange, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onFirstTouch);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  return null;
}
