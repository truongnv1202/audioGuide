const DEFAULT_MODEL = "fal-ai/minimax/speech-2.8-hd";
const DEFAULT_VOICE_ID = "audiobook_male_1";

function numericEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function normalizeDescription(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, " <#0.65#> ")
    .replace(/\n+/g, " ")
    .trim();
}

export async function generateFalAudioFromDescription(description) {
  const apiKey = process.env.FAL_KEY;

  if (!apiKey) {
    throw new Error("Server is missing FAL_KEY");
  }

  const prompt = normalizeDescription(description);

  if (!prompt) {
    throw new Error("Description is empty");
  }

  if (prompt.length > 5000) {
    throw new Error("Nội dung quá dài để sinh một file MP3.");
  }

  const model = process.env.FAL_TTS_MODEL || DEFAULT_MODEL;
  const response = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      voice_setting: {
        voice_id: process.env.FAL_VOICE_ID || DEFAULT_VOICE_ID,
        speed: numericEnv("FAL_TTS_SPEED", 0.92),
        vol: numericEnv("FAL_TTS_VOLUME", 1),
        pitch: numericEnv("FAL_TTS_PITCH", -2),
        emotion: process.env.FAL_TTS_EMOTION || "neutral",
      },
      audio_setting: {
        sample_rate: numericEnv("FAL_TTS_SAMPLE_RATE", 44100),
        bitrate: numericEnv("FAL_TTS_BITRATE", 256000),
        format: "mp3",
        channel: 1,
      },
      language_boost: "Vietnamese",
      output_format: "url",
      normalization_setting: {
        enabled: true,
        target_loudness: -18,
        target_range: 8,
        target_peak: -0.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Không sinh được MP3. Mã lỗi: ${response.status}`);
  }

  const result = await response.json();
  const audioUrl = result?.audio?.url || result?.data?.audio?.url;

  if (!audioUrl) {
    throw new Error("Không nhận được file MP3 từ dịch vụ sinh giọng đọc.");
  }

  const audioResponse = await fetch(audioUrl);

  if (!audioResponse.ok) {
    throw new Error(`Audio download error ${audioResponse.status}`);
  }

  return Buffer.from(await audioResponse.arrayBuffer());
}
