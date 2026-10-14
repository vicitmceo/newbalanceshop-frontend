"""Підключає власні фото товарів одним запуском.

Використання:
    python scripts/apply_photos.py <папка_з_фото> [--api https://newbalance.cc.cd] [--upload]

Імена файлів у папці: <id товару>.jpg (головне фото), <id>-2.jpg, <id>-3.jpg ... (галерея).
Приклад: 5.jpg, 5-2.jpg, 5-3.jpg, 9.jpg.

Скрипт зменшує фото до 1000 px, стискає й кладе в public/images/p<id>-<n>.jpg.
З --upload ще й оновлює товари через API від імені адміністратора
(email і пароль беруться зі змінних середовища NBS_ADMIN_EMAIL / NBS_ADMIN_PASSWORD).
Потрібні: pip install pillow requests
"""
import argparse, json, os, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"


def collect(folder: Path):
    groups = {}
    for f in sorted(folder.iterdir()):
        m = re.fullmatch(r"(\d+)(?:-(\d+))?\.(jpe?g|png|webp)", f.name, re.I)
        if m:
            groups.setdefault(int(m.group(1)), []).append((int(m.group(2) or 1), f))
    return {pid: [f for _, f in sorted(items)] for pid, items in groups.items()}


def process(pid: int, files):
    urls = []
    for n, f in enumerate(files, 1):
        im = Image.open(f).convert("RGB")
        im.thumbnail((1000, 1000))
        name = f"p{pid}-{n}.jpg"
        im.save(OUT / name, "JPEG", quality=82, optimize=True, progressive=True)
        urls.append(f"/images/{name}")
    return urls


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder")
    ap.add_argument("--api", default="https://newbalance.cc.cd")
    ap.add_argument("--upload", action="store_true")
    args = ap.parse_args()

    groups = collect(Path(args.folder))
    if not groups:
        sys.exit("У папці немає файлів виду 5.jpg, 5-2.jpg")

    result = {pid: process(pid, files) for pid, files in groups.items()}
    print(json.dumps(result, indent=2))

    if not args.upload:
        print("\nФото збережено в public/images. Щоб оновити товари, додайте --upload.")
        return

    import requests
    s = requests.Session()
    r = s.post(f"{args.api}/api/Auth/login", json={"email": os.environ["NBS_ADMIN_EMAIL"], "password": os.environ["NBS_ADMIN_PASSWORD"]})
    r.raise_for_status()
    for pid, urls in result.items():
        product = s.get(f"{args.api}/api/Products/{pid}").json()
        product["imageUrl"] = urls[0]
        product["extraImages"] = ",".join(urls[1:])
        s.put(f"{args.api}/api/Products/{pid}", json=product).raise_for_status()
        print(f"товар {pid}: оновлено ({len(urls)} фото)")
    print("\nНе забудьте закомітити public/images і задеплоїти фронтенд, щоб файли з'явилися на сайті.")


if __name__ == "__main__":
    main()
