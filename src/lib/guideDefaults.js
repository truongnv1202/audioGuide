export const DEFAULT_TITLE_LAYOUT = {
  left: "clamp(16px, 4.3vw, 48px)",
  top: "clamp(34px, 5dvh, 92px)",
  width: "56%",
  align: "left",
  gap: "6px",
  title1Size: "clamp(22px, 5.85vw, 68px)",
  title2Size: "clamp(16px, 4.5vw, 52px)",
  title3Size: "clamp(16px, 4.5vw, 52px)",
  lineHeight: "1.05",
};

export const DEFAULT_IMAGE_LAYOUT = {
  foregroundPosition: "85% center",
  backgroundPosition: "center",
  backgroundOpacity: 1,
  overlayOpacity: 0.8,
};

export function normalizeGuideDisplay(guide) {
  const title = String(guide.title ?? "");
  const subtitle = String(guide.subtitle ?? "");

  return {
    ...guide,
    title,
    subtitle,
    title1: String(guide.title1 ?? title),
    title2: String(guide.title2 ?? subtitle),
    title3: String(guide.title3 ?? ""),
    titleLayout: {
      ...DEFAULT_TITLE_LAYOUT,
      ...(guide.titleLayout && typeof guide.titleLayout === "object" ? guide.titleLayout : {}),
    },
    imageLayout: {
      ...DEFAULT_IMAGE_LAYOUT,
      ...(guide.imageLayout && typeof guide.imageLayout === "object" ? guide.imageLayout : {}),
    },
  };
}
