import sys, numpy as np
from PIL import Image, ImageFilter
name, raw = sys.argv[1], sys.argv[2]
orig = Image.open(f'../../assets/sprites/{name}/neutral.webp').convert('RGBA')
gen = Image.open(raw).convert('RGB')
W,H = orig.size
base = np.asarray(orig.convert('L'),dtype=np.float32)
alpha = np.asarray(orig)[:,:,3]>128
best=None
for hh in range(1500,1620,10):            # candidate generated-height in px
    s = hh/gen.size[1]; w=round(gen.size[0]*s)
    g = np.asarray(gen.resize((w,hh)).convert('L'),dtype=np.float32)
    for dx in range(-(w-W)//2-60, -(w-W)//2+61, 6):
        for dy in range(-60, 61, 6):
            # window of g aligned to base: base[y,x] = g[y+dy, x+dx-... ]
            ys=slice(max(0,-dy),min(H,hh-dy)); xs=slice(max(0,-dx),min(W,w-dx))
            b=base[ys,xs]; gg=g[ys.start+dy:ys.stop+dy, xs.start+dx:xs.stop+dx]
            m=alpha[ys,xs][:600:3,:] if False else alpha[ys,xs]
            # head region only (top 40%)
            hb=b[:int(H*.4)][::4,::4]; hg=gg[:int(H*.4)][::4,::4]; hm=m[:int(H*.4)][::4,::4]
            e=np.abs(hb-hg)[hm].mean() if hm.any() else 1e9
            if best is None or e<best[0]: best=(e,hh,dx,dy,w)
print(best)
e,hh,dx,dy,w=best
g=gen.resize((w,hh))
canvas=Image.new('RGB',(W,H),(255,255,255)); canvas.paste(g,(-dx,-dy)); canvas.save(f'{name}_aligned.png')
