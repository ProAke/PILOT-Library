#!/usr/bin/env python3
"""
PILOT Library — asset pipeline.

Turns the raw photos that live in the Google Drive folder `Pilot-library`
(kept here under `assets-source/drive/`) into web-ready catalogue assets:

  public/catalog/<slug>-1.jpg   square product tile (1:1, soft studio background)
  public/catalog/<slug>-1@2x.jpg same tile at 2x for zoom / detail pages
  public/catalog/<slug>-<n>.jpg  extra gallery shots (natural aspect, max 1400px)
  public/hero/cover.jpg          category cover built from image-3
  public/assets/logo-*.png       wordmark extracted from image-2

Run:  python3 scripts/prepare-images.py
Requires: pillow, numpy
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-source" / "drive"
OUT_CATALOG = ROOT / "public" / "catalog"
OUT_HERO = ROOT / "public" / "hero"
OUT_ASSETS = ROOT / "public" / "assets"

TILE_BG = (243, 241, 237)      # warm studio grey, matches the reference layout
TILE_SIZE = 900
TILE_PAD = 0.045


def open_drive(name: str) -> Image.Image:
    return Image.open(SRC / name).convert("RGB")


def crop_frac(im: Image.Image, box) -> Image.Image:
    """box = (x0, y0, x1, y1) in 0..1 fractions."""
    w, h = im.size
    x0, y0, x1, y1 = box
    return im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))


def trim_borders(im: Image.Image, tol: int = 12) -> Image.Image:
    """Remove near-uniform outer border (studio / poster edges)."""
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    h, w, _ = a.shape
    edge = np.concatenate([a[0:3].reshape(-1, 3), a[-3:].reshape(-1, 3),
                           a[:, 0:3].reshape(-1, 3), a[:, -3:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    diff = np.abs(a - bg).sum(axis=2)
    mask = diff > tol * 3
    if mask.mean() < 0.01:
        return im
    ys, xs = np.where(mask)
    pad = 4
    return im.crop((max(0, xs.min() - pad), max(0, ys.min() - pad),
                    min(w, xs.max() + pad), min(h, ys.max() + pad)))


def feathered(im: Image.Image, feather: float = 0.055) -> Image.Image:
    """Fade the photo's outer edge into the tile background.

    Source shots come from many places (studio, shop floor, rooftop) so instead
    of a hard rectangular seam every tile gets a soft vignette edge — it reads
    as one consistent catalogue.
    """
    w, h = im.size
    mask = Image.new("L", (w, h), 255)
    fx, fy = max(2, int(w * feather)), max(2, int(h * feather))
    ramp_x = Image.linear_gradient("L").resize((fx, h))
    ramp_y = Image.linear_gradient("L").resize((w, fy)).rotate(90)
    mask.paste(ramp_x.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (0, 0))
    mask.paste(ramp_x, (w - fx, 0))
    mask.paste(ramp_y.transpose(Image.Transpose.FLIP_TOP_BOTTOM), (0, 0))
    mask.paste(ramp_y, (0, h - fy))
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def square_tile(im: Image.Image, size: int = TILE_SIZE, pad: float = TILE_PAD) -> Image.Image:
    """Centre the subject on a warm studio background — the catalogue look."""
    im = trim_borders(im)
    im.thumbnail((int(size * (1 - 2 * pad)), int(size * (1 - 2 * pad))), Image.LANCZOS)
    canvas = Image.new("RGB", (size, size), TILE_BG)
    # soft ground shadow for a little depth
    shadow = Image.new("L", (size, size), 0)
    sw, sh = int(im.width * 0.84), max(18, int(im.height * 0.04))
    sx, sy = (size - sw) // 2, (size + im.height) // 2 + int(size * 0.014)
    sy = min(sy, size - 6)
    sd = Image.new("L", (sw, sh), 40).filter(ImageFilter.GaussianBlur(16))
    shadow.paste(sd, (sx, max(0, sy - sh // 2)))
    canvas.paste(Image.new("RGB", (size, size), (198, 192, 183)), (0, 0), shadow.point(lambda v: v // 3))
    canvas.paste(
        feathered(im),
        ((size - im.width) // 2, (size - im.height) // 2 - int(size * 0.012)),
        feathered(im),
    )
    return canvas


def save_jpg(im: Image.Image, path: Path, quality: int = 86) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


def gallery(im: Image.Image, max_side: int = 1400) -> Image.Image:
    im = im.copy()
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    return im


# ---------------------------------------------------------------------------
# Product manifest — every entry points at a photo inside the Drive folder.
# key: (drive filename, crop ratios or None, tile? or gallery-only)
# ---------------------------------------------------------------------------
D = "drive/"

PRODUCTS: dict[str, list[tuple[str, tuple | None]]] = {
    # --- apparel -----------------------------------------------------------
    "thai-pilot-polo": [("483428555_1146095110547747_7927893319459794111_n.jpg", None)],
    "graphic-tee-bone": [("528033376_1254071729750084_8678912893189217030_n.jpg", (0.435, 0.185, 0.885, 0.545))],
    "graphic-tee-olive": [("514329143_1254071763083414_5486668837346366968_n.jpg", (0.035, 0.19, 0.455, 0.515))],
    "graphic-tee-forest": [("514329143_1254071763083414_5486668837346366968_n.jpg", (0.505, 0.19, 0.875, 0.525))],
    "kids-graphic-tee": [("528630985_1254071756416748_6802554574379832605_n.jpg", (0.605, 0.505, 0.885, 0.775))],
    "flight-windbreaker": [
        ("575184560_1330962345394355_2875365466980833138_n.jpg", None),
        ("576620821_1330962385394351_7540338853092393497_n.jpg", None),
        ("576591745_1330962405394349_8228843267522753373_n.jpg", None),
    ],
    "instructor-shirt": [("657050596_1438055204685068_8225619569059917472_n.jpg", (0.05, 0.12, 0.96, 0.78))],
    # --- bags --------------------------------------------------------------
    "a330-tote": [("497586883_1192421389248452_6069975834229068751_n.jpg", None)],
    "canvas-tote-brown": [("528042860_1254071709750086_1175419260948016847_n.jpg", (0.27, 0.41, 0.70, 0.87))],
    "canvas-tote-tan": [("528466654_1254071723083418_5188366281368163166_n.jpg", (0.02, 0.40, 0.46, 0.90))],
    "jute-christmas-tote": [("484183055_1146102963880295_3369660361965284564_n.jpg", (0.0, 0.16, 1.0, 0.63))],
    "pink-foldable-tote": [("655603588_1438055338018388_9076850822480323574_n.jpg", (0.13, 0.0, 0.99, 0.97))],
    "airbus-briefcase": [("683186527_1464489682041620_5110828255217481106_n.jpg", None)],
    "a380-travel-set": [("656898514_1438055331351722_5335330012654399751_n.jpg", (0.03, 0.06, 0.99, 0.99))],
    # --- accessories -------------------------------------------------------
    "cabin-crew-lanyard": [("484088423_1145481280609130_6948918181566781764_n.jpg", (0.0, 0.28, 0.49, 0.99))],
    "airbus-id-lanyard": [("655165235_1438055244685064_5118437019621173833_n.jpg", (0.02, 0.10, 0.99, 0.95))],
    "woven-key-tag": [("482031626_1145477453942846_2225670194872519231_n.jpg", (0.668, 0.51, 0.997, 0.995))],
    "airbus-card-wallet": [("483485882_1146111480546110_292755356123117523_n.jpg", (0.02, 0.30, 0.99, 0.97))],
    "zip-pouch-set": [("527236229_1254071713083419_8177083048420893051_n.jpg", (0.315, 0.635, 0.635, 0.925))],
    "thai-tail-keyring": [("656791001_1438055314685057_7564044512417539092_n.jpg", None)],
    "acrylic-keychain": [("656939484_1438055171351738_6259475003455416423_n.jpg", (0.08, 0.05, 0.95, 0.92))],
    "resin-aircraft-keychain": [("658043763_1438055211351734_2033646974525448576_n.jpg", (0.02, 0.10, 0.99, 0.90))],
    # --- souvenirs ---------------------------------------------------------
    "airbus-umbrella-red": [("496017850_1192418402582084_2310209381700588557_n.jpg", (0.02, 0.03, 0.99, 0.99))],
    "airbus-boeing-umbrella": [("496874243_1192418392582085_2860775223893941361_n.jpg", (0.03, 0.03, 0.97, 0.98))],
    "airbus-tumbler": [("482031626_1145477453942846_2225670194872519231_n.jpg", (0.665, 0.01, 0.997, 0.50))],
    "backpack-a350": [("482031626_1145477453942846_2225670194872519231_n.jpg", (0.01, 0.01, 0.335, 0.50))],
}


def build_catalog() -> list[dict]:
    manifest: list[dict] = []
    for slug, shots in PRODUCTS.items():
        files = []
        for idx, (fname, box) in enumerate(shots):
            im = open_drive(fname)
            shot = crop_frac(im, box) if box else im
            tile = square_tile(shot)
            out = OUT_CATALOG / f"{slug}-{idx + 1}.jpg"
            save_jpg(tile, out, 86)
            big = tile.resize((TILE_SIZE, TILE_SIZE), Image.LANCZOS)
            save_jpg(big, OUT_CATALOG / f"{slug}-{idx + 1}@2x.jpg", 82)
            if idx > 0:
                g = gallery(shot)
                save_jpg(g, OUT_CATALOG / f"{slug}-{idx + 1}-full.jpg", 84)
            files.append(f"/catalog/{slug}-{idx + 1}.jpg")
        manifest.append({"slug": slug, "images": files})
        print(f"  · {slug:<26} {len(files)} shot(s)")
    return manifest


def build_logo() -> None:
    """Extract the wordmark from the supplied signage photo (image-2).

    The photo is a hand-painted sign on a textured wall, so we estimate the
    local background with a heavy blur, take the luminance ratio, and use that
    as an alpha channel. The result is a clean lockup that can be tinted.
    """
    src = Image.open(ROOT / "assets-source" / "image-2-logo.png").convert("RGB")
    a = np.asarray(src).astype(np.float32) / 255.0
    lum = 0.299 * a[:, :, 0] + 0.587 * a[:, :, 1] + 0.114 * a[:, :, 2]
    l_img = Image.fromarray((lum * 255).astype(np.uint8), "L")
    bg = np.asarray(l_img.filter(ImageFilter.GaussianBlur(16))).astype(np.float32) / 255.0
    bg = np.maximum(bg, 0.4)
    alpha = np.clip((0.97 - np.clip(lum / bg, 0, 1)) / 0.30, 0, 1)

    mask = np.zeros_like(alpha)
    mask[4:96, 56:366] = 1      # P I L O T
    mask[97:109, 64:374] = 1    # rule
    mask[108:147, 100:340] = 1  # L I B R A R Y
    alpha *= mask
    alpha = np.asarray(
        Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.MedianFilter(3))
    ).astype(np.float32) / 255.0

    def render(m: np.ndarray, name: str) -> Image.Image:
        ys, xs = np.where(m > 0.2)
        sub = m[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
        h, w = sub.shape
        s = max(1, int(round(1200.0 / w)))
        img = Image.fromarray((sub * 255).astype(np.uint8), "L").resize((w * s, h * s), Image.LANCZOS)
        arr = np.clip((np.asarray(img).astype(np.float32) / 255.0 - 0.05) / 0.9, 0, 1)
        img = Image.fromarray((arr * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.4))
        out = Image.new("RGBA", img.size, (17, 24, 34, 0))
        out.putalpha(img)
        out.save(OUT_ASSETS / name, "PNG", optimize=True)
        return out

    render(alpha, "logo-lockup.png")
    word = alpha.copy()
    word[94:, :] = 0
    render(word, "logo-word.png")
    sub = alpha.copy()
    sub[:108, :] = 0
    render(sub, "logo-sub.png")

    for name in ("logo-lockup", "logo-word", "logo-sub"):
        mark = Image.open(OUT_ASSETS / f"{name}.png")
        tint = Image.new("RGBA", mark.size, (247, 244, 238, 0))
        tint.putalpha(mark.getchannel("A"))
        tint.save(OUT_ASSETS / f"{name}-bone.png", "PNG", optimize=True)
    print("  · logo lockups")


def build_hero() -> None:
    """Build the banner from the supplied cover (image-3).

    The artwork is already a 3x2 collage of the collection, so we keep its
    aspect ratio, resample it large and warm it very slightly so it sits on the
    paper background without a colour clash. The caption + scrim are drawn in
    CSS on top of it.
    """
    cover = Image.open(ROOT / "assets-source" / "image-3-hero.png").convert("RGB")
    for name, width, quality in (("cover.jpg", 2000, 90), ("cover-mobile.jpg", 1100, 88)):
        im = cover.copy()
        im.thumbnail((width, width), Image.LANCZOS)
        im = Image.fromarray(np.clip(np.asarray(im).astype(np.float32) * 0.99 + 4, 0, 255).astype(np.uint8))
        save_jpg(im, OUT_HERO / name, quality)
    print("  · hero cover 2000×1300 + mobile")


def build_icons() -> None:
    logo = Image.open(OUT_ASSETS / "logo-lockup-bone.png")
    logo.thumbnail((1000, 1000), Image.LANCZOS)
    for size, name in [(512, "icon-512.png"), (192, "icon-192.png"),
                       (180, "apple-touch-icon.png")]:
        canvas = Image.new("RGBA", (size, size), (17, 24, 34, 255))
        # keep the mark inside the maskable safe zone (80%)
        inner = int(size * 0.72)
        mark = logo.copy()
        mark.thumbnail((inner, inner), Image.LANCZOS)
        canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
        canvas.convert("RGB").save(OUT_ASSETS / name, "PNG", optimize=True)
    # maskable: extra padding
    canvas = Image.new("RGBA", (512, 512), (243, 241, 237, 255))
    mark = logo.copy()
    mark.thumbnail((300, 300), Image.LANCZOS)
    canvas.alpha_composite(mark, ((512 - mark.width) // 2, (512 - mark.height) // 2))
    canvas.convert("RGB").save(OUT_ASSETS / "icon-maskable-512.png", "PNG", optimize=True)
    print("  · icons")


def build_og() -> None:
    cover = Image.open(OUT_HERO / "cover.jpg").convert("RGB")
    canvas = Image.new("RGB", (1200, 630), (200, 167, 144))
    og = cover.copy()
    og.thumbnail((1200, 1200), Image.LANCZOS)
    if og.height < 630:
        canvas.paste(og, ((1200 - og.width) // 2, (630 - og.height) // 2))
    else:
        top = (og.height - 630) // 2
        canvas.paste(og.crop((0, top, og.width, top + 630)), (0, 0))
    save_jpg(canvas, OUT_HERO / "og.jpg", 86)
    print("  · og image")


def main() -> None:
    OUT_CATALOG.mkdir(parents=True, exist_ok=True)
    OUT_HERO.mkdir(parents=True, exist_ok=True)
    OUT_ASSETS.mkdir(parents=True, exist_ok=True)
    print("Extracting logo…")
    build_logo()
    print("Building hero + icons…")
    build_hero()
    build_icons()
    build_og()
    print("Building catalogue tiles…")
    manifest = build_catalog()
    (ROOT / "data").mkdir(exist_ok=True)
    with open(ROOT / "data" / "image-manifest.json", "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
    print(f"Done — {len(manifest)} products.")


if __name__ == "__main__":
    main()
