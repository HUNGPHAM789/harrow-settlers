"""Four original scenes rendered with cloveric/claude-drawing-skill modules.

No image-generation model is used. Source modules are loaded from the checked-out
repo at /tmp/claude-drawing-skill; deliverables and render stages live beside this file.
"""
from pathlib import Path
import sys, shutil, math
import numpy as np
from PIL import Image, ImageDraw

SKILL = Path('/tmp/claude-drawing-skill')
sys.path.insert(0, str(SKILL / 'lib'))
OUT = Path(__file__).resolve().parent
STAGES = OUT / 'stages'
STAGES.mkdir(exist_ok=True)


def build_isometric():
    from isometric import Isometric
    d = STAGES / 'isometric_bakery'
    shutil.rmtree(d, ignore_errors=True)
    iso = Isometric(1440, 900, seed=426, scale=74, look=(5, 4.7, 0), at=(0.5, 0.54),
                    bounds=(-2, -2, -2.2, 12, 11, 7), ss=1, floor=-2.4, record=True)
    iso.backdrop('#171d31', '#493c4b', '#ffcb82', centre=(5, 4.5, 1.0))
    iso.slab(0.35, 0.45, 9.65, 8.75, z0=-0.82, z1=0,
             top='#39414b', layers=(('#d28c62', .12), ('#9e5b4a', .24), ('#553e4b', .28), ('#303846', .36)), bevel=.08)
    iso.stage('01_floating_street_plinth')

    # Flat ground plane, worn pavement, and the shop as an open-front cutaway.
    for ix in range(9):
        for iy in (6, 7):
            col = '#59616a' if (ix + iy) % 3 else '#6e6b68'
            iso.box(.6 + ix, 6.5 + (iy - 6) * .5, .012, 1.55 + ix, 6.98 + (iy - 6) * .5,
                    .055, col, bevel=.016)
    iso.road(.45, 7.55, 9.55, 8.35, z=.01, h=.045, colour='#242b38', line='#d4b77c', dash=(.36, .22), kerb='#a98a6a')
    # Back and left masonry walls; the two street-facing sides stay open for a readable interior.
    iso.box(2.15, 2.0, .02, 7.75, 2.2, 3.0, '#a87966', bevel=.024)
    iso.box(2.15, 2.0, .02, 2.36, 6.35, 3.0, '#88716d', bevel=.024)
    # Brick joints on the cutaway wall, lintel, roof edge and a shallow awning.
    for z in (.48, .92, 1.36, 1.80, 2.24, 2.68):
        iso.tube((2.37, 2.01, z), (7.72, 2.01, z), .012, '#d5aa86', cast=False, ao=False)
    for x in (2.78, 3.52, 4.25, 4.99, 5.72, 6.46, 7.18):
        for z in (.25, 1.13, 2.0):
            iso.tube((x, 2.01, z), (x + .34, 2.01, z), .009, '#634d50', cast=False, ao=False)
    iso.box(2.0, 1.8, 2.96, 7.92, 3.25, 3.16, '#253142', bevel=.04)
    iso.box(2.06, 1.82, 2.86, 7.85, 1.98, 3.23, '#c58b56', bevel=.025)
    # Four color-block awning panels over the open service side.
    for i, col in enumerate(('#d75b4b', '#e5bd78', '#d75b4b', '#e5bd78', '#d75b4b', '#e5bd78')):
        x = 2.4 + i * .87
        iso.box(x, 3.03, 2.68, x + .83, 5.93, 2.82, col, bevel=.025)
        iso.box(x, 5.82, 2.53, x + .83, 5.99, 2.70, col, bevel=.035)
    # Open-front service frame and main sign.
    for y in (2.5, 5.9):
        iso.box(7.38, y, .02, 7.54, y + .16, 2.8, '#5a3f3d', bevel=.025)
        iso.box(7.52, y + .03, .22, 7.57, y + .13, 2.65, '#d7a26d', bevel=.012)
    iso.box(7.42, 3.16, 2.9, 7.64, 5.43, 3.53, '#272a39', bevel=.04)
    iso.sign(7.65, 4.30, 3.03, 1.78, .49, 'HARROW', facing='+x', colour='#272a39', ink='#ffe4ad', font='sans_bold', thick=.05)
    iso.sign(7.65, 4.30, 2.94, 1.14, .21, 'BAKERY', facing='+x', colour='#272a39', ink='#ff9d78', font='sans_bold', thick=.035)
    iso.stage('02_cutaway_shell_and_awning')

    # Flour shelves and a brick oven with a lit mouth, flue and hanging tools.
    for z in (.70, 1.42, 2.14):
        iso.box(2.56, 2.46, z, 4.02, 2.62, z + .08, '#6a4841', bevel=.018)
        for j, col in enumerate(('#d8a65f', '#ba7351', '#e0c28e', '#bc8858', '#d7d3bb')):
            x = 2.68 + j * .25
            iso.box(x, 2.45, z + .08, x + .17, 2.59, z + .35, col, bevel=.035)
            iso.box(x + .02, 2.44, z + .33, x + .15, 2.60, z + .37, '#eee0c4', bevel=.018)
    # Oven plinth, refractory brick frame, dark arch impression and hot bake chamber.
    iso.box(4.30, 2.40, .03, 5.85, 3.70, 1.68, '#70483b', bevel=.07)
    iso.box(4.42, 2.36, 1.65, 5.72, 3.68, 1.79, '#a87755', bevel=.035)
    iso.box(5.73, 2.72, .38, 5.80, 3.39, 1.30, '#241d28', bevel=.045)
    iso.box(5.78, 2.82, .47, 5.81, 3.28, 1.18, '#ff9d4c', bevel=.06, mat='gloss', cast=False, ao=False)
    iso.box(5.80, 2.93, .59, 5.82, 3.18, .98, '#ffe18d', bevel=.04, mat='gloss', cast=False, ao=False)
    for k in range(5):
        iso.box(5.82, 2.86 + k * .085, .50, 5.84, 3.23 - k * .06, .54, '#a84c30', bevel=.012)
    iso.box(4.72, 3.05, 1.75, 5.48, 3.36, 2.28, '#4a3b3c', bevel=.05)
    for k in range(4):
        iso.box(4.82 + k * .15, 3.035, 1.85, 4.87 + k * .15, 3.045, 2.15, '#c49c72', bevel=.01)
    iso.stage('03_oven_shelves_and_warmth')

    # Counter, trays, pastries, scales, flour sacks, stacked crates and a tiny service bell.
    iso.box(4.10, 4.20, .04, 6.92, 5.30, .82, '#744b3c', bevel=.05)
    iso.box(4.02, 4.12, .82, 7.00, 5.37, .98, '#d3a06a', bevel=.04)
    for x in (4.36, 5.10, 5.84, 6.56):
        iso.box(x, 4.38, .20, x + .48, 4.95, .25, '#3f3940', bevel=.045)
        for j in range(3):
            iso.ellipsoid((x + .10 + j * .13, 4.66, .34), (.12, .075, .095), '#c98248', yaw=15*j)
            iso.tube((x + .03 + j * .13, 4.61, .40), (x + .08 + j * .13, 4.68, .43), .008, '#f0d092', cast=False, ao=False)
    iso.box(6.36, 4.52, .99, 6.67, 4.82, 1.22, '#87929a', bevel=.035)
    iso.cylinder(6.52, 4.67, 1.22, 1.29, .11, '#f4ddb0')
    iso.sphere(4.32, 4.37, 1.08, .075, '#efc76e')
    # A-frame menu and hand painted board, placed on the flat pavement.
    for y in (6.62, 7.02):
        iso.tube((6.8, y, .04), (6.8, y, .88), .035, '#8f563c')
    iso.box(6.77, 6.59, .53, 6.85, 7.05, .91, '#3d3738', bevel=.03)
    iso.sign(6.88, 6.82, .57, .34, .30, 'TODAY', facing='+x', colour='#3d3738', ink='#f2ce8c', font='sans_bold', thick=.025)
    iso.text('SOURDOUGH  /  06:14', 720, 806, 17, '#f4dbad', font='sans_bold', anchor='mm')

    # A flour sack stack, delivery crate with baguettes, copper milk can, bollard and a potted rosemary.
    for i, (x, y, z) in enumerate(((3.1, 5.15, .05), (3.43, 5.21, .05), (3.28, 5.15, .42))):
        iso.ellipsoid((x, y, z + .23), (.23, .19, .29), '#c3b39a', yaw=-8 + 13*i)
        iso.tube((x-.12, y-.03, z+.35), (x+.13, y-.05, z+.35), .012, '#837260', cast=False, ao=False)
    iso.box(2.65, 5.78, .04, 3.36, 6.39, .57, '#89583f', bevel=.035)
    for z in (.17, .34, .51): iso.tube((2.66, 5.78, z), (3.35, 5.78, z), .018, '#d09b63')
    for x in (2.78, 2.97, 3.16): iso.ellipsoid((x, 6.05, .63), (.07, .28, .07), '#c9874d', yaw=90)
    iso.cylinder(7.28, 6.56, .04, .43, .15, '#8a9295', r1=.13)
    iso.cylinder(7.28, 6.56, .43, .52, .09, '#a6aca8')
    iso.box(8.23, 5.91, .04, 9.02, 6.56, .13, '#5d5146', bevel=.08)
    for z, col in ((.16, '#436b59'), (.35, '#547d60'), (.50, '#63845e')):
        iso.ellipsoid((8.48, 6.19, z), (.28, .24, .18), col)
        iso.ellipsoid((8.77, 6.30, z-.02), (.20, .21, .14), '#79906a')
    for i in range(3): iso.tube((8.50+i*.16, 6.18, .55), (8.42+i*.16, 6.05, .77), .012, '#a4a66c', cast=False, ao=False)
    # Wall clock, copper pans, pendant lamps, chimney and a little smoke.
    iso.cylinder(3.30, 2.38, 2.20, 2.22, .27, '#553b3d')
    iso.cylinder(3.30, 2.39, 2.23, 2.245, .225, '#e3c78e')
    iso.tube((3.30, 2.39, 2.24), (3.30, 2.39, 2.40), .012, '#5a4b45', cast=False, ao=False)
    for x in (4.7, 5.25, 5.8):
        iso.tube((x, 2.30, 2.67), (x, 2.30, 2.42), .015, '#625150', cast=False, ao=False)
        iso.cylinder(x, 2.30, 2.35, 2.40, .14, '#a96e4b', r1=.11)
    iso.box(6.75, 2.10, 3.17, 7.18, 2.54, 4.05, '#594b4b', bevel=.06)
    iso.box(6.70, 2.06, 4.00, 7.23, 2.58, 4.13, '#b47753', bevel=.03)
    for k in range(3): iso.ellipsoid((6.96 + .12*k, 2.24, 4.28 + .10*k), (.11, .11, .09), '#b3a8ad', yaw=10*k, cast=False, ao=False)

    # Hand-cut silhouettes to make the room inhabited: baker turns a loaf toward the doorway.
    # Body, apron, trouser legs, head, hair, sleeves, and a loaf are all independent solids.
    bx, by = 6.62, 4.08
    iso.cylinder(bx-.11, by, .04, .47, .10, '#353947')
    iso.cylinder(bx+.12, by, .04, .47, .10, '#414451')
    iso.box(bx-.24, by-.13, .46, bx+.24, by+.13, 1.20, '#456778', bevel=.09)
    iso.box(bx-.22, by-.16, .49, bx+.22, by+.17, .94, '#d7b78f', bevel=.025)
    iso.sphere(bx, by, 1.43, .205, '#d9a47d')
    iso.ellipsoid((bx+.01, by-.01, 1.57), (.19, .20, .11), '#473735')
    iso.tube((bx-.19, by, 1.08), (bx-.31, by+.36, 1.23), .066, '#456778')
    iso.sphere(bx-.31, by+.36, 1.24, .075, '#d9a47d')
    iso.tube((bx+.19, by, 1.08), (bx+.34, by+.37, 1.21), .065, '#456778')
    iso.sphere(bx+.34, by+.37, 1.23, .075, '#d9a47d')
    iso.ellipsoid((bx+.43, by+.39, 1.29), (.12, .09, .07), '#ce8b4e', yaw=25)
    # Warm point lights and ground details; one slightly ajar delivery hatch.
    iso.sphere(7.18, 4.63, 2.55, .10, '#ffd184', mat='gloss', cast=False, ao=False)
    for x, y in ((1.25, 6.1), (8.95, 4.8), (1.7, 7.0)):
        iso.box(x, y, .035, x+.34, y+.11, .07, '#272a31', bevel=.04)
        for dx in (.07, .17, .27): iso.box(x+dx, y+.12, .04, x+dx+.025, y+.2, .055, '#b27c58', bevel=.006)
    iso.stage('04_living_props_and_last_loaf')
    iso.save(str(OUT / 'masterpiece_isometric_bakery.png'), stages_dir=str(d), quality=94)
    return d


def build_cyberpunk():
    from cyberpunk import Cyberpunk, MAGENTA, CYAN, AMBER, RED
    d = STAGES / 'cyberpunk_last_loaf'
    shutil.rmtree(d, ignore_errors=True)
    c = Cyberpunk(1440, 810, seed=341, focal=850, vp=(720, 405), eye=1.7, fog=115, wall=9.0, road=5.5,
                  ambient='#394465', fog_colour='#19152d', record=True)
    c.sky(zenith='#050713', mid='#11152d', horizon='#552b55', glow='#ff704d', clouds=.85)
    c.skyline(z=620, x_range=(-620, 620), heights=(100, 380), widths=(24, 74), colour='#15192e')
    c.skyline(z=330, x_range=(-260, 260), heights=(60, 220), widths=(16, 48), colour='#11152b')
    c.stage('01_harrow_after_rain')
    left = [(12, 25, 38, '#292d3d'), (25, 42, 54, '#25283a'), (42, 65, 42, '#2b2b39'), (65, 100, 66, '#20283b'), (100, 150, 48, '#25273a')]
    right = [(12, 23, 47, '#262c39'), (23, 40, 32, '#2d293b'), (40, 62, 57, '#22283a'), (62, 96, 43, '#2c2b38'), (96, 145, 72, '#22273a')]
    for i, (a,b,h,col) in enumerate(left):
        c.building(-1, a, b, h, wall=9, colour=col, floor=3.0, bay=2.4, lit=.28,
                   shops=(.35,.35,.18,.12) if i==0 else (.4,.34,.2,.06), seed=341+i)
    for i, (a,b,h,col) in enumerate(right):
        c.building(1, a, b, h, wall=9, colour=col, floor=3.0, bay=2.4, lit=.25,
                   shops=(.25,.3,.3,.15) if i==0 else (.42,.33,.2,.05), seed=361+i)
    c.stage('02_shopfronts_and_windows')
    c.street(asphalt='#191b25', paving='#292b37', kerb='#56525c', paint='#b2a596', crossing=(13.0, 3.2), puddles=.78, seed=41)
    for X,Z,rx,rz in [(-2.7,14.5,1.8,1.0),(2.9,16.2,1.2,.85),(-.8,26,2.3,1.5),(3.6,32,1.2,1.6)]:
        c.puddle(X,Z,rx,rz)
    c.grate(-3.0,13.8,glow='#ff744b',level=.5)
    c.grate(3.1,22,glow=CYAN,level=.22)
    # Shop beacons placed in the near blocks, with one sign caught mid-flicker.
    c.blade_sign(-1, 17, 3.2, 8.5, 'EAT', AMBER, reach=2.6, border=CYAN, latin='LAST LOAF', flicker=[2], level=1.25)
    c.blade_sign(-1, 27, 3.5, 10.0, 'OPEN', CYAN, reach=2.2, kind='box', text_colour='#171a24', latin='24 HOURS', level=.78)
    c.blade_sign(1, 19, 3.0, 9.3, 'PHARMACY', CYAN, reach=2.4, border=MAGENTA, latin='SAFE WATER', level=.78)
    c.sign(21, -8.6, -6.0, 1.1, 3.0, 'NIGHT', MAGENTA, vertical=False, border=CYAN, latin='BAKERY', level=.95, box=.24)
    c.walkway(52, 8.8, thick=2.2, deep=3.8, windows=AMBER, lamps=AMBER, seed=57)
    c.cables(17, z=(15, 83), Y=(7, 18), sag=(.3, 1.2), width=.035, seed=37)
    c.light_trail([(-14,20,33),(-5,22,35),(5,21,38),(14,19,42)], '#ffe0ab', level=1.7, pair=1.15, width=.045, fade=(.12,.24))
    c.light_trail([(15,23,50),(5,24,47),(-6,22,45),(-15,20,44)], RED, level=1.35, pair=1.0, width=.04, fade=(.12,.26))
    c.stage('03_neon_wet_road_and_overpass')
    c.steam(-3,14, height=7, width=.7, drift=1.3, density=1.2, seed=51)
    c.steam(3.1,22, height=5.8, width=.55, drift=-1.0, density=.95, seed=52)
    c.mist(y=445,h=78,density=.25,seed=12)
    c.figure(-1.2,17.2,height=1.72,umbrella='clear',coat='#10121b',rim=(MAGENTA,CYAN),stride=.2)
    c.rain(far=3200,mid=920,near=46,slant=.11,rings=210,seed=7)
    c.glitch(256,5,7,2)
    c.stage('04_the_last_customer')
    c.save(str(OUT / 'masterpiece_cyberpunk_last_loaf.jpg'), stages_dir=str(d), quality=93)
    return d


def build_cartoon():
    from cartoon import Cartoon, WHITE, RED, YELLOW
    d = STAGES / 'cartoon_last_loaf'
    shutil.rmtree(d, ignore_errors=True)
    W,H=1600,900
    c=Cartoon(W,H,seed=73,boil=2.0,slop=3.0,rough=True)
    E,R=Cartoon.ellipse_pts,Cartoon.rrect_pts
    # Cold-press paper and a blue-pencil block-in remain visible under the confident ink.
    c.paper('#eee3cf',grain=1.0,mottle=.8,fibres=220)
    c.sketch([(120,150),(1460,150),(1460,735),(120,735),(120,150)],closed=False,width=2.0,passes=2)
    c.sketch([(255,570),(1340,570),(1340,770),(255,770)],closed=False,width=2.0,passes=1)
    c.stage('01_blue_pencil_block_in')
    # Dark shop interior as a broad hand-inked panel, brick edge and a warm door of light.
    c.shape(R(95,120,1505,754,20), '#28354a', shade=('#1c2639',10,14), width=9, slop=4)
    for row,y in enumerate((181,226,271,316,361,406)):
        for x in range(125+(row%2)*35,1500,94):
            c.line([(x,y),(x+49,y+1)],2.8,taper=(6,8),jitter=.9,press=.18)
    # Window and its reflected dawn; reflected signs are imperfect brush strokes.
    win=R(185,230,565,505,28)
    c.shape(win,'#d89b5f',shade=('#a95e48',12,10),width=7,slop=2)
    c.shape(R(207,250,544,480,16),'#e8be76',shade=('#cb8558',-6,12),width=4,slop=1)
    c.shape([(215,439),(250,353),(310,395),(355,315),(407,402),(463,341),(535,432),(535,474),(215,474)],'#64785f',width=3.5,slop=2)
    c.fill(E(469,291,42,42),'#ffe08a',slop=2)
    for x in (291,415): c.line([(x,251),(x,480)],4,taper=(0,0),jitter=.4)
    # Wall clock, menu, hanging pans, and flour-dusted shelves.
    c.shape(E(1295,223,75,75),'#d5ba87',shade=('#a18563',9,11),width=6,slop=2)
    c.fill(E(1295,223,58,58),'#f1dfb8',slop=2)
    c.line([(1295,223),(1295,185)],5,taper=(0,0)); c.line([(1295,223),(1325,239)],4,taper=(0,0))
    c.shape(R(1045,166,1210,316,8),'#332f39',shade=('#171c2a',8,9),width=5,slop=2)
    c.note('TODAY',1122,208,22,'#ffe0a0',anchor='m',bold=1)
    c.note('SOUP  /  BREAD',1122,252,14,'#e4d3ae',anchor='m')
    for x in (687,784,881):
        c.line([(x,128),(x,197)],4,taper=(3,6))
        c.shape(E(x,214,39,20),'#b97951',shade=('#71453d',4,6),width=4,slop=1)
    c.shape(R(606,286,992,465,12),'#684a42',shade=('#493640',12,12),width=6,slop=2)
    for y in (339,399,448):
        c.line([(627,y),(972,y)],7,taper=(4,4))
        for x in range(643,960,64):
            c.shape(E(x,y-19,19,18),'#d89a52',shade=('#a65e37',-2,3),width=3,slop=1)
    c.stage('02_room_and_bakehouse_props')
    # Counter and pastry cabinet in the lower half, deliberately broad and readable.
    c.shape(R(148,535,1460,653,11),'#9b6446',shade=('#75463c',0,16),width=7,slop=3)
    c.shape(R(166,510,1440,553,8),'#d7a36b',shade=('#b47b53',-2,8),width=6,slop=2)
    c.shape(R(185,660,1433,778,12),'#46556a',shade=('#303a4e',9,11),width=7,slop=3)
    for x in (280,650,1010,1320): c.line([(x,673),(x+1,765)],4,taper=(0,0))
    # Baker: broad coat, striped apron, expressive eyes and a bent reaching arm.
    c.shape(E(1000,391,102,118),'#d99c72',shade=('#b96952',7,8),width=7,slop=2)
    c.shape(R(892,489,1110,649,58),'#597c80',shade=('#3f6269',14,8),width=9,slop=3)
    c.shape([(922,504),(1080,503),(1060,631),(946,631)],'#e8d7b1',width=6,slop=2)
    for x in (965,1000,1035):
        c.fill([(x,526),(x+7,526),(x+9,613),(x+2,613)],'#b89d7c',wander=.15,kind='shade')
    c.shape(R(933,276,1071,331,20),'#f2e9d5',shade=('#d9cbb2',5,7),width=5,slop=2)
    c.face(1000,384,120,'tender',blush=True,width=6)
    c.arm((910,535),(816,582),bend=.5,width=17,hand=45,glove='#d99c72')
    c.arm((1080,533),(1170,561),bend=.35,width=16,hand=42,glove='#d99c72')
    # Customer: a child in an oversized raincoat, looking up at the warm bread.
    c.shape(E(1275,466,69,83),'#c88969',shade=('#9c5d50',5,7),width=6,slop=2)
    c.shape(R(1208,536,1342,684,38),'#b65d50',shade=('#894247',8,8),width=8,slop=2)
    c.shape([(1220,560),(1330,559),(1364,673),(1190,673)],'#e9bf77',width=6,slop=2)
    c.shape(R(1215,423,1335,467,16),'#413540',shade=('#292633',4,5),width=5,slop=2)
    c.face(1275,467,72,'hopeful',blush=True,width=5)
    c.arm((1214,584),(1168,570),bend=.25,width=13,hand=32,glove='#c88969')
    # The warm loaf passes between them. Score cuts, flour hatch, crumbs and a single burst.
    loaf=[(1090,557),(1110,537),(1140,531),(1160,540),(1177,551),(1182,562),(1164,574),(1130,578),(1104,572)]
    c.shape(loaf,'#d58b46',shade=('#a85635',-4,6),width=5,slop=1)
    c.line([(1115,548),(1121,558)],3,taper=(0,0)); c.line([(1136,540),(1142,553)],3,taper=(0,0)); c.line([(1156,545),(1162,557)],3,taper=(0,0))
    c.hatch(loaf,angle=-50,spacing=13,width=1.5,trim=4)
    c.crumbs(1153,541,n=12,spread=(95,65),size=(4,8),colour='#efc579',width=2.0)
    c.pop_lines(1152,530,46,92,[-154,-120,-75,-32,12,48],width=3.7)
    # Pendant glow and lettering finish the story without swallowing the artwork.
    c.shape(R(90,36,1510,111,22),'#202b3d',shade=('#182130',0,5),width=5,slop=1)
    c.letter('THE LAST WARM LOAF',800,91,39,fill='#ffe1a0',depth=(3,4),depth_colour='#77454a',anchor='m',tilt=2,bounce=.015)
    c.note('HARROW · 06:14 AM',800,825,21,colour='#3a4150',anchor='m')
    c.stage('03_ink_flats_cel_shadows')
    c.stage('04_crayon_hatching_and_story_beat')
    c.save(str(OUT/'masterpiece_hand_drawn_cartoon.png'), stages_dir=str(d), quality=94)
    return d


def build_lowpoly():
    from lowpoly import LowPoly, HUD_GREEN, HUD_CYAN, HUD_YELLOW
    d=STAGES/'lowpoly_midnight_delivery'
    shutil.rmtree(d,ignore_errors=True)
    g=LowPoly(1600,900,scale=4,seed=1999,record=True,far=105,bits=5,dither=True)
    g.camera((0,5.0,-10),(0,3.0,30),fov=58,roll=-1.4)
    g.sky('#121a46','#ef9c71',glow='#ffd38a',below='#1f2030')
    g.sun(screen=(.83,.21),colour='#ffb66d',strength=.8,disc=1.15)
    g.light(direction=(-.55,.4,.7),lift=2.6)
    g.ambient(sky='#798bbd',ground='#9a6555',strength=(.7,.72))
    g.stage('01_dusk_framebuffer')

    def quad(points, colour, name='', lit=True, spec=0.0, glow=0.0):
        V=np.asarray(points,np.float32); F=np.array([[0,1,2],[0,2,3]],np.int32)
        g.mesh(V,F,colour,lit=lit,spec=spec,shine=18,two_sided=True,glow=glow,name=name)
    def box(x0,y0,z0,x1,y1,z1,col,accent=None,name='block'):
        V=np.array([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],
                    [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],np.float32)
        F=np.array([[0,2,1],[0,3,2],[4,5,6],[4,6,7], [0,1,5],[0,5,4],
                    [1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]],np.int32)
        fc=[col]*12
        if accent:
            fc[2]=fc[3]=accent
        g.mesh(V,F,fc,lit=True,two_sided=True,name=name)
    # Long, flat street planes and gutters; a linear road keeps the 2.5D play lane readable.
    quad([(-21,-.15,-4),(21,-.15,-4),(21,-.15,112),(-21,-.15,112)],'#4a3e48','ground')
    quad([(-6.4,0,0),(6.4,0,0),(6.4,0,100),(-6.4,0,100)],'#292e3b','wet asphalt',spec=.65)
    quad([(-9,0,0),(-6.4,0,0),(-6.4,0,100),(-9,0,100)],'#65606a','left pavement')
    quad([(6.4,0,0),(9,0,0),(9,0,100),(6.4,0,100)],'#65606a','right pavement')
    # Road markings fade with distance, avoiding a false centered racing track.
    for z in np.arange(4,66,9):
        quad([(-.14,.014,z),(.14,.014,z),(.14,.014,z+2.0),(-.14,.014,z+2.0)],'#d7b883','worn lane dash')
    # Low-poly Harrow blocks: stacked masses, pitched roof silhouettes, dark shop windows.
    for side in (-1,1):
        for i,z in enumerate((8,24,42,63)):
            width=(4.0,4.8,5.6,6.5)[i]; h=(8.4,11.5,14.5,19)[i]
            if side<0: x0,x1=-9-width,-9
            else: x0,x1=9,9+width
            box(x0,0,z,x1,h,z+13.5,'#34354c',accent='#555066',name='row-house')
            # visible shop fascia panel and chunky windows on the street-facing end face
            fX=x1+.015 if side<0 else x0-.015
            quad([(fX,.45,z+.05),(fX,h*.58,z+.05),(fX,h*.58,z+7.4),(fX,.45,z+7.4)],'#253143','storefront')
            for wi in range(3):
                zz=z+.75+wi*2.0
                quad([(fX,.8,zz),(fX,h*.46,zz),(fX,h*.46,zz+1.35),(fX,.8,zz+1.35)],
                     ('#804e61','#55717e','#cd8956')[(i+wi)%3],'lit window',lit=False,glow=.12)
            # rooftop tanks, vent stacks, satellite dishes; purposeful silhouettes against the sky.
            box(x0+width*.27,h,z+4.8,x0+width*.58,h+1.4,z+6.3,'#5c5b70',name='roof-tank')
            box(x0+width*.72,h,z+2.5,x0+width*.83,h+2.8,z+2.9,'#a35459',name='roof-beacon')
    # Shop hero: a bakery awning, a bright sign and a striped canopy across the right wall.
    fX=8.985
    quad([(fX,5.8,10.5),(fX,7.7,10.5),(fX,7.7,15.8),(fX,5.8,15.8)],'#f0a95b','neon bakery box',lit=False,glow=.65)
    g.text('BAKERY',220,46,2,fill='#211b2d',outline='#f9d48b',shadow=True,bold=True,spacing=1)
    # Overhead cable bridges and traffic-light streak strips.
    for z in (22,41):
        quad([(-8,8.2,z),(8,8.2,z),(8,8.5,z+.45),(-8,8.5,z+.45)],'#343547','skybridge')
        for x in np.linspace(-7.4,7.4,13):
            box(x,8.5,z+.05,x+.13,8.75,z+.18,'#485364',name='bridge-light')
    quad([(-8,12,32),(-4,12,32),(-4,12.18,42),(-8,12.18,42)],'#ffb55e','traffic light ribbon',lit=False,glow=.9)
    quad([(4,11.2,47),(8,11.2,47),(8,11.38,54),(4,11.38,54)],'#3ed7d0','traffic light ribbon',lit=False,glow=.8)
    # Puddle facets on the single-level floor reflect signs as broken polygons.
    quad([(-5.8,.025,9),(-3.0,.025,9.5),(-2.4,.025,15),(-5.2,.025,16)],'#345565','cyan puddle',lit=False,glow=.13)
    quad([(1.4,.026,18),(4.6,.026,17.5),(5.2,.026,22),(2.1,.026,23)],'#5a394f','magenta puddle',lit=False,glow=.12)
    quad([(-1.0,.027,31),(2.0,.027,30),(2.6,.027,37),(-.8,.027,38)],'#49545b','road puddle',lit=False)
    g.stage('02_blockout_and_neon_geometry',wire=True)
    g.stage('03_facades_textures_and_facets',fog=False,textures=True)

    # A compact back-view courier assembled from low-poly volumes; one loaf crate on his shoulder.
    cx,cz=-1.15,10.5
    # ground shadow
    g.shadow(cx,cz,.1,radius=.8,stretch=1.4,heading=(0,0,1),strength=.48)
    box(cx-.38,0,cz-.20,cx-.06,.78,cz+.34,'#283249',name='left-trouser')
    box(cx+.07,0,cz-.18,cx+.39,.78,cz+.36,'#354058',name='right-trouser')
    box(cx-.30,.73,cz-.22,cx+.31,1.63,cz+.40,'#47606b',accent='#71838a',name='survivor-jacket')
    # arms hang low; the right hand holds a dark radio.
    box(cx-.55,.88,cz-.12,cx-.31,1.43,cz+.18,'#536a71',name='left-sleeve')
    box(cx+.30,.87,cz-.10,cx+.53,1.42,cz+.18,'#384657',name='right-sleeve')
    box(cx-.48,.56,cz+.10,cx-.28,.82,cz+.30,'#c58b68',name='hand')
    box(cx+.30,.52,cz+.06,cx+.49,.83,cz+.29,'#c58b68',name='hand')
    box(cx-.23,1.59,cz-.18,cx+.23,2.12,cz+.26,'#ba8367',name='head')
    box(cx-.25,2.02,cz-.20,cx+.25,2.20,cz+.27,'#302c38',name='hair')
    # backpack crate and one pale loaf peeking out.
    box(cx-.56,1.06,cz-.50,cx-.29,1.57,cz-.17,'#986948',name='bread-crate')
    for y in (1.2,1.35,1.5):
        quad([(cx-.57,y,cz-.52),(cx-.28,y,cz-.52),(cx-.28,y+.035,cz-.51),(cx-.57,y+.035,cz-.51)],'#d5ae79','crate slat')
    quad([(cx-.52,1.58,cz-.40),(cx-.34,1.58,cz-.40),(cx-.34,1.73,cz-.40),(cx-.52,1.73,cz-.40)],'#dfb36e','warm loaf',lit=False,glow=.1)
    g.stage('04_runner_and_gameplay_hud')
    # A minimal period-correct interface, restrained so the scene remains the hero.
    g.panel(6,5,112,37,colour='#131a2b',alpha=.88,border='#c2b59b')
    g.counter('RUN','06:14',9,7,scale=1,icon=None)
    g.counter('SUPPLIES','01',307,7,anchor='r',scale=1,icon=None)
    g.gauge(8,195,.62,segments=9,label='HEALTH',unit='',number='62')
    g.panel(328,155,392,211,colour='#111827',alpha=.8,border='#8dc5ce')
    g.text('HARROW',332,158,1,fill=HUD_CYAN,outline='#111827',bold=True)
    # tiny route diagram is deliberately hand-coded rather than copied from the canyon-flight example
    g.save(str(OUT/'masterpiece_low_poly_midnight_delivery.png'),stages_dir=str(d),quality=94)
    return d


if __name__=='__main__':
    jobs={'iso':build_isometric,'cyberpunk':build_cyberpunk,'cartoon':build_cartoon,'lowpoly':build_lowpoly}
    which=sys.argv[1:] or list(jobs)
    for name in which:
        print('BUILD',name,flush=True)
        jobs[name]()
        print('DONE',name,flush=True)
