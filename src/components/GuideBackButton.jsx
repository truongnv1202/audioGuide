"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 28;

function isScrollable(element) {
  return element.scrollHeight > element.clientHeight + 4;
}

function isAtBottom(element) {
  if (!isScrollable(element)) {
    return false;
  }

  return element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_THRESHOLD;
}

function isWindowAtBottom() {
  const root = document.documentElement;

  if (root.scrollHeight <= window.innerHeight + 4) {
    return false;
  }

  return window.scrollY + window.innerHeight >= root.scrollHeight - SCROLL_THRESHOLD;
}

export default function GuideBackButton() {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const article = document.querySelector(".guide-scrollbar");

    function updatePosition() {
      if (article && isScrollable(article)) {
        setAtBottom(isAtBottom(article));
        return;
      }

      setAtBottom(isWindowAtBottom());
    }

    function onArticleScroll() {
      if (!article) {
        return;
      }

      setAtBottom(isAtBottom(article));
    }

    updatePosition();
    article?.addEventListener("scroll", onArticleScroll, { passive: true });
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      article?.removeEventListener("scroll", onArticleScroll);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return (
    <Link
      href="/"
      className={`guide-back-btn ${atBottom ? "guide-back-btn-top" : "guide-back-btn-bottom"}`}
      aria-label="Về trang chủ"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="guide-back-btn-icon">
        <path d="M14.5 5.5 8 12l6.5 6.5" />
      </svg>
    </Link>
  );
}
