"""Stagworks channel art: an 800x800 icon (a heart with little antlers) and a
2560x1440 banner with After Class art, text kept inside YouTube's 1546x423 safe area.
usage: python itch/make_channel_art.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(os.path.dirname(HERE), "assets")
OUT = os.path.join(HERE, "channel")
os.makedirs(OUT, exist_ok=True)
F = "C:/Windows/Fonts"
PINK, DEEP, WHITE, INK = (255, 126, 176), (226, 72, 128), (255, 255, 255), (91, 61, 76)


def font(name, size):
    return ImageFont.truetype(os.path.join(F, name), size)


def heart_poly(cx, cy, r, steps=200):
    import math
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * r / 16, cy - y * r / 16))
    return pts


def antler(d, x0, y0, s, flip, color, w):
    """A little cartoon antler: one curved beam with two tines."""
    k = -1 if flip else 1
    beam = [(x0, y0), (x0 + k * 0.18 * s, y0 - 0.45 * s), (x0 + k * 0.42 * s, y0 - 0.85 * s)]
    d.line(beam, fill=color, width=w, joint="curve")
    d.line([(x0 + k * 0.12 * s, y0 - 0.32 * s), (x0 + k * 0.45 * s, y0 - 0.42 * s)], fill=color, width=w)
    d.line([(x0 + k * 0.28 * s, y0 - 0.66 * s), (x0 + k * 0.62 * s, y0 - 0.72 * s)], fill=color, width=w)
    for (x, y) in [beam[-1], (x0 + k * 0.45 * s, y0 - 0.42 * s), (x0 + k * 0.62 * s, y0 - 0.72 * s)]:
        d.ellipse((x - w / 2, y - w / 2, x + w / 2, y + w / 2), fill=color)


def icon():
    S = 800
    im = Image.new("RGBA", (S, S), (255, 232, 241, 255))
    d = ImageDraw.Draw(im)
    # soft polka dots
    for y in range(0, S, 56):
        for x in range((y // 56) % 2 * 28, S, 56):
            d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(255, 255, 255, 200))
    cx, cy, r = S / 2, S * 0.6, 185
    antler(d, cx - 75, cy - 120, 200, True, (183, 120, 92), 22)
    antler(d, cx + 75, cy - 120, 200, False, (183, 120, 92), 22)
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).polygon(heart_poly(cx, cy + 16, r), fill=(226, 72, 128, 110))
    im.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(10)))
    d.polygon(heart_poly(cx, cy, r + 14), fill=WHITE)
    d.polygon(heart_poly(cx, cy, r), fill=PINK)
    d.ellipse((cx - 100, cy - 100, cx - 52, cy - 60), fill=(255, 255, 255, 170))
    im.convert("RGB").save(os.path.join(OUT, "icon-800.png"))


def banner():
    W, H = 2560, 1440
    bg = Image.open(os.path.join(A, "bg", "beach.webp")).convert("RGB")
    s = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * s) + 1, int(bg.height * s) + 1), Image.LANCZOS)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
    im = Image.blend(bg, Image.new("RGB", (W, H), (255, 214, 232)), 0.25).convert("RGBA")
    # the girls stand on either side of the safe area, so they show on wide screens
    for path, x, h in (("rei/laugh", 0.13, 1250), ("hina/happy", 0.84, 1300), ("sayo/happy", 0.96, 1180)):
        sp = Image.open(os.path.join(A, "sprites", path + ".webp")).convert("RGBA")
        sp = sp.resize((int(sp.width * h / sp.height), h), Image.LANCZOS)
        im.alpha_composite(sp, (int(W * x - sp.width / 2), H - h + 120))
    # a pastel band behind the safe area
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(band).rounded_rectangle((W / 2 - 800, H / 2 - 230, W / 2 + 800, H / 2 + 230), 60, fill=(255, 250, 246, 225))
    im.alpha_composite(band)
    d = ImageDraw.Draw(im)
    def center(y, text, f, fill, stroke=0, sfill=None):
        w = d.textlength(text, font=f)
        d.text(((W - w) / 2, y), text, font=f, fill=fill, stroke_width=stroke, stroke_fill=sfill)
        return (W - w) / 2, w
    x, w = center(H / 2 - 190, "Stagworks", font("Candarab.ttf", 190), PINK, 12, WHITE)
    tx, tw = center(H / 2 + 20, "little games with big feelings", font("Inkfree.ttf", 64), DEEP)
    d.polygon(heart_poly(tx + tw + 60, H / 2 + 60, 28), fill=DEEP)
    center(H / 2 + 120, "After Class · out now on itch.io", font("Candarab.ttf", 58), INK)
    im.convert("RGB").save(os.path.join(OUT, "banner-2560x1440.png"), optimize=True)


icon()
banner()
print("ok")
