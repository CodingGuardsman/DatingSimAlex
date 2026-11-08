"""Glitch + dark grade for the 'h_' horror CGs (DDLC-style corruption: sliced rows, displaced blocks, RGB tearing, dead bars).
usage: python tools/horror_grade.py <name> [...]   (reads ../_comfy/orig_cg/<name>.webp, writes assets/cg/<name>.webp)"""
import sys, numpy as np
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
ROOT = Path(__file__).resolve().parent.parent
def grade(src, dst, seed):
    rng = np.random.default_rng(seed)
    im = Image.open(src).convert("RGB").filter(ImageFilter.GaussianBlur(0.5))
    im = ImageEnhance.Color(im).enhance(0.6)
    a = np.asarray(im, dtype=np.float32) / 255
    H, W, _ = a.shape
    a = np.clip((a - 0.05) * 1.3, 0, 1) ** 1.25 * 0.95
    # sliced rows: bands of rows shoved sideways
    for _ in range(int(rng.integers(9, 16))):
        y = int(rng.integers(0, H - 20)); h = int(rng.integers(4, 46)); dx = int(rng.integers(-180, 180))
        a[y:y+h] = np.roll(a[y:y+h], dx, axis=1)
    # displaced blocks (datamosh): rectangles copied from elsewhere
    for _ in range(int(rng.integers(5, 10))):
        bw, bh = int(rng.integers(80, 420)), int(rng.integers(20, 120))
        x, y = int(rng.integers(0, W - bw)), int(rng.integers(0, H - bh))
        x2, y2 = int(np.clip(x + rng.integers(-300, 300), 0, W - bw)), int(np.clip(y + rng.integers(-120, 120), 0, H - bh))
        a[y:y+bh, x:x+bw] = a[y2:y2+bh, x2:x2+bw]
    # RGB channel tearing: each channel shifted per band
    for _ in range(int(rng.integers(6, 12))):
        y = int(rng.integers(0, H - 30)); h = int(rng.integers(6, 60)); c = int(rng.integers(0, 3))
        a[y:y+h, :, c] = np.roll(a[y:y+h, :, c], int(rng.integers(-40, 40)), axis=1)
    a = np.stack([np.roll(a[:, :, 0], 5, 1), a[:, :, 1], np.roll(a[:, :, 2], -5, 1)], 2)
    # dead bars: thin inverted / blown-out strips and a few static blocks
    for _ in range(int(rng.integers(2, 5))):
        y = int(rng.integers(0, H - 8)); h = int(rng.integers(2, 9)); a[y:y+h] = 1 - a[y:y+h]
    for _ in range(int(rng.integers(6, 14))):
        bw, bh = int(rng.integers(12, 90)), int(rng.integers(6, 30)); x, y = int(rng.integers(0, W - bw)), int(rng.integers(0, H - bh))
        a[y:y+bh, x:x+bw] = rng.random((bh, bw, 1)) * np.array([1.0, 0.25, 0.3]) if rng.random() < .5 else rng.random((bh, bw, 1))
    a = a * (1 - 0.08 * ((np.arange(H) % 3) == 0)[:, None, None])
    yy, xx = np.mgrid[0:H, 0:W]; d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    a = a * np.clip(1.1 - 0.5 * d ** 1.6, 0.2, 1)[:, :, None]
    a[:, :, 0] = np.clip(a[:, :, 0] * 1.06, 0, 1)
    a = np.clip(a + rng.normal(0, 0.05, (H, W, 1)), 0, 1)
    Image.fromarray((a * 255).astype(np.uint8)).save(dst, quality=90)
if __name__ == "__main__":
    for i, n in enumerate(sys.argv[1:]):
        grade(ROOT.parent / "_comfy" / "orig_cg" / f"{n}.webp", ROOT / "assets" / "cg" / f"{n}.webp", 100 + i)
