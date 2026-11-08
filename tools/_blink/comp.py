import sys
from PIL import Image, ImageDraw, ImageFilter
name, box = sys.argv[1], tuple(map(int,sys.argv[2:6]))
orig=Image.open(f'../../assets/sprites/{name}/neutral.webp').convert('RGBA')
al=Image.open(f'{name}_aligned.png').convert('RGBA')
m=Image.new('L',orig.size,0); ImageDraw.Draw(m).rounded_rectangle(box,radius=25,fill=255)
m=m.filter(ImageFilter.GaussianBlur(14))
out=Image.composite(al,orig,m); out.putalpha(orig.getchannel('A'))
out.save(f'../../assets/sprites/{name}/blink.webp',quality=92)
out.crop((box[0]-150,box[1]-150,box[2]+150,box[3]+150)).save(f'{name}_crop.png')
