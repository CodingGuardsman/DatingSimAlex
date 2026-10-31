"""Deceptively cute itch.io cover (630x500) and banner (960x300).
Bright beach, three smiling girls... except Sayo isn't smiling, and someone is
standing at the end of the pier.
usage: python -I cute_cover.py <project_dir>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

proj = sys.argv[1]
A = os.path.join(proj, "assets")
OUT = os.path.join(proj, "itch")
F = "C:/Windows/Fonts"

PINK = (255, 120, 170)
DEEP = (226, 72, 128)
WHITE = (255, 255, 255)


def font(name, size):
    return ImageFont.truetype(os.path.join(F, name), size)


def sprite(path, h):
    im = Image.open(os.path.join(A, "sprites", path + ".webp")).convert("RGBA")
    return im.resize((int(im.width * h / im.height), h), Image.LANCZOS)


def fit_bg(W, H, focus_y=0.5):
    bg = Image.open(os.path.join(A, "bg", "beach.webp")).convert("RGB")
    s = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * s), int(bg.height * s)), Image.LANCZOS)
    x = (bg.width - W) // 2
    y = int((bg.height - H) * focus_y)
    bg = bg.crop((x, y, x + W, y + H))
    bg = ImageEnhance.Color(bg).enhance(1.08)
    bg = ImageEnhance.Brightness(bg).enhance(1.06)
    # Soft pastel pink wash so it reads "romance" first.
    wash = Image.new("RGB", (W, H), (255, 214, 232))
    return Image.blend(bg, wash, 0.16).convert("RGBA"), s, x, y


def figure(h):
    """A small featureless silhouette: someone who shouldn't be there."""
    im = sprite("rei/neutral", h)
    a = im.split()[3]
    sil = Image.new("RGBA", im.size, (40, 44, 58, 0))
    sil.putalpha(a.point(lambda v: int(v * 0.8)))
    return sil.filter(ImageFilter.GaussianBlur(0.6))


def outlined(d, xy, text, f, fill, stroke, sw):
    d.text(xy, text, font=f, fill=fill, stroke_width=sw, stroke_fill=stroke)


def heart(d, cx, cy, r, fill):
    d.ellipse((cx - r, cy - r, cx, cy), fill=fill)
    d.ellipse((cx, cy - r, cx + r, cy), fill=fill)
    d.polygon([(cx - r + 1, cy - r // 2 + 2), (cx + r - 1, cy - r // 2 + 2), (cx, cy + r)], fill=fill)


def sparkles(d, W, H, pts):
    for (px, py, r) in pts:
        x, y = W * px, H * py
        d.polygon([(x, y - r), (x + r * 0.28, y - r * 0.28), (x + r, y), (x + r * 0.28, y + r * 0.28),
                   (x, y + r), (x - r * 0.28, y + r * 0.28), (x - r, y), (x - r * 0.28, y - r * 0.28)],
                  fill=(255, 255, 255, 230))


def girls(bg, W, H, h, xs, top):
    rei = sprite("rei/laugh", int(h * 0.94))
    sayo = sprite("sayo/blank", int(h * 0.94))   # the only one not smiling
    hina = sprite("hina/happy", h)
    for im, cx in ((rei, xs[0]), (sayo, xs[2])):
        bg.alpha_composite(im, (int(W * cx - im.width / 2), int(top + h * 0.07)))
    bg.alpha_composite(hina, (int(W * xs[1] - hina.width / 2), int(top)))


def title_block(bg, W, cx, ty, size, tag_size, tag):
    d = ImageDraw.Draw(bg)
    f = font("Candarab.ttf", size)
    t = "After Class"
    tw = d.textlength(t, font=f)
    x = cx - tw / 2
    # Soft drop shadow, white outline, pink fill.
    sh = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x + 3, ty + 5), t, font=f, fill=(200, 60, 120, 120), stroke_width=size // 9,
                            stroke_fill=(200, 60, 120, 120))
    bg.alpha_composite(sh.filter(ImageFilter.GaussianBlur(4)))
    outlined(d, (x, ty), t, f, PINK, WHITE, max(4, size // 10))
    heart(d, int(x + tw + size * 0.28), int(ty + size * 0.42), int(size * 0.2), DEEP)
    f2 = font("Inkfree.ttf", tag_size)
    tw2 = d.textlength(tag, font=f2)
    tx = cx - (tw2 + tag_size) / 2
    outlined(d, (tx, ty + size * 1.12), tag, f2, DEEP, WHITE, 3)
    hy = int(ty + size * 1.12 + tag_size * 0.62)
    hx = int(tx + tw2 + tag_size * 0.95)
    heart(d, hx, hy, int(tag_size * 0.42) + 3, WHITE)
    heart(d, hx, hy, int(tag_size * 0.42), DEEP)


def cover():
    W, H = 630, 500
    bg, s, ox, oy = fit_bg(W, H, 0.35)
    # Someone at the end of the pier (pier end is around 13%, 63% of the source).
    fig = figure(44)
    bg.alpha_composite(fig, (4, 318 - 44))
    girls(bg, W, H, int(H * 1.0), (0.19, 0.5, 0.81), int(H * 0.17))
    d = ImageDraw.Draw(bg, "RGBA")
    # Pink fade at the bottom for the title.
    fade = Image.new("L", (1, H))
    for y in range(H):
        fade.putpixel((0, y), int(max(0, (y - H * 0.6) / (H * 0.4)) ** 1.6 * 200))
    pink = Image.new("RGBA", (W, H), (255, 228, 240, 255))
    pink.putalpha(fade.resize((W, H)))
    bg.alpha_composite(pink)
    sparkles(ImageDraw.Draw(bg), W, H, [(0.08, 0.1, 9), (0.92, 0.08, 7), (0.85, 0.3, 5), (0.12, 0.34, 5)])
    title_block(bg, W, W / 2, H - 132, 76, 26, "five days until summer")
    return bg.convert("RGB")


def banner():
    W, H = 960, 300
    bg, s, ox, oy = fit_bg(W, H, 0.42)
    fig = figure(48)
    bg.alpha_composite(fig, (222 - fig.width // 2, 272 - 48))
    girls(bg, W, H, int(H * 1.25), (0.6, 0.73, 0.88), int(H * 0.12))
    # Pink fade on the left for the title.
    fade = Image.new("L", (W, 1))
    for x in range(W):
        fade.putpixel((x, 0), int(max(0, 1 - x / (W * 0.55)) ** 1.3 * 190))
    pink = Image.new("RGBA", (W, H), (255, 228, 240, 255))
    pink.putalpha(fade.resize((W, H)))
    bg.alpha_composite(pink)
    sparkles(ImageDraw.Draw(bg), W, H, [(0.05, 0.15, 9), (0.42, 0.12, 7), (0.38, 0.8, 5)])
    title_block(bg, W, W * 0.25, H * 0.26, 84, 28, "five days until summer")
    return bg.convert("RGB")


cover().save(os.path.join(OUT, "cover-630x500.png"))
banner().save(os.path.join(OUT, "banner-960x300.png"))
print("ok")
