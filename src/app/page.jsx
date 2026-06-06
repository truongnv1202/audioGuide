import { notFound } from "next/navigation";

import AudioGuidePlayer from "@/components/AudioGuidePlayer";
import GuideImage from "@/components/GuideImage";
import { getGuideById } from "@/lib/guidesStore";

export const dynamic = "force-dynamic";

function clampId(value) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const id = clampId(params?.id);
  const guide = await getGuideById(id);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-[#fff7d6]">
      <div className="guide-screen mx-auto flex min-h-dvh w-full max-w-[1080px] flex-col overflow-hidden text-[#3f3028]">
        <section className="relative h-[clamp(288px,38dvh,730px)] shrink-0 overflow-hidden px-[clamp(16px,4.3vw,48px)] pt-[clamp(34px,5dvh,92px)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_9%,rgba(255,255,255,0.92),transparent_25%),radial-gradient(circle_at_76%_13%,rgba(255,255,255,0.62),transparent_18%),linear-gradient(150deg,#fff3ad_0%,#f3ce77_52%,#fff4bb_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-45 mix-blend-screen [background-image:radial-gradient(circle_at_22%_18%,rgba(255,255,255,.9)_0_1px,transparent_2px),radial-gradient(circle_at_72%_12%,rgba(255,255,255,.7)_0_1px,transparent_2px)] [background-size:36px_36px,54px_54px]" />

          <div className="absolute inset-x-0 bottom-0 z-0 h-[70%]">
            <GuideImage
              src={guide.imageUrl}
              alt={guide.title}
              className="hero-photo h-full w-full object-cover object-center opacity-85 grayscale contrast-110 mix-blend-multiply"
            />
          </div>
          <div className="hero-vignette pointer-events-none absolute inset-0 z-10" />

          <div className="relative z-20 max-w-[56%]">
            <h2 className="text-[clamp(22px,5.85vw,68px)] font-black leading-[1.05] tracking-[-0.045em] text-[#352720] drop-shadow-[0_1px_0_rgba(255,246,196,0.45)]">
              {guide.title}
            </h2>
            {guide.subtitle ? (
              <p className="mt-[clamp(6px,1.2dvh,18px)] text-[clamp(16px,4.5vw,52px)] font-black leading-none tracking-[-0.045em] text-[#352720]">
                {guide.subtitle}
              </p>
            ) : null}
          </div>
        </section>

        <div className="relative z-20 flex min-h-0 flex-1 flex-col gap-[clamp(8px,1.2dvh,20px)] px-[clamp(16px,4.3vw,48px)] pb-[clamp(18px,3dvh,42px)] pt-[clamp(8px,1.2dvh,20px)]">
          <AudioGuidePlayer guide={guide} />

          <section className="content-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-[clamp(10px,3vw,30px)] border border-[#e5c565] bg-[#fffdf3]/95 px-[clamp(16px,4.2vw,48px)] pb-[clamp(14px,2.2dvh,32px)] pt-[clamp(18px,2.8dvh,36px)] shadow-[0_3px_10px_rgba(151,110,25,0.24)]">
            <div className="mb-[clamp(14px,2dvh,28px)] flex shrink-0 items-center gap-[clamp(10px,2.8vw,28px)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 28 22"
                className="size-[clamp(24px,6.4vw,58px)] shrink-0 fill-[#e2b626]"
              >
                <path d="M3 2.1C6.2 2.1 9.3 3 12 4.6v15.3C9.2 18.4 6.1 17.6 3 17.6c-1 0-1.9.1-2.8.3V3.1C1.1 2.5 2 2.1 3 2.1Zm22 0c1 0 1.9.4 2.8 1v14.8c-.9-.2-1.8-.3-2.8-.3-3.1 0-6.2.8-9 2.3V4.6C18.7 3 21.8 2.1 25 2.1ZM13 3.7h2v17.1h-2V3.7Z" />
              </svg>
              <div>
                <h3 className="text-[clamp(20px,4.8vw,48px)] font-black leading-none tracking-[-0.04em] text-[#594234]">
                  Nội dung thuyết minh
                </h3>
                <div className="mt-[clamp(7px,1.4vw,14px)] h-px w-[clamp(128px,34vw,340px)] bg-[#d7a73a]" />
              </div>
            </div>

            <article className="guide-scrollbar min-h-0 flex-1 overflow-y-auto pr-1 text-justify text-[clamp(15px,3.9vw,40px)] leading-[1.42] tracking-[-0.015em] text-[#554237]">
              {guide.description.split("\n").map((paragraph) => (
                <p key={paragraph} className="mb-[clamp(10px,1.7dvh,22px)]">
                  {paragraph}
                </p>
              ))}
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
