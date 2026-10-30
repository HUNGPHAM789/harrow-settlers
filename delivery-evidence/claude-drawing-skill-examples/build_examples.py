"""Original code-drawn demos for cloveric/claude-drawing-skill.
Uses that repository's LineArt, Morph and Soft3D implementations directly.
"""
from pathlib import Path
import sys, math, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SKILL = Path('/tmp/claude-drawing-skill')
sys.path.insert(0, str(SKILL / 'lib'))
from lineart import LineArt, AMBER, GOLD, GOLD_HI, GOLD_LO, hexc as line_hexc
from morph import Morph, INK
from soft3d import Soft3D
from core import blur

OUT = Path(__file__).resolve().parent
STAGES = OUT / 'stages'
STAGES.mkdir(exist_ok=True)


def save_rgba(rgb, alpha, path):
    rgb = np.asarray(rgb, np.float32)
    alpha = np.clip(np.asarray(alpha, np.float32), 0, 1)
    if rgb.max(initial=0) > 1.5: rgb = rgb / 255.0
    if rgb.ndim == 1: rgb = np.broadcast_to(rgb, (*alpha.shape, 3))
    rgba = np.dstack([np.clip(rgb, 0, 1), alpha])
    Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA').save(path)


def build_lineart():
    W, H = 1920, 1080
    shutil.rmtree(STAGES / 'lineart', ignore_errors=True)
    la = LineArt(W, H, seed=24)
    la.backdrop('night')
    la.stage('01_velvet_night_ground')
    S, P = LineArt.smooth, LineArt.poly

    # One unbroken path: sidewalk -> bakery facade -> display window -> bread -> steam -> sidewalk.
    scallop = []
    for i in range(7):
        x = 820 + i * 90
        scallop.extend([(x, 506), (x + 23, 519), (x + 45, 521), (x + 67, 518), (x + 90, 506)])
    parts = [
        ('approach', S([(205, 736), (290, 735), (380, 733), (470, 730)])),
        # Pitched roof, shop front, and a small scalloped canopy are all traversed by the same pen.
        ('facade', P([(470, 730), (470, 430), (520, 430), (520, 398), (610, 355),
                      (1300, 355), (1390, 398), (1390, 430), (1450, 430), (1450, 475),
                      (820, 475), (820, 490), *scallop[1:], (1450, 519), (1450, 730)], r=7)),
        ('display_window', P([(1450, 730), (1450, 535), (1390, 535), (1390, 690),
                              (880, 690), (880, 535), (1390, 535)], r=7)),
        ('counter', S([(1390, 535), (1390, 642), (1260, 642), (1140, 642), (1010, 642), (895, 642)])),
        # Closed baguette silhouette with three scoring slashes, then a loose S-shaped steam trail.
        ('loaf', S([(900, 626), (915, 595), (948, 570), (1000, 558), (1060, 557),
                    (1125, 565), (1182, 584), (1223, 608), (1250, 631), (1241, 647),
                    (1195, 655), (1125, 659), (1050, 658), (980, 653), (928, 644), (900, 626)])),
        ('scores', P([(900, 626), (952, 604), (972, 582), (990, 604), (1044, 573),
                      (1063, 599), (1121, 577), (1142, 604), (1190, 589), (1220, 610)], r=3)),
        ('steam', S([(1220, 610), (1242, 592), (1236, 572), (1253, 550), (1270, 526),
                     (1259, 503), (1277, 480), (1293, 457)])),
    ]
    path, marks = la.chain(parts)
    la.line(path, width=3.5, pressure=[(marks['facade'], marks['display_window'], 0.92),
                                      (marks['loaf'], marks['steam'], 0.72)])
    for name in ('approach', 'facade', 'display_window', 'counter', 'loaf', 'scores', 'steam'):
        la.draw_to(marks[name])
        la.stage('02_path_' + name)

    # One combined amber accent, divided by dark muntins; the foreground path remains metallic gold.
    glass = la.rect(886, 542, 1384, 684, r=5)
    vm = la.rect(1129, 540, 1137, 686)
    hm = la.rect(884, 607, 1386, 615)
    panes = glass * (1 - vm) * (1 - hm)
    la.accent(panes, AMBER, glow=0.85, inner=0.18, warm=0.42)
    la.stage('03_single_window_accent')

    # Small shop mark and a quiet editorial caption, kept separate from the one continuous drawing.
    la.text('HARROW  /  BAKERY', 960, 860, 30, GOLD, 'display', spacing=8)
    la.text('OPEN BEFORE DAWN  ·  THE LAST LOAF IS STILL WARM', 960, 907, 15, '#c5b99f', 'display', spacing=3)
    la.hairline(397, 896, 480, 896, colour='#8d7f63')
    la.hairline(1440, 896, 1523, 896, colour='#8d7f63')
    la.stage('04_caption')
    la.save(str(OUT / 'lineart_midnight_bakery.png'), str(STAGES / 'lineart'))

    # Export the actual compositing pieces from the library's own stroke/time-map buffers.
    Image.fromarray((np.clip(la.bg, 0, 1) * 255 + .5).astype(np.uint8), 'RGB').save(OUT / 'lineart_layer_00_night_ground.png')
    sl, cov, bright, hot = la._stroke_layer(la.strokes[0])
    ysl, xsl = sl
    lo, mid, hi = line_hexc(GOLD_LO), line_hexc(GOLD), line_hexc(GOLD_HI)
    b = bright[..., None]
    col = np.where(b < .5, lo + (mid - lo) * (b * 2), mid + (hi - mid) * (b * 2 - 1))
    pa = np.zeros((H, W, 3), np.float32); aa = np.zeros((H, W), np.float32)
    pa[ysl, xsl] = col; aa[ysl, xsl] = cov
    save_rgba(pa, aa, OUT / 'lineart_layer_01_single_path.png')
    glow0 = cov * (.55 + .45 * bright) * la.strokes[0]['glow']
    glow = blur(glow0, 1.6) * .4 + blur(glow0, 6) * .22 + blur(glow0, 20) * .09
    glow_full = np.zeros((H, W), np.float32); glow_full[ysl, xsl] = glow
    save_rgba(line_hexc(GOLD), glow_full, OUT / 'lineart_layer_02_line_glow.png')
    save_rgba(la.acc_c, la.acc_a, OUT / 'lineart_layer_03_amber_window.png')
    save_rgba(la.txt_c, la.txt_a, OUT / 'lineart_layer_04_typography.png')
    print('LINEART saved; strokes=', len(la.strokes), flush=True)


def custom_shapes(cx, cy, size):
    t = np.linspace(0, 2 * np.pi, 321, endpoint=False)
    # Slightly lopsided raw dough; a flattened, domed oven loaf with a broad base.
    wobble = 1 + .045 * np.sin(3*t + .35) + .025 * np.sin(7*t - .6)
    dough = np.column_stack([.72 * np.cos(t) * wobble, .70 * np.sin(t) * wobble])
    loaf = np.column_stack([1.12 * np.sign(np.cos(t)) * np.abs(np.cos(t)) ** .72,
                            .55 * np.sign(np.sin(t)) * np.abs(np.sin(t)) ** .43 + .045 * np.cos(t) ** 4])
    A = Morph.normalise(dough * size + [cx, cy], 256)
    B = Morph.normalise(loaf * size + [cx, cy], 256)
    return Morph.chain([A, B])


def export_shape_layer(points, colour, path, size=720):
    # Export a transparent, independently usable shape layer from the exact Morph contour.
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    if not isinstance(colour, str):
        colour = tuple(int(round(c * 255)) for c in np.asarray(colour)[:3]) + (255,)
    pts = np.asarray(points, np.float64)
    span = max(np.ptp(pts[:, 0]), np.ptp(pts[:, 1]))
    scale = size * .70 / max(span, 1)
    cx, cy = pts.mean(axis=0)
    xy = [((x - cx) * scale + size/2, (y - cy) * scale + size/2) for x, y in pts]
    draw.polygon(xy, fill=colour)
    draw.line(xy + [xy[0]], fill='#633d31', width=max(3, size // 180), joint='curve')
    im.save(path)


def build_morph():
    W, H = 1920, 1080
    shutil.rmtree(STAGES / 'morph', ignore_errors=True)
    m = Morph(W, H, seed=33, ss=3)
    PAPER, INK2 = '#f3eee4', '#2b2525'
    BG0, BG1, BG2 = '#fff0cf', '#dce8f2', '#f0d8c5'
    RAW, BAKED = '#e8be83', '#d98245'
    m.paper(PAPER)
    A, B = custom_shapes(960, 555, 184)
    mid = Morph.tween(A, B, .5, at=(960, 555), stretch=.13, direction=0)

    # Main heading / method line.
    m.text('SHAPE MORPH  /  ONE CONTOUR', 90, 102, 19, '#475364', 'mono_bold', spacing=2)
    m.text('Dough becomes a loaf', 86, 206, 76, INK2, 'display')
    m.text('A 256-point outline carries the whole change.', 91, 252, 22, '#5f5c57', 'sans')

    panels = [(70, 320, 620, 824, BG0), (685, 320, 1235, 824, BG1), (1300, 320, 1850, 824, BG2)]
    for x0, y0, x1, y1, colour in panels:
        m.panel(x0, y0, x1, y1, colour, ink=INK2)

    left = A + np.array([-610, 0]); right = B + np.array([610, 0])
    m.fill(left, RAW); m.outline(left, '#694637', width=3.3)
    # The centre panel shows the two source contours as onion skin, the actual midpoint, and sampled correspondence dots.
    m.ghost(A, fill=RAW, fill_alpha=.12, line_alpha=.68, width=2.4)
    m.ghost(B, fill=BAKED, fill_alpha=.12, line_alpha=.68, width=2.4)
    m.fill(mid, Morph.mix(RAW, BAKED, .5)); m.outline(mid, '#694637', width=3.2)
    m.points(mid, every=24, r=2.8, colour='#303844', alpha=.9)
    m.fill(right, BAKED); m.outline(right, '#694637', width=3.3)

    # Baked score marks appear only on the final pose; they are details, not extra morph contours.
    for dx in (-.34, 0, .34):
        x = 1570 + dx * 190
        m.stroke([(x-18, 540), (x-4, 510), (x+13, 496)], '#f8d39d', 5.2, .92)

    for x, n, title, sub, col in [
        (100, '01', 'RAW DOUGH', 'soft, uneven mass', '#815b43'),
        (715, '02', 'IN BETWEEN', 'same 256 points', '#475f7a'),
        (1330, '03', 'OVEN LOAF', 'shape settles, color warms', '#81513b')]:
        m.text(n, x, 365, 15, col, 'mono_bold', spacing=1.5)
        m.text(title, x, 400, 19, INK2, 'mono_bold', spacing=1.0)
        m.text(sub, x, 783, 16, INK2, 'sans')

    m.text('GHOST OUTLINES  ·  DOTS = EVENLY MATCHED CONTOUR SAMPLES', 960, 291, 12, '#475f7a', 'mono_bold', spacing=1.1, anchor='m')
    # Eased timeline + keyframes.
    ty = 952
    m.outline(np.array([(250, ty), (1670, ty)]), '#6d625a', 2.0, .8, closed=False)
    m.ease_curve(340, ty, 1580, ty-74, 'sine', '#3b546f', width=3.0, ticks=[.25, .5, .75], tick_colour='#d98245')
    m.diamond(340, ty, 12, fill=RAW, line=INK2, width=2.2)
    m.diamond(1580, ty-74, 12, fill=BAKED, line=INK2, width=2.2)
    m.text('FRAME 01', 340, 1015, 13, '#645a53', 'mono', anchor='m', spacing=1.5)
    m.text('FRAME 24', 1580, 1015, 13, '#645a53', 'mono', anchor='m', spacing=1.5)
    m.text('SINE EASE  ·  SQUASH / STRETCH  ·  ONION SKIN', 960, 1046, 13, '#645a53', 'mono', anchor='m', spacing=1.3)
    m.stage('storyboard')
    m.save(str(OUT / 'morph_dough_to_loaf.png'), stages_dir=str(STAGES / 'morph'))

    export_shape_layer(A, RAW, OUT / 'morph_layer_01_raw_dough.png')
    export_shape_layer(B, BAKED, OUT / 'morph_layer_02_baked_loaf.png')
    export_shape_layer(mid, Morph.mix(RAW, BAKED, .5), OUT / 'morph_layer_03_mid_contour.png')

    # Real looped animation: raw dough holds, morphs with easing/squash, holds as bread, then returns.
    fw, fh, fps = 720, 405, 12
    frames = []
    def frame_at(u):
        mm = Morph(fw, fh, seed=7, ss=2)
        bg = Morph.mix('#fff0cf', '#f0d8c5', u)
        mm.paper(bg)
        # coordinates scaled to this frame; the algorithm still samples the same 256-point shapes.
        a = (A - [960, 555]) * .73 + [fw/2, fh/2 + 4]
        b = (B - [960, 555]) * .73 + [fw/2, fh/2 + 4]
        keys = Morph.chain([a, b])
        s = max(0.0, float(Morph.ease(u, 'sine')))
        shape = Morph.tween(keys[0], keys[1], s, at=(fw/2, fh/2 + 4), stretch=.14*math.sin(math.pi*s), direction=0)
        mm.fill(shape, Morph.mix(RAW, BAKED, s))
        mm.outline(shape, '#694637', width=3.0)
        # Preserve the simple one-contour grammar; position and tempo stay legible at mobile width.
        mm.text('DOUGH  →  LOAF', fw/2, 52, 19, '#393238', 'mono_bold', anchor='m', spacing=2)
        mm.text(f'{s*100:02.0f}% BAKED', fw/2, fh-22, 12, '#5f5c57', 'mono', anchor='m', spacing=1.4)
        return mm.composite(grain=.0025, paper_tooth=.004)

    for i in range(6): frames.append(frame_at(0))
    for i in range(18): frames.append(frame_at((i+1)/18))
    for i in range(5): frames.append(frame_at(1))
    for i in range(18): frames.append(frame_at(1-(i+1)/18))
    for i in range(6): frames.append(frame_at(0))
    pal = frames[0].convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
    gif_frames = [frames[0].convert('RGB').quantize(palette=pal, dither=Image.Dither.NONE)]
    gif_frames.extend(im.convert('RGB').quantize(palette=pal, dither=Image.Dither.NONE) for im in frames[1:])
    gif_frames[0].save(OUT / 'morph_dough_to_loaf.gif', save_all=True, append_images=gif_frames[1:], duration=round(1000/fps), loop=0, optimize=True, disposal=2)
    print('MORPH saved; keys=', len(A), len(B), 'frames=', len(frames), flush=True)


def build_soft3d():
    W, H = 1600, 900
    stages = STAGES / 'soft3d'
    shutil.rmtree(stages, ignore_errors=True)
    s = Soft3D(W, H, seed=41, eye=(2.7, 2.2, -6.4), target=(0.0, .78, .45), fov=27,
               preview=.28, record=True)
    s.lens(focus=(0.0, .90, .42), aperture=.005)
    s.floor('#e3d5cb', mat='matte')
    s.ball_field(-15, 15, -14, 34, r=.052, gap=.058,
                 colours=['#d4e8dd', '#e8ded8', '#f3e8d2', '#c7d6e9'], weights=[4, 4, 3, 1], mat='satin')
    # Wide rounded cutting board, a true capsule-shaped loaf, and inlaid score marks.
    s.rbox((0, .13, .52), (3.65, .22, 2.15), radius=.13, colour='#81523f', mat='satin', yaw=-3)
    s.capsule((0, .86, .40), length=1.22, radius=.53, colour='#d98d43', mat='candy', roll=90)
    for x, roll in [(-.42, -27), (0, -24), (.42, -20)]:
        s.rbox((x, 1.01, -.16), (.34, .018, .025), radius=.009, colour='#c47a3d', mat='matte', roll=roll)
    # Flour pearls and a pat of cultured butter; these are separate scene objects in the 3D render.
    for x, y, z, r, col in [
        (-1.42,.28,-.22,.095,'#fff1d8'),(-1.12,.27,-.45,.07,'#fff1d8'),
        (1.32,.28,-.24,.09,'#fff1d8'),(1.02,.28,-.46,.065,'#fff1d8'),
        (.94,.30,.98,.085,'#f5cd63'),(-1.10,.29,1.04,.06,'#e9ddcf')]:
        s.ball(x,y,z,r,col,mat='satin')
    s.part(heap=.018, reach=.55, pile=.1, pile_top=.12)
    s.stage('01_clay_geometry')
    s.sky(top='#a6b9df', horizon='#f1cdbb', strength=1.08, haze=38, haze_start=8)
    s.stage('02_materials_and_sky')
    s.key(azimuth=-58, elevation=48, colour='#fff0d7', strength=1.28, size=14)
    s.rim(azimuth=150, elevation=24, colour='#f7b9a4', strength=.82, size=16)
    s.softbox(azimuth=32, elevation=36, width=22, height=11, strength=.42)
    s.stage('03_softbox_key_and_rim')
    s.film(bloom=.09, vignette=.18, grain=.003, exposure=.94)
    s.stage('04_film_finish')
    s.save(str(OUT / 'soft3d_bakery_loaf.png'), stages_dir=str(stages), ss=1.2)
    print('SOFT3D saved', flush=True)


if __name__ == '__main__':
    build_lineart()
    build_morph()
    build_soft3d()
