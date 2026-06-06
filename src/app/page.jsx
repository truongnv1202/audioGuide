import Link from "next/link";
import { notFound } from "next/navigation";

import AudioGuidePlayer from "@/components/AudioGuidePlayer";
import GuideImage from "@/components/GuideImage";
import { getGuideById, getGuides } from "@/lib/guidesStore";

export const dynamic = "force-dynamic";

function clampId(value) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const id = clampId(params?.id);
  const [guides, guide] = await Promise.all([
    getGuides(),
    getGuideById(id),
  ]);

  if (!guide) {
    notFound();
  }

  const previousId = id > 1 ? id - 1 : guides.length;
  const nextId = id < guides.length ? id + 1 : 1;

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f7f4ea_0%,#fff8e8_9%,#ffd873_62%,#fff2c6_100%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1080px] flex-col overflow-hidden bg-[#fff8e8]/55 shadow-2xl shadow-stone-400/40">
        <header className="z-20 flex h-[clamp(76px,7.5dvh,144px)] shrink-0 items-center justify-between border-b border-black/5 bg-[#f8f8f8]/95 px-[clamp(28px,6vw,76px)] backdrop-blur">
          <Link
            href={`/?id=${previousId}`}
            aria-label="Audio guide trước"
            className="relative size-[clamp(36px,5.2vw,72px)] rounded-full transition active:scale-95"
          >
            <span className="absolute left-[32%] top-[24%] size-[52%] rotate-45 border-b-[clamp(2px,0.35vw,5px)] border-l-[clamp(2px,0.35vw,5px)] border-black" />
          </Link>

          <h1 className="text-[clamp(25px,4.8vw,58px)] font-bold tracking-[-0.04em] text-black">
            AudioGuide
          </h1>

          <span
            aria-hidden="true"
            className="flex size-[clamp(36px,5.2vw,72px)] items-center justify-center gap-[clamp(4px,0.8vw,8px)] rounded-full"
          >
            <span className="size-[clamp(6px,1vw,12px)] rounded-full bg-black" />
            <span className="size-[clamp(6px,1vw,12px)] rounded-full bg-black" />
            <span className="size-[clamp(6px,1vw,12px)] rounded-full bg-black" />
          </span>
        </header>

        <section className="relative shrink-0">
          <Link
            href={`/?id=${previousId}`}
            aria-label="Quay lại audio guide trước"
            className="absolute left-[clamp(28px,6vw,72px)] top-[clamp(70px,9dvh,150px)] z-10 text-[clamp(36px,7vw,86px)] font-light text-[#f1b65a] drop-shadow-sm"
          >
            ←
          </Link>

          <div className="relative mx-auto h-[min(58dvh,1180px)] w-[74%] max-w-[800px] overflow-hidden bg-stone-200 shadow-[0_20px_60px_rgba(103,66,25,0.2)]">
            <GuideImage src={guide.imageUrl} alt={guide.title} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#b8742d]/75 via-[#d49b42]/30 to-transparent px-0 pb-[clamp(20px,3.5vw,46px)] pt-[clamp(112px,18dvh,320px)]">
              <h2 className="px-0 text-[clamp(27px,6vw,70px)] font-black leading-[1.02] tracking-[-0.05em] text-[#2e2d2c] drop-shadow-sm">
                {guide.title}
              </h2>
              {guide.subtitle ? (
                <p className="mt-1 text-[clamp(28px,6vw,72px)] font-black leading-none tracking-[-0.05em] text-[#2e2d2c] drop-shadow-sm">
                  {guide.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="relative flex min-h-0 flex-1 flex-col gap-[clamp(20px,3dvh,48px)] px-[clamp(28px,6vw,76px)] pb-[clamp(28px,5dvh,72px)] pt-[clamp(20px,2.6dvh,44px)]">
          <AudioGuidePlayer guide={guide} />

          <article className="guide-scrollbar min-h-0 flex-1 overflow-y-auto pr-2 text-[clamp(21px,4.15vw,48px)] leading-[1.38] tracking-[-0.02em] text-[#51423c]">
            {guide.description.split("\n").map((paragraph) => (
              <p key={paragraph} className="mb-[clamp(16px,2.6dvh,34px)]">
                {paragraph}
              </p>
            ))}
          </article>

          <nav className="grid shrink-0 grid-cols-2 gap-3 pb-2 text-[clamp(14px,2.6vw,28px)] font-semibold text-[#6a443b]">
            <Link
              href={`/?id=${previousId}`}
              className="rounded-[clamp(16px,3vw,32px)] bg-white/45 px-4 py-[clamp(12px,1.8dvh,24px)] text-center shadow-sm"
            >
              Bài trước
            </Link>
            <Link
              href={`/?id=${nextId}`}
              className="rounded-[clamp(16px,3vw,32px)] bg-white/45 px-4 py-[clamp(12px,1.8dvh,24px)] text-center shadow-sm"
            >
              Bài tiếp theo
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
