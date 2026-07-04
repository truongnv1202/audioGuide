import { notFound } from "next/navigation";

import GuideView from "@/components/GuideView";
import MemorialHome from "@/components/MemorialHome";
import { getCandleCount } from "@/lib/candleStore";
import { getGuideById, getGuides } from "@/lib/guidesStore";

export const dynamic = "force-dynamic";

function clampId(value) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const idParam = params?.id;

  if (!idParam) {
    const [guides, initialCount] = await Promise.all([getGuides(), getCandleCount()]);
    return <MemorialHome guides={guides} initialCount={initialCount} />;
  }

  const id = clampId(idParam);
  const guide = await getGuideById(id);

  if (!guide) {
    notFound();
  }

  return <GuideView guide={guide} />;
}
