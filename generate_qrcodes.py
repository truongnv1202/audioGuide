from pathlib import Path


BASE_URL = "https://audioguide.gamegiaoduc.co/?id={id}"
OUTPUT_DIR = Path("qrcodes")


def generate_qr_codes(start_id: int = 1, end_id: int = 24) -> None:
    try:
        import qrcode
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: qrcode\n"
            "Install it with: pip install -r requirements.txt"
        ) from exc

    OUTPUT_DIR.mkdir(exist_ok=True)

    for item_id in range(start_id, end_id + 1):
        url = BASE_URL.format(id=item_id)
        image = qrcode.make(url)
        output_path = OUTPUT_DIR / f"qrcode_{item_id:02d}.png"
        image.save(output_path)
        print(f"Created {output_path}: {url}")


if __name__ == "__main__":
    generate_qr_codes()
