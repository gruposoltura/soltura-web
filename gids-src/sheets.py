import pymupdf, sys
from PIL import Image
pdf, prefix = sys.argv[1], sys.argv[2]
d = pymupdf.open(pdf)
ims = []
for p in d:
    pix = p.get_pixmap(dpi=60); ims.append(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))
w, h = ims[0].size; per = 8
for s in range(0, len(ims), per):
    sheet = Image.new('RGB', (w*4+30, h*2+10), 'white')
    for i, im in enumerate(ims[s:s+per]):
        sheet.paste(im, ((i%4)*(w+10), (i//4)*(h+10)))
    sheet.save(f'{prefix}{s//per+1}.png')
print(len(ims))
