import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, out, preview = sys.argv[1:4]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(float)
L = a[...,0]*0.2126 + a[...,1]*0.7152 + a[...,2]*0.0722
H, W = L.shape
roi = np.zeros_like(L, bool); roi[30:300, 740:1080] = True
Ls = ndi.gaussian_filter(L, 1.5)
m = (Ls > 2.0) & roi
m = ndi.binary_opening(m, iterations=1)
m = ndi.binary_closing(m, structure=np.ones((3,3)), iterations=2)
m = ndi.binary_fill_holes(m)
lab, n = ndi.label(m)
seeds = {lab[y, x] for (x, y) in [(908,115),(905,140),(900,170),(890,220),(880,260)] if lab[y, x]}
print("seeds", seeds)
keep = np.isin(lab, list(seeds))
print('component px', keep.sum(), 'n', n)
# restrict to head + shoulders band; below y=280 nothing can be overlapped by the title
keep[300:] = False
keep = ndi.binary_fill_holes(keep)
keep = ndi.binary_erosion(keep, iterations=1)
alpha = Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
al = np.asarray(alpha).astype(float)
# fade the cut-off at the bottom so the band edge never reads as a line
fade = np.clip((300 - np.arange(H)) / 40.0, 0, 1)[:, None]
al = (al * fade).clip(0,255).astype(np.uint8)
ys, xs = np.nonzero(al > 0); print('bbox', xs.min(), xs.max(), ys.min(), ys.max())
rgba = np.zeros((H, W, 4), np.uint8); rgba[...,0:3] = 255; rgba[...,3] = al
Image.fromarray(rgba).save(out, optimize=True)
# preview: painting with red tint where mask is
p = a.copy(); k = al[...,None]/255.0
p = p*(1-0.6*k) + np.array([255,40,40])*0.6*k
Image.fromarray(p.astype(np.uint8)).crop((700,20,1120,320)).resize((840,600)).save(preview)
