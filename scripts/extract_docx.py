import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}


def text_from_element(element):
    parts = []
    for node in element.iter():
        if node.tag == f"{{{NS['w']}}}t":
            parts.append(node.text or "")
        elif node.tag == f"{{{NS['w']}}}tab":
            parts.append("\t")
        elif node.tag == f"{{{NS['w']}}}br":
            parts.append("\n")
    return re.sub(r"[ \t]+", " ", "".join(parts)).strip()


def paragraph_style(paragraph):
    style = paragraph.find("./w:pPr/w:pStyle", NS)
    if style is None:
        return ""
    return style.attrib.get(f"{{{NS['w']}}}val", "")


def extract_docx(path):
    with zipfile.ZipFile(path) as docx:
        xml = docx.read("word/document.xml")

    root = ET.fromstring(xml)
    body = root.find("w:body", NS)
    blocks = []

    for child in list(body):
        if child.tag == f"{{{NS['w']}}}p":
            text = text_from_element(child)
            if text:
                blocks.append(
                    {
                        "type": "paragraph",
                        "style": paragraph_style(child),
                        "text": text,
                    }
                )
        elif child.tag == f"{{{NS['w']}}}tbl":
            rows = []
            for row in child.findall("./w:tr", NS):
                cells = []
                for cell in row.findall("./w:tc", NS):
                    paragraphs = [
                        text_from_element(paragraph)
                        for paragraph in cell.findall(".//w:p", NS)
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


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: extract_docx.py <docx_path> <output_json>")

    docx_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    blocks = extract_docx(docx_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(blocks, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
