import { NextResponse } from "next/server";

import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";
import { generateFalAudioFromDescription } from "@/lib/falAudio";
import { getGuideById, updateGuideById } from "@/lib/guidesStore";
import { saveGeneratedGuideAudio } from "@/lib/mediaStore";

const MAX_AUDIO_GENERATIONS = 10;

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  const { secret, id } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const guide = await getGuideById(id);

  if (!guide) {
    return backendNotFound();
  }

  const currentCount = Number(guide.audioGenerationCount || 0);

  if (currentCount >= MAX_AUDIO_GENERATIONS) {
    return NextResponse.json(
      { error: `Đã sinh MP3 đủ ${MAX_AUDIO_GENERATIONS} lần cho bài này.` },
      { status: 429 },
    );
  }

  try {
    const nextCount = currentCount + 1;
    const audioBuffer = await generateFalAudioFromDescription(guide.description);
    const savedAudio = await saveGeneratedGuideAudio(id, audioBuffer, nextCount);

    if (!savedAudio) {
      return NextResponse.json({ error: "Không lưu được file MP3" }, { status: 500 });
    }

    const updatedGuide = await updateGuideById(id, {
      audioUrl: savedAudio.url,
      audioGenerationCount: nextCount,
      audioGeneratedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      data: updatedGuide,
      generated: {
        audioUrl: savedAudio.url,
        count: nextCount,
        remaining: MAX_AUDIO_GENERATIONS - nextCount,
        max: MAX_AUDIO_GENERATIONS,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
