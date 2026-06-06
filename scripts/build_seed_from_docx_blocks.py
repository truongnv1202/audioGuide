import json
import re
import sys
from pathlib import Path


TOTAL_GUIDES = 24


def clean_line(line):
    return re.sub(r"\s+", " ", line).strip()


def clean_content(value):
    lines = [clean_line(line) for line in value.splitlines()]
    lines = [line for line in lines if line]
    return [
        line
        for line in lines
        if not re.fullmatch(r"\(\d+\s*ký\s*tự\)", line, flags=re.IGNORECASE)
    ]


def guide_from_row(row):
    item_id = int(clean_line(row[0]))
    lines = clean_content(row[1])
    title = lines[0]
    subtitle = lines[1] if len(lines) > 1 and re.fullmatch(r"\(.+\)", lines[1]) else ""
    description_start = 2 if subtitle else 1

    return {
        "id": item_id,
        "title": title,
        "subtitle": subtitle,
        "description": "\n\n".join(lines[description_start:]),
        "imageUrl": f"/images/items/{item_id:02d}.jpg",
        "audioUrl": f"/audio/{item_id:02d}.mp3",
    }


def find_guide_rows(blocks):
    rows = []
    for block in blocks:
        if block.get("type") != "table":
            continue

        for row in block.get("rows", []):
            if len(row) < 2:
                continue

            first_cell = clean_line(row[0])
            if first_cell.isdigit() and 1 <= int(first_cell) <= TOTAL_GUIDES:
                rows.append(row)

    return rows


def render_seed(guides):
    return (
        "export const guides = "
        + json.dumps(guides, ensure_ascii=False, indent=2)
        + ";\n\n"
        + "export function getGuideById(id) {\n"
        + "  const numericId = Number(id);\n"
        + "  return guides.find((guide) => guide.id === numericId) ?? null;\n"
        + "}\n"
    )


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build_seed_from_docx_blocks.py <blocks_json> <seed_js>")

    blocks_path = Path(sys.argv[1])
    seed_path = Path(sys.argv[2])
    blocks = json.loads(blocks_path.read_text(encoding="utf-8-sig"))
    rows = find_guide_rows(blocks)

    if len(rows) != TOTAL_GUIDES:
        raise SystemExit(f"Expected {TOTAL_GUIDES} guide rows, found {len(rows)}")

    guides = [guide_from_row(row) for row in rows]
    ids = [guide["id"] for guide in guides]
    if ids != list(range(1, TOTAL_GUIDES + 1)):
        raise SystemExit(f"Guide ids are not sequential: {ids}")

    seed_path.write_text(render_seed(guides), encoding="utf-8")


if __name__ == "__main__":
    main()
