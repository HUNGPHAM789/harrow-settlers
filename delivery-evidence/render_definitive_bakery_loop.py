#!/usr/bin/env python3
"""
Renders the Master Animated Reel (GIF + MP4) of the Definitive Settlers II Bakery House
with the Chef performing the 12-Animation Continuous Work Loop in the sunny village scene!
"""
import os
import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import PIL.ImageFont as ImageFont

W, H = 840, 520

# 1. Prepare Base Static Scene
base_scene = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(base_scene)

# Sky gradient
for y in range(160):
    t = y / 160.0
    r = int(140 + t * 45)
    g = int(195 + t * 35)
    b = int(230 - t * 20)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Sun glow
for r in range(80, 0, -10):
    alpha = int(25 * (1 - r / 80))
    draw.ellipse([30 - r, 30 - r, 30 + r, 30 + r], fill=(255, 245, 180, alpha))

# Distant hills
draw.polygon([(0, 110), (160, 90), (320, 115), (500, 85), (680, 105), (W, 90), (W, 180), (0, 180)], fill="#467332")
draw.polygon([(0, 130), (200, 110), (380, 132), (580, 108), (W, 125), (W, 190), (0, 190)], fill="#568a39")

# Meadow
draw.rectangle([0, 160, W, H], fill="#629b35")
for y in range(160, H, 8):
    shade = int(98 + (y - 160) * 0.08)
    draw.line([(0, y), (W, y)], fill=(98, shade, 53, 255))

for gx in range(0, W, 18):
    for gy in range(165, H, 14):
        if (gx * 3 + gy * 7) % 17 == 0:
            draw.rectangle([gx, gy, gx + 2, gy + 2], fill="#f5d742")
        elif (gx * 5 + gy * 11) % 23 == 0:
            draw.rectangle([gx, gy, gx + 2, gy + 2], fill="#ffffff")

# Cobblestone road
road = [(0, 420), (200, 380), (440, 370), (660, 390), (W, 430), (W, H), (0, H)]
draw.polygon(road, fill="#4c5261")
draw.polygon([(0, 424), (200, 384), (440, 374), (660, 394), (W, 434), (W, H - 4), (0, H - 4)], fill="#636c80")
for rx in range(10, W - 10, 20):
    for ry in range(390, H - 10, 12):
        if (rx + ry) % 7 < 4:
            draw.line([(rx, ry), (rx + 10, ry + 3)], fill="#7a859e", width=2)
            draw.point((rx + 2, ry + 1), fill="#a5b0cb")

# Terrace apron
draw.polygon([(56, 320), (380, 176), (784, 320), (420, 404)], fill="#252a36")
draw.polygon([(60, 318), (380, 180), (780, 318), (420, 400)], fill="#484f63")
draw.polygon([(64, 314), (380, 184), (776, 314), (420, 394)], fill="#6b748f")

for lx in range(90, 750, 45):
    draw.line([(lx, 314 + (lx - 420) * 0.1), (lx + 60, 230 + (lx - 420) * 0.1)], fill="#565e70", width=1)
for ly in range(210, 380, 28):
    draw.line([(120, ly), (720, ly + 20)], fill="#565e70", width=1)

draw.polygon([(60, 318), (420, 400), (420, 406), (60, 324)], fill="#393e4d")
draw.polygon([(420, 400), (780, 318), (780, 324), (420, 406)], fill="#2c303c")

# Paste solid Medieval Bakery House
bakery_img = Image.open("/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png").convert("RGBA")
bbox = bakery_img.getbbox()
bakery_crop = bakery_img.crop(bbox)
base_scene.paste(bakery_crop, (60, 45), bakery_crop)

# Paste Static Props
props = [
    ("prop_bakery_flour_barrel_3q.png", 355, 235),
    ("prop_bakery_dough_table_3q.png", 425, 245),
    ("prop_bakery_peel_rack_3q.png", 395, 175),
    ("prop_bakery_hearth_3q.png", 515, 205),
    ("prop_bakery_cooling_rack_3q.png", 605, 225),
    ("prop_bakery_bread_basket_3q.png", 670, 290),
    ("prop_bakery_pretzel_sign_3q.png", 715, 205),
    ("prop_bakery_sparrow_3q.png", 380, 350)
]
for pname, px, py in props:
    pimg = Image.open(f"/Users/hungpham/projects/harrow-settlers/art/out/sprites/{pname}").convert("RGBA")
    base_scene.paste(pimg, (px, py), pimg)

# 2. Animation Sequences
beats = [
    ("anim_chibi_baker_scoop", 8, 74, 80, 355, 205, "01  SCOOP PURE WHEAT FLOUR", "Pantry: Wooden scoop dips into flour barrel"),
    ("anim_chibi_baker_pour", 8, 74, 80, 430, 210, "02  POUR SPRING WATER & MIX", "Prep Table: Terracotta jug pours spring water"),
    ("anim_chibi_baker_knead", 12, 70, 80, 430, 210, "03  KNEAD THE DOUGH (2-HANDED)", "Table: Vigorous 2-handed kneading with body lean"),
    ("anim_chibi_baker_shape", 8, 72, 80, 430, 210, "04  SHAPE & SCORE ARTISAN LOAVES", "Table: Shaping boules & cutting diagonal baker scores"),
    ("anim_chibi_baker_oven", 8, 90, 80, 500, 185, "05  PEEL STICK: LOAD INTO HEARTH", "Hearth: Wooden peel stick slides raw dough into fire"),
    ("anim_chibi_baker_sneeze", 10, 76, 80, 450, 225, "06  FLOUR-CLOUD SNEEZE (ACHOO!)", "Comedy: Flour cloud explosion, white-faced blink"),
    ("anim_chibi_baker_peel_retrieve", 8, 92, 80, 500, 185, "07  PEEL STICK: RETRIEVE HOT BREAD", "Hearth: Wooden peel stick pulls out steaming loaves"),
    ("anim_chibi_baker_aroma", 8, 78, 80, 600, 200, "08  BREATHE IN FRESH BREAD AROMA", "Cooling Rack: Inhaling warm yeast aroma proudly"),
    ("anim_chibi_baker_carry", 8, 68, 80, 625, 235, "09  CARRY BASKET TO STOREFRONT", "Workshop: Carrying wicker basket with bouncy stride"),
    ("anim_chibi_baker_serve", 8, 74, 80, 675, 250, "10  SERVE AT COUNTER & RING BELL", "Storefront: Displaying bread & ringing brass bell"),
    ("anim_chibi_baker_walk", 8, 68, 80, 520, 225, "11  RETURN TO WORKSHOP LANE", "Courtyard: Walking back to workshop along apron"),
    ("anim_chibi_baker_idle", 8, 68, 80, 440, 210, "12  READY FOR THE NEXT BATCH", "Workbench: Calm grounded breathing, adjusting toque")
]

# Load animation strips
anim_strips = {}
for aname, fcount, fw, fh, _, _, _, _ in beats:
    if aname not in anim_strips:
        anim_strips[aname] = Image.open(f"/Users/hungpham/projects/harrow-settlers/art/out/anims/{aname}.png").convert("RGBA")

try:
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
    font_desc = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
except:
    font_badge = ImageFont.load_default()
    font_desc = ImageFont.load_default()
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()

frames = []
frames_per_beat = 8

for b_idx, (aname, fcount, fw, fh, cx, cy, title, desc) in enumerate(beats):
    strip = anim_strips[aname]
    for step in range(frames_per_beat):
        frame = base_scene.copy()
        f_draw = ImageDraw.Draw(frame)
        
        # Calculate local frame
        f_local = min(fcount - 1, int(step * fcount / frames_per_beat))
        sx = f_local * fw
        sprite_frame = strip.crop((sx, 0, sx + fw, fh))
        
        # Paste Chef
        frame.paste(sprite_frame, (cx, cy), sprite_frame)
        
        # Hearth fire ember flicker
        flick = (step % 4) < 2
        f_draw.ellipse([538, 228, 546, 232], fill="#ffb438" if flick else "#ed681f")
        
        # Header banner
        f_draw.rectangle([0, 0, W, 42], fill="#161b26")
        f_draw.line([0, 42, W, 42], fill="#3b4252", width=2)
        f_draw.text((16, 10), "HARROW BAKERY · 12-ANIMATION WORK LOOP", fill="#f5d742", font=font_title)
        f_draw.text((W - 320, 14), "The Settlers II Authentic Aesthetic", fill="#c0caf5", font=font_sub)
        
        # Bottom status ticker
        f_draw.rectangle([20, H - 46, W - 20, H - 12], fill="#161b26", outline="#3b4252", width=1)
        is_stick = ("PEEL" in title)
        f_draw.text((34, H - 40), title, fill="#f5c44e" if is_stick else "#58a6ff", font=font_badge)
        f_draw.text((380, H - 38), desc, fill="#ded3b8", font=font_desc)
        
        # Progress bar
        prog_w = int((W - 40) * ((b_idx * frames_per_beat + step) / (len(beats) * frames_per_beat)))
        f_draw.rectangle([20, H - 14, 20 + prog_w, H - 12], fill="#f5c44e")
        
        frames.append(frame)

# Save Master GIF
out_gif = "/Users/hungpham/projects/harrow-settlers/delivery-evidence/definitive_settlers_bakery_12_loop.gif"
frames[0].save(
    out_gif,
    save_all=True,
    append_images=frames[1:],
    duration=125, # 8 fps -> 125ms per frame
    loop=0,
    optimize=False
)
print("✅ Master GIF saved:", out_gif, f"({len(frames)} frames)")

# Save First Frame as clean screenshot
out_png = "/Users/hungpham/projects/harrow-settlers/delivery-evidence/definitive_settlers_bakery_screenshot.png"
frames[35].save(out_png) # frame 35 is Peel Stick Load!
print("✅ Master Screenshot saved:", out_png)
