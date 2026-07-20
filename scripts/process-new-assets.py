#!/usr/bin/env python3
"""Process hamster + capsule images: crop content, resize, place into src/assets."""
from PIL import Image
import os

BASE = '/Users/yier/Documents/daijinli网页版/daijinli-miniapp'

JOBS = [
    {
        'src': f'{BASE}/assets-concepts/collection-samples/A_cute_hamster__chibi_pixel_ar_2026-07-20T08-16-46.png',
        'dst': f'{BASE}/src/assets/collection/pet-hamster-120.png',
        'size': 120,
    },
    {
        'src': f'{BASE}/assets-concepts/collection-samples/A_closed_pixel_art_gashapon_ca_2026-07-20T08-18-18.png',
        'dst': f'{BASE}/src/assets/supply/capsule-160.png',
        'size': 160,
    },
]


def crop_content(img: Image.Image, bg_tolerance: int = 30) -> Image.Image:
    """Crop to content bounding box by detecting pixels differing from corner bg color."""
    rgb = img.convert('RGB')
    w, h = rgb.size
    bg = rgb.getpixel((5, 5))
    pixels = rgb.load()

    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            p = pixels[x, y]
            if (abs(p[0] - bg[0]) > bg_tolerance or
                    abs(p[1] - bg[1]) > bg_tolerance or
                    abs(p[2] - bg[2]) > bg_tolerance):
                if x < min_x:
                    min_x = x
                if x > max_x:
                    max_x = x
                if y < min_y:
                    min_y = y
                if y > max_y:
                    max_y = y

    if max_x <= min_x or max_y <= min_y:
        return img

    # Exclude bottom-right watermark zone (last 12% height, right 45% width)
    wm_top = int(h * 0.88)
    if max_y > wm_top:
        max_y = wm_top

    pad = 6
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(w, max_x + pad)
    max_y = min(h, max_y + pad)

    return img.crop((min_x, min_y, max_x, max_y))


def make_square(img: Image.Image, fill=(0, 0, 0, 0)) -> Image.Image:
    w, h = img.size
    side = max(w, h)
    out = Image.new('RGBA', (side, side), fill)
    out.paste(img, ((side - w) // 2, (side - h) // 2))
    return out


for job in JOBS:
    img = Image.open(job['src']).convert('RGBA')
    img = crop_content(img)
    img = make_square(img)
    img = img.resize((job['size'], job['size']), Image.NEAREST)
    os.makedirs(os.path.dirname(job['dst']), exist_ok=True)
    img.save(job['dst'])
    print(f"OK {job['dst']} ({job['size']}x{job['size']})")
