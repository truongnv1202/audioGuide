import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = f"{{{NS['w']}}}"


def normalize(text):
    return re.sub(r"[ \t]+", " ", text.replace("\xa0", " ")).strip()


def text_from_element(element):
    parts = []
    for node in element.iter():
        if node.tag == f"{W}t":
            parts.append(node.text or "")
        elif node.tag == f"{W}tab":
            parts.append("\t")
        elif node.tag in {f"{W}br", f"{W}cr"}:
            parts.append("\n")
    return normalize("".join(parts))


def paragraph_style(paragraph):
    style = paragraph.find("./w:pPr/w:pStyle", NS)
    if style is None:
        return ""
    return style.attrib.get(f"{W}val", "")


def extract_blocks(docx_path):
    with zipfile.ZipFile(docx_path) as archive:
        document_xml = archive.read("word/document.xml")

    root = ET.fromstring(document_xml)
    body = root.find("w:body", NS)
    blocks = []

    for child in list(body):
        if child.tag == f"{W}p":
            text = text_from_element(child)
            if text:
                blocks.append(
                    {
                        "type": "paragraph",
                        "style": paragraph_style(child),
                        "text": text,
                    }
                )
        elif child.tag == f"{W}tbl":
            rows = []
            for row in child.findall("./w:tr", NS):
                cells = []
                for cell in row.findall("./w:tc", NS):
                    paragraphs = [
                        text_from_element(paragraph)
                        for paragraph in cell.findall("./w:p", NS)
                    ]
                    cell_text = "\n".join(
                        paragraph for paragraph in paragraphs if paragraph
                    ).strip()
                    cells.append(cell_text)
                if any(cells):
                    rows.append(cells)
            if rows:
                blocks.append({"type": "table", "rows": rows})

    return blocks


def write_text_dump(blocks, output_path):
    lines = []
    for index, block in enumerate(blocks, start=1):
        if block["type"] == "paragraph":
            lines.append(f"## BLOCK {index} PARAGRAPH style={block.get('style', '')}")
            lines.append(block["text"])
        else:
            lines.append(f"## BLOCK {index} TABLE rows={len(block['rows'])}")
            for row_index, row in enumerate(block["rows"], start=1):
                lines.append(f"-- row {row_index}")
                for cell_index, cell in enumerate(row, start=1):
                    lines.append(f"[{cell_index}] {cell}")
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: extract_docx_blocks.py <docx_path> <json_output> <text_output>"
        )

    docx_path = Path(sys.argv[1])
    json_output = Path(sys.argv[2])
    text_output = Path(sys.argv[3])

    blocks = extract_blocks(docx_path)
    json_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.write_text(
        json.dumps(blocks, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_text_dump(blocks, text_output)


if __name__ == "__main__":
    main()
