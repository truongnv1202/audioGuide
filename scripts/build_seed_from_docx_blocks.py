import json
import re
import sys
from pathlib import Path


TOTAL_GUIDES = 24


def normalize_line(line):
    return re.sub(r"[ \t]+", " ", line.replace("\xa0", " ")).strip()


def clean_lines(value):
    lines = [normalize_line(line) for line in value.splitlines()]
    lines = [line for line in lines if line]
    return [line for line in lines if not re.match(r"^\(\d+\s*ký\s*tự\)$", line, re.I)]


def parse_guide(item_id, value):
    lines = clean_lines(value)
    title = lines[0] if lines else f"Bài thuyết minh {item_id:02d}"
    subtitle = ""
    description_start = 1

    if len(lines) > 1 and re.match(r"^\(.+\)$", lines[1]):
        subtitle = lines[1]
        description_start = 2

    description = "\n\n".join(lines[description_start:]).strip()

    if not description:
        description = f"Nội dung mẫu cho bài thuyết minh số {item_id:02d}."

    return {
        "id": item_id,
        "title": title,
        "subtitle": subtitle,
        "description": description,
        "imageUrl": f"/images/items/{item_id:02d}.jpg",
        "audioUrl": f"/audio/{item_id:02d}.mp3",
    }


def extract_guides(blocks):
    guides = []

    for block in blocks:
        if block.get("type") != "table":
            continue

        for row in block.get("rows", []):
            if len(row) < 2:
                continue

            raw_id = normalize_line(row[0])
            if not raw_id.isdigit():
                continue

            item_id = int(raw_id)
            if 1 <= item_id <= TOTAL_GUIDES:
                guides.append(parse_guide(item_id, row[1]))

    guides_by_id = {guide["id"]: guide for guide in guides}
    return [guides_by_id[item_id] for item_id in range(1, TOTAL_GUIDES + 1)]


def seed_js(guides):
    return (
        "import { mkdir, writeFile } from \"node:fs/promises\";\n"
        "import path from \"node:path\";\n\n"
        f"export const guides = {json.dumps(guides, ensure_ascii=False, indent=2)};\n\n"
        "const outputPath = process.env.GUIDES_DATA_PATH || path.join(process.cwd(), \"data\", \"guides.json\");\n"
        "await mkdir(path.dirname(outputPath), { recursive: true });\n"
        "await writeFile(outputPath, `${JSON.stringify(guides, null, 2)}\\n`, \"utf8\");\n\n"
        "console.log(`Created ${outputPath}`);\n"
        "console.log(`Total guides: ${guides.length}`);\n"
    )


def main():
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: build_seed_from_docx_blocks.py <blocks_json> <seed_js> <guides_json>"
        )

    blocks_path = Path(sys.argv[1])
    seed_path = Path(sys.argv[2])
    guides_path = Path(sys.argv[3])

    blocks = json.loads(blocks_path.read_text(encoding="utf-8"))
    guides = extract_guides(blocks)

    if len(guides) != TOTAL_GUIDES:
        raise SystemExit(f"Expected {TOTAL_GUIDES} guides, got {len(guides)}")

    seed_path.write_text(seed_js(guides), encoding="utf-8")
    guides_path.parent.mkdir(parents=True, exist_ok=True)
    guides_path.write_text(
        json.dumps(guides, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
