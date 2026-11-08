"""Horror CGs built from the game's own sprites and backgrounds (same hand as everything else), written to ../_comfy/orig_cg
for tools/horror_grade.py to corrupt. usage: python tools/make_horror_cg.py"""
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance, ImageChops
R = Path(__file__).resolve().parent.parent
OUT = R.parent / "_comfy" / "orig_cg"
W, H = 1920, 1072
def bg(name, dark=0.42, blur=3, red=0.35):
    im = Image.open(R / "assets" / "bg" / f"{name}.webp").convert("RGB").resize((W, H)).filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(ImageEnhance.Brightness(im).enhance(dark), dtype=np.float32) / 255
    a = a * (1 - red) + np.array([0.5, 0.03, 0.06], dtype=np.float32) * red * (0.4 + a.mean(2, keepdims=True))
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).convert("RGBA")
def spr(path):
    return Image.open(R / "assets" / "sprites" / f"{path}.webp").convert("RGBA")
def put(base, sp, scale, cx, top, bright=0.8, stretch=1.0, rot=0, silhouette=False, glow=(190, 20, 40)):
    s = sp.resize((int(sp.width * scale), int(sp.height * scale * stretch)), Image.LANCZOS)
    if silhouette:
        a = s.getchannel("A"); s = Image.merge("RGBA", (Image.new("L", s.size, 4), Image.new("L", s.size, 2), Image.new("L", s.size, 3), a))
    else:
        s = Image.merge("RGBA", (*[c.point(lambda v: int(v * bright)) for c in s.split()[:3]], s.getchannel("A")))
    if rot: s = s.rotate(rot, resample=Image.BICUBIC, expand=True)
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0)); layer.alpha_composite(s, (int(cx - s.width / 2), int(top)))
    g = Image.new("RGBA", base.size, glow + (0,)); g.putalpha(layer.getchannel("A").filter(ImageFilter.GaussianBlur(34)).point(lambda v: int(v * 0.7)))
    return Image.alpha_composite(Image.alpha_composite(base, g), layer)
def save(img, name): img.convert("RGB").save(OUT / f"{name}.webp", quality=95); print(name)
OUT.mkdir(parents=True, exist_ok=True)
# the girls, corrupted, in the game's own rooms
save(put(bg("classroom"), spr("hina/corrupt"), 1.25, 960, -40), "h_hina_blank")
save(put(bg("rooftop", dark=0.3), spr("rei/corrupt"), 1.25, 960, -40), "h_rei_flash")
save(put(bg("darkroom", dark=0.5), spr("sayo/corrupt"), 1.25, 960, -40), "h_sayo_scribble")
# staff
save(put(bg("infirmary", dark=0.35), spr("nurse/neutral"), 1.25, 960, -40, bright=0.7), "h_nurse_glitch")
# the thing behind you: K's silhouette, stretched, getting closer. The room in front is empty.
room = bg("classroom", dark=0.3, red=0.3)
k = spr("k/neutral")
save(room, "h_stalk_front")
save(put(room, k, 0.34, 1330, 540, stretch=1.4, silhouette=True, glow=(120, 10, 25)), "h_stalk_1")
save(put(room, k, 0.62, 1100, 330, stretch=1.4, silhouette=True), "h_stalk_2")
save(put(room, k, 1.15, 960, -140, stretch=1.35, silhouette=True, rot=-6), "h_stalk_3")
# the face: a corrupted sprite blown up until the screen is mostly eyes
face = spr("hina/corrupt").crop((220, 120, 880, 640)); face = face.resize((1980, 1560), Image.LANCZOS)
fb = Image.new("RGBA", (W, H), (8, 0, 2, 255)); fb.alpha_composite(face, (-30, -250))
save(fb, "h_stalk_face")
