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

  const label =
    guide.badge || (id === 1 ? "ANH HÙNG\nLỰC LƯỢNG VŨ TRANG NHÂN DÂN" : "");

  return (
    <main className="min-h-dvh bg-[#fff7d6]">
      <div className="guide-screen mx-auto flex min-h-dvh w-full max-w-[1080px] flex-col overflow-hidden text-[#3f3028]">
        <section className="relative h-[46dvh] min-h-[350px] shrink-0 overflow-hidden px-[clamp(16px,4.3vw,48px)] pt-[clamp(58px,7.8dvh,126px)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.92),transparent_22%),radial-gradient(circle_at_74%_18%,rgba(255,255,255,0.55),transparent_18%),linear-gradient(150deg,#fff2a6_0%,#f5d27c_44%,#f2c86e_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen [background-image:radial-gradient(circle_at_22%_18%,rgba(255,255,255,.9)_0_1px,transparent_2px),radial-gradient(circle_at_72%_12%,rgba(255,255,255,.7)_0_1px,transparent_2px)] [background-size:36px_36px,54px_54px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[38%] bg-gradient-to-b from-transparent via-[#fff0a4]/70 to-[#fff7d6]" />

          <h1 className="relative z-20 text-center text-[clamp(16px,4vw,42px)] font-black tracking-[-0.03em] text-[#2e211a]">
            AudioGuide
          </h1>

          <div className="absolute inset-x-0 bottom-0 z-0 h-[82%]">
            <GuideImage
              src={guide.imageUrl}
              alt={guide.title}
              className="h-full w-full object-cover object-center opacity-80 grayscale contrast-110 mix-blend-multiply"
            />
          </div>

          <div className="relative z-20 mt-[clamp(34px,7.8dvh,118px)] max-w-[58%]">
            <h2 className="text-[clamp(23px,6.25vw,70px)] font-black leading-[1.04] tracking-[-0.05em] text-[#352720] drop-shadow-[0_1px_0_rgba(255,246,196,0.45)]">
              {guide.title}
            </h2>
            {guide.subtitle ? (
              <p className="mt-[clamp(12px,2.4dvh,34px)] text-[clamp(22px,5.8vw,64px)] font-black leading-none tracking-[-0.05em] text-[#352720]">
                {guide.subtitle}
              </p>
            ) : null}
            {label ? (
              <div className="mt-[clamp(16px,2.5dvh,34px)] inline-flex max-w-[90%] flex-col items-center justify-center bg-[#f5c62c] px-[clamp(14px,3.4vw,38px)] py-[clamp(6px,1.5vw,16px)] text-center text-[clamp(8px,2vw,20px)] font-black uppercase leading-[1.15] tracking-[-0.02em] text-[#6b4b08] shadow-[0_3px_0_rgba(160,122,14,0.5)] [clip-path:polygon(0_0,100%_0,100%_82%,95%_82%,95%_100%,5%_100%,5%_82%,0_82%)]">
                {label.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <div className="relative z-20 -mt-[clamp(18px,2.5dvh,34px)] flex min-h-0 flex-1 flex-col gap-[clamp(10px,1.5dvh,24px)] px-[clamp(16px,4.3vw,48px)] pb-[clamp(18px,3dvh,42px)]">
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

            <article className="guide-scrollbar min-h-0 flex-1 overflow-y-auto pr-1 text-[clamp(15px,3.9vw,40px)] leading-[1.42] tracking-[-0.015em] text-[#554237]">
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
