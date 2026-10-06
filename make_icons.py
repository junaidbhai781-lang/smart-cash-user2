# GitHub build ke time logo.png se Android icons + splash banata hai
import os, sys
from PIL import Image, ImageDraw

logo, res = sys.argv[1], sys.argv[2]
src = Image.open(logo).convert('RGBA')
BG = '#081E5A'

def rounded(img, radius_frac):
    s = img.size[0]
    m = Image.new('L', (s * 4, s * 4), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, s * 4 - 1, s * 4 - 1), radius=int(s * 4 * radius_frac), fill=255)
    return m.resize((s, s), Image.LANCZOS)

for d, s in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    o = f'{res}/mipmap-{d}'
    os.makedirs(o, exist_ok=True)
    r = src.resize((s, s), Image.LANCZOS)
    r.save(f'{o}/ic_launcher.png')
    out = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    out.paste(r, (0, 0), rounded(r, 0.5))
    out.save(f'{o}/ic_launcher_round.png')
    c = int(s * 108 / 48)
    l = int(c * 0.62)
    lg = src.resize((l, l), Image.LANCZOS)
    fg = Image.new('RGBA', (c, c), (0, 0, 0, 0))
    fg.paste(lg, ((c - l) // 2, (c - l) // 2), rounded(lg, 0.2))
    fg.save(f'{o}/ic_launcher_foreground.png')

# adaptive icon (Android 8+)
os.makedirs(f'{res}/mipmap-anydpi-v26', exist_ok=True)
xml = ('<?xml version="1.0" encoding="utf-8"?>\n'
       '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
       '    <background android:drawable="@color/ic_launcher_background"/>\n'
       '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
       '</adaptive-icon>\n')
for n in ('ic_launcher', 'ic_launcher_round'):
    open(f'{res}/mipmap-anydpi-v26/{n}.xml', 'w').write(xml)
os.makedirs(f'{res}/values', exist_ok=True)
open(f'{res}/values/ic_launcher_background.xml', 'w').write(
    f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{BG}</color>\n</resources>\n')

# splash screen
for root, _, files in os.walk(res):
    if 'splash.png' in files:
        w, h = (1920, 1080) if 'land' in root else (1080, 1920)
        bg = Image.new('RGB', (w, h), (8, 30, 90))
        L = int(min(w, h) * 0.55)
        lg = src.resize((L, L), Image.LANCZOS)
        bg.paste(lg, ((w - L) // 2, (h - L) // 2), lg)
        bg.save(os.path.join(root, 'splash.png'))
print('Logo icons + splash ready')
