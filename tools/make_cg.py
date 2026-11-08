"""Builds CGs from the game's own sprites + backgrounds, so the girls are always exactly themselves.
usage: python tools/make_cg.py   (writes assets/cg/cute_<girl>.webp; horror ones are made by tools/make_horror_cg.py)"""
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
R = Path(__file__).resolve().parent.parent
W, H = 1920, 1072
def sprite(girl, expr):
    return Image.open(R / "assets" / "sprites" / girl / f"{expr}.webp").convert("RGBA")
def place(base, sp, scale, cx, top):
    s = sp.resize((int(sp.width * scale), int(sp.height * scale)), Image.LANCZOS)
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0)); layer.alpha_composite(s, (int(cx - s.width / 2), int(top)))
    return layer
def warm_bg(name, blur=7, tint=(255, 168, 110), mix=0.28):
    bg = Image.open(R / "assets" / "bg" / f"{name}.webp").convert("RGB").resize((W, H)).filter(ImageFilter.GaussianBlur(blur))
    bg = ImageEnhance.Brightness(bg).enhance(1.05)
    return Image.blend(bg, Image.new("RGB", (W, H), tint), mix)
def cute(girl, expr, bg, cx, scale=1.55, top=-60, tint=(255, 168, 110)):
    base = warm_bg(bg, tint=tint).convert("RGBA")
    layer = place(base, sprite(girl, expr), scale, cx, top)
    a = layer.getchannel("A")
    # warm rim light: a soft glow built from the sprite's own silhouette, then the sprite on top
    glow = Image.new("RGBA", base.size, tint + (0,)); glow.putalpha(a.filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.55)))
    base = Image.alpha_composite(base, glow); base = Image.alpha_composite(base, layer)
    out = base.convert("RGB")
    arr = np.asarray(out, dtype=np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W]; d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    arr = arr * np.clip(1.06 - 0.28 * d ** 1.8, 0.55, 1)[:, :, None]
    Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).save(R / "assets" / "cg" / f"cute_{girl}.webp", quality=92)
if __name__ == "__main__":
    cute("hina", "lean_blush", "rooftop", 1180)
    cute("rei", "lean", "rooftop", 760, tint=(255, 140, 120))
    cute("sayo", "twirl", "rooftop", 1180, tint=(255, 150, 160))
