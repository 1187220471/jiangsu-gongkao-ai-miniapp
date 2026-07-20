#!/usr/bin/env python3
"""Remove solid background from hamster image and output transparent 120x120."""
from PIL import Image
import os

BASE = '/Users/yier/Documents/daijinli网页版/daijinli-miniapp'
SRC = f'{BASE}/assets-concepts/collection-samples/A_cute_hamster__chibi_pixel_ar_2026-07-20T08-16-46.png'
DST = f'{BASE}/src/assets/collection/pet-hamster-120.png'
SIZE = 120

def remove_bg(img: Image.Image, tolerance: int = 30) -> Image.Image:
    """Make pixels close to any corner background color transparent."""
    img = img.convert('RGBA')
    w, h = img.size
    pixels = img.load()

    # Sample background from four corners (avoiding very edge pixels)
    corners = [(8, 8), (w - 9, 8), (8, h - 9), (w - 9, h - 9)]
    bg_colors = [pixels[x, y][:3] for x, y in corners]

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            is_bg = all(
                abs(r - br) <= tolerance and
                abs(g - bg) <= tolerance and
                abs(b - bb) <= tolerance
                for br, bg, bb in bg_colors
            )
            if is_bg:
                pixels[x, y] = (r, g, b, 0)
    return img


def crop_content(img: Image.Image, padding: int = 8) -> Image.Image:
    """Crop to non-transparent bounding box."""
    alpha = img.getchannel('A')
    bbox = alpha.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))


def make_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = max(w, h)
    out = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    out.paste(img, ((side - w) // 2, (side - h) // 2), img)
    return out


img = Image.open(SRC)
img = remove_bg(img, tolerance=30)
img = crop_content(img, padding=8)
img = make_square(img)
img = img.resize((SIZE, SIZE), Image.NEAREST)
os.makedirs(os.path.dirname(DST), exist_ok=True)
img.save(DST)
print(f"OK {DST} ({SIZE}x{SIZE})")
