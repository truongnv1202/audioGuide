import argparse
import json
import os
import re
import time
from pathlib import Path

import requests


DEFAULT_MODEL = "fal-ai/minimax/speech-2.8-hd"
DEFAULT_VOICE_ID = "audiobook_male_1"
TOTAL_GUIDES = 24


def clamp(value, minimum, maximum):
    return min(max(value, minimum), maximum)


def load_guides(guides_dir, guides_json):
    if guides_dir.exists():
        guide_files = sorted(guides_dir.glob("*.json"))
        if guide_files:
            return [json.loads(path.read_text(encoding="utf-8")) for path in guide_files]

    guides = json.loads(guides_json.read_text(encoding="utf-8"))
    if not isinstance(guides, list):
        raise ValueError(f"{guides_json} must contain a JSON array")
    return guides


def normalize_description(value, pause_seconds):
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", f" <#{pause_seconds:g}#> ", text)
    text = re.sub(r"\n+", " ", text)
    return text.strip()


def split_prompt(prompt, max_chars):
    if len(prompt) <= max_chars:
        return [prompt]

    sentences = re.split(r"(?<=[.!?…。])\s+", prompt)
    chunks = []
    current = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        if len(sentence) > max_chars:
            raise ValueError(
                "A single sentence is longer than max chars; increase --max-chars "
                "or edit the source text."
            )

        candidate = f"{current} {sentence}".strip()
        if len(candidate) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current = candidate

    if current:
        chunks.append(current)

    return chunks


def fal_generate_audio_url(prompt, args):
    api_key = os.environ.get("FAL_KEY")
    if not api_key:
        raise RuntimeError("Missing FAL_KEY. Set it before running this script.")

    endpoint = f"https://fal.run/{args.model}"
    payload = {
        "prompt": prompt,
        "voice_setting": {
            "voice_id": args.voice_id,
            "speed": args.speed,
            "vol": args.volume,
            "pitch": args.pitch,
            "emotion": args.emotion,
        },
        "audio_setting": {
            "sample_rate": args.sample_rate,
            "bitrate": args.bitrate,
            "format": "mp3",
            "channel": 1,
        },
        "language_boost": "Vietnamese",
        "output_format": "url",
        "normalization_setting": {
            "enabled": True,
            "target_loudness": -18,
            "target_range": 8,
            "target_peak": -0.5,
        },
    }

    response = requests.post(
        endpoint,
        headers={
            "Authorization": f"Key {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=args.timeout,
    )

    if not response.ok:
        raise RuntimeError(f"fal.ai error {response.status_code}: {response.text}")

    result = response.json()
    audio_url = result.get("audio", {}).get("url") or result.get("data", {}).get("audio", {}).get("url")
    if not audio_url:
        raise RuntimeError(f"fal.ai response missing audio.url: {json.dumps(result, ensure_ascii=False)[:1000]}")

    return audio_url


def download_file(url, output_path, timeout):
    response = requests.get(url, timeout=timeout)
    if not response.ok:
        raise RuntimeError(f"download error {response.status_code}: {response.text[:500]}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(response.content)


def output_name_for_guide(guide):
    return f"{int(guide['id']):02d}.mp3"


def parse_only(value):
    if not value:
        return None
    return {int(item.strip()) for item in value.split(",") if item.strip()}


def build_arg_parser():
    parser = argparse.ArgumentParser(
        description="Generate 24 Vietnamese audio guide MP3 files from guide description fields using fal.ai.",
    )
    parser.add_argument("--guides-dir", type=Path, default=Path("data/guides"))
    parser.add_argument("--guides-json", type=Path, default=Path("data/guides.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("public/audio"))
    parser.add_argument("--model", default=os.environ.get("FAL_TTS_MODEL", DEFAULT_MODEL))
    parser.add_argument("--voice-id", default=os.environ.get("FAL_VOICE_ID", DEFAULT_VOICE_ID))
    parser.add_argument("--speed", type=float, default=float(os.environ.get("FAL_TTS_SPEED", "0.92")))
    parser.add_argument("--volume", type=float, default=float(os.environ.get("FAL_TTS_VOLUME", "1.0")))
    parser.add_argument("--pitch", type=int, default=int(os.environ.get("FAL_TTS_PITCH", "-2")))
    parser.add_argument("--emotion", default=os.environ.get("FAL_TTS_EMOTION", "neutral"))
    parser.add_argument("--sample-rate", type=int, default=int(os.environ.get("FAL_TTS_SAMPLE_RATE", "44100")))
    parser.add_argument("--bitrate", type=int, default=int(os.environ.get("FAL_TTS_BITRATE", "256000")))
    parser.add_argument("--pause", type=float, default=float(os.environ.get("FAL_TTS_PARAGRAPH_PAUSE", "0.65")))
    parser.add_argument("--max-chars", type=int, default=int(os.environ.get("FAL_TTS_MAX_CHARS", "4800")))
    parser.add_argument("--timeout", type=int, default=int(os.environ.get("FAL_TTS_TIMEOUT", "300")))
    parser.add_argument("--sleep", type=float, default=float(os.environ.get("FAL_TTS_SLEEP", "0.5")))
    parser.add_argument("--only", help="Comma-separated guide ids to generate, e.g. 1,8,21")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing MP3 files")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be generated without calling fal.ai")
    return parser


def main():
    args = build_arg_parser().parse_args()
    args.speed = clamp(args.speed, 0.5, 2.0)
    args.volume = clamp(args.volume, 0.1, 10.0)
    args.pitch = int(clamp(args.pitch, -12, 12))
    only_ids = parse_only(args.only)
    guides = sorted(load_guides(args.guides_dir, args.guides_json), key=lambda guide: int(guide["id"]))

    if only_ids is None and len(guides) != TOTAL_GUIDES:
        print(f"Warning: expected {TOTAL_GUIDES} guides, found {len(guides)}")

    selected = [guide for guide in guides if only_ids is None or int(guide["id"]) in only_ids]
    if not selected:
        raise SystemExit("No guides selected.")

    args.output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Model: {args.model}")
    print(f"Voice: {args.voice_id} | speed={args.speed} pitch={args.pitch} emotion={args.emotion}")
    print("Input: description only. Titles/subtitles are not sent to fal.ai.")

    for guide in selected:
        guide_id = int(guide["id"])
        output_path = args.output_dir / output_name_for_guide(guide)
        description = normalize_description(guide.get("description", ""), args.pause)

        if not description:
            print(f"[{guide_id:02d}] skipped: empty description")
            continue

        if output_path.exists() and not args.overwrite:
            print(f"[{guide_id:02d}] skipped: {output_path} exists")
            continue

        chunks = split_prompt(description, args.max_chars)
        print(f"[{guide_id:02d}] generating {output_path} ({len(description)} chars, {len(chunks)} part(s))")

        if args.dry_run:
            continue

        part_paths = []
        for index, chunk in enumerate(chunks, start=1):
            audio_url = fal_generate_audio_url(chunk, args)
            part_path = output_path if len(chunks) == 1 else output_path.with_suffix(f".part{index}.mp3")
            download_file(audio_url, part_path, args.timeout)
            part_paths.append(part_path)
            time.sleep(args.sleep)

        if len(part_paths) > 1:
            # All current guide descriptions are below the fal limit. This fallback keeps
            # long future articles usable without adding ffmpeg as a hard dependency.
            output_path.write_bytes(b"".join(path.read_bytes() for path in part_paths))
            for path in part_paths:
                path.unlink(missing_ok=True)

        print(f"[{guide_id:02d}] saved {output_path}")


if __name__ == "__main__":
    main()
