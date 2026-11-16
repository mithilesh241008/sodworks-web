import sys, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
src, outdir, preview = sys.argv[1:4]
a = np.asarray(Image.open(src).convert('RGB')).astype(float)
H, W = a.shape[:2]
L = a[...,0]*.2126 + a[...,1]*.7152 + a[...,2]*.0722
Ls = ndi.gaussian_filter(L, 6)
lum = np.clip(Ls / 70.0, 0, 1) ** 0.6          # lit forms → 1, black room → 0
rng = np.random.default_rng(7)
def noise(scale, seed):
    r = np.random.default_rng(seed).random((H//scale+2, W//scale+2))
    n = ndi.zoom(r, scale, order=3)[:H, :W]
    n = ndi.gaussian_filter(n, scale/2)
    return (n - n.mean()) / (n.std() + 1e-6)
def smooth(x, e0, e1):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t*t*(3-2*t)
def region(poly, blur, seed, lum_w=0.55):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    s = ndi.gaussian_filter(np.asarray(m).astype(float)/255, blur)
    env = np.clip(ndi.gaussian_filter(np.asarray(m).astype(float)/255, blur*2.5)*3, 0, 1)
    s = s + (0.16*noise(48, seed) + 0.06*noise(14, seed+1)) * env   # organic edge, only near the form
    s = smooth(s, 0.22, 0.78)
    return np.clip(s * ((1-lum_w) + lum_w*lum), 0, 1)
R = {
 'central': [(830,96),(985,108),(1005,300),(1015,420),(965,560),(955,725),(820,725),(780,560),(700,440),(676,330),(760,288),(818,236)],
 'laptop':  [(425,488),(705,495),(800,600),(865,690),(790,748),(515,748),(370,700),(372,600),(425,560)],
 'left':    [(495,205),(655,210),(705,330),(695,420),(765,470),(835,710),(290,710),(315,520),(395,415),(470,375),(472,280)],
 'right':   [(995,232),(1188,245),(1210,360),(1268,420),(1345,560),(1390,900),(925,900),(948,700),(898,600),(938,470),(978,420),(970,300)],
}
masks = {k: region(p, 26, i*11+3) for i,(k,p) in enumerate(R.items())}
# Environment: every lit object in the room, emerging from its own light.
env = smooth(lum + 0.12*noise(60, 99)*lum, 0.08, 0.7)
masks['room'] = env
cols = {'central':(255,60,60),'laptop':(60,160,255),'left':(60,255,120),'right':(255,200,40),'room':(200,90,255)}
pv = a*0.35
for k, m in masks.items():
    small = Image.fromarray((m*255).astype(np.uint8)).resize((800, 450), Image.LANCZOS)
    rgba = np.zeros((450, 800, 4), np.uint8); rgba[...,:3] = 255; rgba[...,3] = np.asarray(small)
    Image.fromarray(rgba).save(f'{outdir}/sodworks-hero-region-{k}.png', optimize=True)
    if k != 'room':
        pv = pv*(1-0.45*m[...,None]) + np.array(cols[k])*0.45*m[...,None]
Image.fromarray(np.clip(pv,0,255).astype(np.uint8)).resize((800,450)).save(preview)
env_pv = (a*masks['room'][...,None]); Image.fromarray(env_pv.astype(np.uint8)).resize((800,450)).save(preview.replace('.png','_room.png'))
print({k: round(float(m.mean()),3) for k,m in masks.items()})
