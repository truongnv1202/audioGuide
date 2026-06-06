import Link from "next/link";
import { notFound } from "next/navigation";

import AudioGuidePlayer from "@/components/AudioGuidePlayer";
import GuideImage from "@/components/GuideImage";
import { getGuideById, guides } from "@/data/seed";

function clampId(value) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const id = clampId(params?.id);
  const guide = getGuideById(id);

  if (!guide) {
    notFound();
  }

  const previousId = id > 1 ? id - 1 : guides.length;
  const nextId = id < guides.length ? id + 1 : 1;

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f7f4ea_0%,#fff8e8_9%,#ffd873_62%,#fff2c6_100%)]">
      <div className="mx-auto min-h-dvh max-w-[500px] overflow-hidden bg-[#fff8e8]/55 shadow-2xl shadow-stone-400/40">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-black/5 bg-[#f8f8f8]/95 px-7 backdrop-blur">
          <Link
            href={`/?id=${previousId}`}
            aria-label="Audio guide trước"
            className="relative size-9 rounded-full transition active:scale-95"
          >
            <span className="absolute left-3 top-2 h-5 w-5 rotate-45 border-b-2 border-l-2 border-black" />
          </Link>

          <h1 className="text-[25px] font-bold tracking-[-0.04em] text-black">
            AudioGuide
          </h1>

          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center gap-1 rounded-full"
          >
            <span className="size-1.5 rounded-full bg-black" />
            <span className="size-1.5 rounded-full bg-black" />
            <span className="size-1.5 rounded-full bg-black" />
          </span>
        </header>

        <section className="relative">
          <Link
            href={`/?id=${previousId}`}
            aria-label="Quay lại audio guide trước"
            className="absolute left-7 top-20 z-10 text-4xl font-light text-[#f1b65a] drop-shadow-sm"
          >
            ←
          </Link>

          <div className="relative mx-auto aspect-[0.74] w-[74%] max-w-[368px] overflow-hidden bg-stone-200 shadow-[0_20px_60px_rgba(103,66,25,0.2)]">
            <GuideImage src={guide.imageUrl} alt={guide.title} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#b8742d]/75 via-[#d49b42]/30 to-transparent px-0 pb-5 pt-28">
              <h2 className="px-0 text-[27px] font-black leading-[1.02] tracking-[-0.05em] text-[#2e2d2c] drop-shadow-sm">
                {guide.title}
              </h2>
              {guide.subtitle ? (
                <p className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em] text-[#2e2d2c] drop-shadow-sm">
                  {guide.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="relative -mt-1 space-y-7 px-7 pb-10 pt-5">
          <AudioGuidePlayer guide={guide} />

          <article className="guide-scrollbar max-h-[calc(100dvh-610px)] min-h-[260px] overflow-y-auto pr-1 text-[21px] leading-[1.36] tracking-[-0.02em] text-[#51423c]">
            {guide.description.split("\n").map((paragraph) => (
              <p key={paragraph} className="mb-4">
                {paragraph}
              </p>
            ))}
          </article>

          <nav className="grid grid-cols-2 gap-3 pb-2 text-sm font-semibold text-[#6a443b]">
            <Link
              href={`/?id=${previousId}`}
              className="rounded-2xl bg-white/45 px-4 py-3 text-center shadow-sm"
            >
              Bài trước
            </Link>
            <Link
              href={`/?id=${nextId}`}
              className="rounded-2xl bg-white/45 px-4 py-3 text-center shadow-sm"
            >
              Bài tiếp theo
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
