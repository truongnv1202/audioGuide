import argparse
import posixpath
import re
import shutil
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


TOTAL_GUIDES = 24
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DOCX_PATH = Path(
    r"C:\Users\vsp\Downloads\[Chiều 23.4. 2026] KB PHÂN KHU 5 - sửa theo góp ý của X03 (1).docx"
)
DEFAULT_DOCX_GLOB = "*KB*X03 (1).docx"
DOCX_NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}


def resolve_docx_path(docx_arg):
    if docx_arg:
        docx_path = Path(docx_arg)
        if docx_path.exists():
            return docx_path

        raise SystemExit(f"DOCX not found: {docx_path}")

    if DEFAULT_DOCX_PATH.exists():
        return DEFAULT_DOCX_PATH

    downloads_dir = Path.home() / "Downloads"
    matches = sorted(downloads_dir.glob(DEFAULT_DOCX_GLOB))

    if len(matches) == 1:
        return matches[0]

    if not matches:
        raise SystemExit(
            f"DOCX not found: {DEFAULT_DOCX_PATH}. "
            f"Also found no {DEFAULT_DOCX_GLOB!r} match in {downloads_dir}."
        )

    options = "\n".join(f"- {path}" for path in matches)
    raise SystemExit(f"Found multiple DOCX matches; pass one explicitly:\n{options}")


def normalize_text(value):
    return re.sub(r"[ \t]+", " ", value.replace("\xa0", " ")).strip()


def cell_text(cell):
    texts = [node.text or "" for node in cell.findall(".//w:t", DOCX_NS)]
    return normalize_text("".join(texts))


def rel_targets(docx):
    rels_xml = docx.read("word/_rels/document.xml.rels")
    root = ET.fromstring(rels_xml)
    targets = {}

    for rel in root.findall("rel:Relationship", DOCX_NS):
        rel_id = rel.attrib.get("Id")
        target = rel.attrib.get("Target", "")

        if rel_id and target.startswith("media/"):
            targets[rel_id] = posixpath.normpath(posixpath.join("word", target))

    return targets


def embedded_images(element, targets):
    image_paths = []

    for blip in element.findall(".//a:blip", DOCX_NS):
        rel_id = blip.attrib.get(f"{{{DOCX_NS['r']}}}embed")
        image_path = targets.get(rel_id)

        if image_path:
            image_paths.append(image_path)

    return image_paths


def image_extension(data, fallback):
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return ".gif"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"

    suffix = Path(fallback).suffix.lower()
    return ".jpg" if suffix in {".jpeg", ".jpg"} else suffix or ".jpg"


def extract_images(docx_path, output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(docx_path) as docx:
        document_xml = docx.read("word/document.xml")
        root = ET.fromstring(document_xml)
        targets = rel_targets(docx)
        extracted = []

        for row in root.findall(".//w:tr", DOCX_NS):
            cells = row.findall("./w:tc", DOCX_NS)
            if not cells:
                continue

            row_id = None
            for cell in cells:
                text = cell_text(cell)
                if text.isdigit():
                    candidate = int(text)
                    if 1 <= candidate <= TOTAL_GUIDES:
                        row_id = candidate
                        break

            if row_id is None:
                continue

            images = embedded_images(row, targets)
            if not images:
                continue

            image_path = images[0]
            image_data = docx.read(image_path)
            ext = image_extension(image_data, image_path)
            output_path = output_dir / f"{row_id:02d}{ext}"
            output_path.write_bytes(image_data)
            extracted.append(output_path)

            if ext != ".jpg":
                # Keep the existing /images/items/NN.jpg URLs working even when Word stores PNG/WebP.
                jpg_alias = output_dir / f"{row_id:02d}.jpg"
                if jpg_alias != output_path:
                    shutil.copyfile(output_path, jpg_alias)

        return extracted


def main():
    parser = argparse.ArgumentParser(
        description="Extract the 24 item images embedded in the source DOCX."
    )
    parser.add_argument(
        "docx",
        nargs="?",
        help="Source DOCX. Defaults to the known Downloads file, with an ASCII-safe glob fallback.",
    )
    parser.add_argument(
        "output_dir",
        nargs="?",
        default=str(PROJECT_ROOT / "public" / "images" / "items"),
        help="Output folder. Defaults to public/images/items in this repo.",
    )
    args = parser.parse_args()

    docx_path = resolve_docx_path(args.docx)
    output_dir = Path(args.output_dir)

    extracted = extract_images(docx_path, output_dir)
    print(f"Extracted {len(extracted)} image(s) into {output_dir}")

    if len(extracted) != TOTAL_GUIDES:
        missing = [
            f"{item_id:02d}"
            for item_id in range(1, TOTAL_GUIDES + 1)
            if not any((output_dir / f"{item_id:02d}{ext}").exists() for ext in [".jpg", ".png", ".webp", ".gif"])
        ]
        raise SystemExit(f"Expected {TOTAL_GUIDES} images, missing: {', '.join(missing)}")

    missing_jpgs = [
        f"{item_id:02d}.jpg"
        for item_id in range(1, TOTAL_GUIDES + 1)
        if not (output_dir / f"{item_id:02d}.jpg").exists()
    ]
    if missing_jpgs:
        raise SystemExit(f"Missing JPG URL aliases: {', '.join(missing_jpgs)}")

    print("Verified 24 JPG URL files: 01.jpg ... 24.jpg")


if __name__ == "__main__":
    main()
