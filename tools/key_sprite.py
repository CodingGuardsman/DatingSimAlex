"""
key_sprite.py — Turn a generated image into a game asset.

  python tools/key_sprite.py sprite in.png assets/sprites/hina/close.webp
      Removes the flat green (#00FF00) background, cleans the green fringe,
      and fits the result into the same 1100x1500 transparent canvas as the other sprites
      (feet / bottom edge on the bottom of the canvas).

  python tools/key_sprite.py cg in.png assets/cg/beach.webp
      Resizes an illustration to 1920 wide and saves it as webp.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 1100, 1500


def key(img):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # How much greener than the other channels a pixel is.
    spill = g - np.maximum(r, b)
    alpha = np.clip(1.0 - (spill - 40) / 80, 0, 1)
    # Despill: pull green down to the brighter of red/blue on edge pixels.
    mx = np.maximum(r, b)
    g2 = np.where(spill > 0, np.minimum(g, mx + 8), g)
    out = np.dstack([r, g2, b, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    # Tighten the alpha edge a touch so no green halo is left.
    al = im.getchannel("A").filter(ImageFilter.MinFilter(3))
    im.putalpha(al)
    return im


def sprite(src, dst):
    im = key(Image.open(src))
    box = im.getbbox()
    im = im.crop(box)
    s = min(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(im, ((W - im.width) // 2, H - im.height), im)
    canvas.save(dst, "WEBP", quality=88, method=6)


def cg(src, dst):
    im = Image.open(src).convert("RGB")
    s = 1920 / im.width
    im = im.resize((1920, round(im.height * s)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=86, method=6)


if __name__ == "__main__":
    kind, src, dst = sys.argv[1:4]
    {"sprite": sprite, "cg": cg}[kind](src, dst)
    print("wrote", dst)
