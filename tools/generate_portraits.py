from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'assets/images/portraits'
OUT.mkdir(parents=True, exist_ok=True)

CHARS = {
    'alex': {'color': (74, 144, 217, 255), 'hair': (50, 50, 55, 255), 'eyes': (30, 60, 120, 255)},
    'maya': {'color': (123, 74, 234, 255), 'hair': (20, 20, 30, 255), 'eyes': (40, 30, 80, 255)},
    'chloe': {'color': (233, 69, 96, 255), 'hair': (200, 160, 60, 255), 'eyes': (30, 30, 40, 255)},
    'hana': {'color': (82, 180, 169, 255), 'hair': (60, 40, 30, 255), 'eyes': (20, 80, 70, 255)},
}

EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'worried', 'determined']

def draw_face(draw, cx, cy, r, char, expr):
    skin = (240, 200, 170, 255)
    hair = char['hair']
    eyes = char['eyes']
    draw.ellipse([cx-r, cy-r-r*0.15, cx+r, cy+r+r*0.1], fill=hair)
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=skin)
    if expr == 'happy' or expr == 'determined':
        draw.arc([cx-r*0.6, cy-r*0.2, cx-r*0.2, cy+r*0.1], 0, 360, fill=eyes, width=3)
        draw.arc([cx+r*0.2, cy-r*0.2, cx+r*0.6, cy+r*0.1], 0, 360, fill=eyes, width=3)
    elif expr == 'sad' or expr == 'worried':
        draw.arc([cx-r*0.6, cy-r*0.1, cx-r*0.2, cy+r*0.15], 200, 340, fill=eyes, width=3)
        draw.arc([cx+r*0.2, cy-r*0.1, cx+r*0.6, cy+r*0.15], 20, 160, fill=eyes, width=3)
    elif expr == 'angry':
        draw.line([cx-r*0.6, cy-r*0.1, cx-r*0.2, cy+r*0.05], fill=eyes, width=3)
        draw.line([cx+r*0.2, cy-r*0.1, cx+r*0.6, cy+r*0.05], fill=eyes, width=3)
    else:
        draw.ellipse([cx-r*0.4, cy-r*0.1, cx-r*0.2, cy+0.05], fill=eyes)
        draw.ellipse([cx+r*0.2, cy-r*0.1, cx+r*0.4, cy+0.05], fill=eyes)
    if expr == 'happy':
        draw.arc([cx-r*0.3, cy+r*0.1, cx+r*0.3, cy+r*0.5], 0, 180, fill=(80, 50, 50, 255), width=3)
    elif expr == 'sad':
        draw.arc([cx-r*0.3, cy+r*0.2, cx+r*0.3, cy+r*0.5], 180, 360, fill=(80, 50, 50, 255), width=3)
    elif expr == 'angry':
        draw.line([cx-r*0.3, cy+r*0.3, cx+r*0.3, cy+r*0.3], fill=(80, 50, 50, 255), width=3)
    elif expr == 'worried':
        draw.arc([cx-r*0.35, cy+r*0.15, cx+r*0.35, cy+r*0.45], 190, 350, fill=(80, 50, 50, 255), width=2)
    else:
        draw.line([cx-r*0.2, cy+r*0.3, cx+r*0.2, cy+r*0.3], fill=(80, 50, 50, 255), width=2)

for name, char in CHARS.items():
    for expr in EXPRESSIONS:
        W, H = 512, 512
        img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        cx, cy = W//2, H//2 + 40
        r = 180
        draw_face(draw, cx, cy, r, char, expr)
        draw.ellipse([cx-r*0.8, cy+r*0.3, cx+r*0.8, cy+r*1.8], fill=char['color'])
        out = OUT / f'{name}_{expr}.png'
        img.save(str(out))
        print(f'Generated: {out}')

print('Done! All portraits have transparent backgrounds.')
