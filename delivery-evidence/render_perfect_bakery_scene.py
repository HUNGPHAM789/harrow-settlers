#!/usr/bin/env python3
"""
Render the definitive, unmistakably clear Harrow Bakery House Scene:
- Full solid Settlers II half-timber bakery house with terracotta roof and chimney
- Vibrant sunny meadow and cobblestone terrace
- Clearly demarcated functional work zones:
    1. Flour Pantry (Barrel & Sacks)
    2. Kneading Table (Oak bench & tools)
    3. Stone Hearth Oven (Roaring fire & chimney)
    4. Baker's Stick / Peel Station
    5. Cooling Rack (Steaming fresh bread)
    6. Storefront Counter (Bread baskets, Pretzel sign & brass bell)
    7. Courtyard & Sparrow
"""
import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import PIL.ImageFont as ImageFont

W, H = 840, 520
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)

# 1. Sky & Sunlit Morning Atmosphere
for y in range(160):
    t = y / 160.0
    r = int(140 + t * 45)
    g = int(195 + t * 35)
    b = int(230 - t * 20)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Sun glow in top-left
for r in range(80, 0, -10):
    alpha = int(25 * (1 - r / 80))
    draw.ellipse([30 - r, 30 - r, 30 + r, 30 + r], fill=(255, 245, 180, alpha))

# Distant forested hills (Settlers green)
draw.polygon([(0, 110), (160, 90), (320, 115), (500, 85), (680, 105), (W, 90), (W, 180), (0, 180)], fill="#467332")
draw.polygon([(0, 130), (200, 110), (380, 132), (580, 108), (W, 125), (W, 190), (0, 190)], fill="#568a39")

# 2. Sunny Meadow Ground
draw.rectangle([0, 160, W, H], fill="#629b35")
# Lush lawn shading
for y in range(160, H, 8):
    shade = int(98 + (y - 160) * 0.08)
    draw.line([(0, y), (W, y)], fill=(98, shade, 53, 255))

# Dandelions and flowering clover
for gx in range(0, W, 18):
    for gy in range(165, H, 14):
        if (gx * 3 + gy * 7) % 17 == 0:
            draw.rectangle([gx, gy, gx + 2, gy + 2], fill="#f5d742") # dandelion
        elif (gx * 5 + gy * 11) % 23 == 0:
            draw.rectangle([gx, gy, gx + 2, gy + 2], fill="#ffffff") # daisy

# 3. Winding Cobblestone Village Road (Leading across the foreground)
road = [(0, 420), (200, 380), (440, 370), (660, 390), (W, 430), (W, H), (0, H)]
draw.polygon(road, fill="#4c5261")
draw.polygon([(0, 424), (200, 384), (440, 374), (660, 394), (W, 434), (W, H - 4), (0, H - 4)], fill="#636c80")
# Cobblestones on road
for rx in range(10, W - 10, 20):
    for ry in range(390, H - 10, 12):
        if (rx + ry) % 7 < 4:
            draw.line([(rx, ry), (rx + 10, ry + 3)], fill="#7a859e", width=2)
            draw.point((rx + 2, ry + 1), fill="#a5b0cb")

# 4. Sunlit Raised Bakery Stone Terrace / Workshop Apron
# Sits from x=60 to x=760, y=180 to y=390
apron_shadow = [(56, 320), (380, 176), (784, 320), (420, 404)]
draw.polygon(apron_shadow, fill="#252a36")
apron_base = [(60, 318), (380, 180), (780, 318), (420, 400)]
draw.polygon(apron_base, fill="#484f63")
# Top paved terrace surface
apron_top = [(64, 314), (380, 184), (776, 314), (420, 394)]
draw.polygon(apron_top, fill="#6b748f")

# Flagstone joint grid on terrace
for lx in range(90, 750, 45):
    draw.line([(lx, 314 + (lx - 420) * 0.1), (lx + 60, 230 + (lx - 420) * 0.1)], fill="#565e70", width=1)
for ly in range(210, 380, 28):
    draw.line([(120, ly), (720, ly + 20)], fill="#565e70", width=1)

# Stone terrace curbing / retaining wall
draw.polygon([(60, 318), (420, 400), (420, 406), (60, 324)], fill="#393e4d")
draw.polygon([(420, 400), (780, 318), (780, 324), (420, 406)], fill="#2c303c")

# 5. Place the Full Solid Medieval Bakery House!
# The authentic Settlers II Bakery House sits on the left side of the terrace
bakery_img = Image.open("/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png").convert("RGBA")
# Crop transparent padding
bbox = bakery_img.getbbox()
bakery_crop = bakery_img.crop(bbox)

# Paste house at (60, 45) so the roof and chimney rise into the sunny sky
canvas.paste(bakery_crop, (60, 45), bakery_crop)

# 6. Place Specialized Functional Props on the Terrace with ample breathing room
props = [
    # Left: Flour Pantry
    ("prop_bakery_flour_barrel_3q.png", 355, 235),
    # Center-Left: Kneading Workbench
    ("prop_bakery_dough_table_3q.png", 425, 245),
    # Wall Rack: Baker's Stick / Peel
    ("prop_bakery_peel_rack_3q.png", 395, 175),
    # Center-Right: Stone Hearth Oven (second outdoor oven or hearth focus)
    ("prop_bakery_hearth_3q.png", 515, 205),
    # Right: Multi-Tier Cooling Rack
    ("prop_bakery_cooling_rack_3q.png", 605, 225),
    # Front-Right: Shopfront Counter & Bread Basket
    ("prop_bakery_bread_basket_3q.png", 670, 290),
    ("prop_bakery_pretzel_sign_3q.png", 715, 205),
    # Foreground: Sparrow on cobblestone
    ("prop_bakery_sparrow_3q.png", 380, 350)
]

for pname, px, py in props:
    pimg = Image.open(f"/Users/hungpham/projects/harrow-settlers/art/out/sprites/{pname}").convert("RGBA")
    canvas.paste(pimg, (px, py), pimg)

# 7. Station Functional Labels (Grounded, elegant Settlers UI signage)
try:
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 12)
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
except:
    font_badge = ImageFont.load_default()
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()

# Station markers
stations = [
    (380, 220, "1. FLOUR PANTRY", "#38bdf8"),
    (460, 230, "2. KNEAD TABLE", "#facc15"),
    (550, 195, "3. HEARTH OVEN", "#fb923c"),
    (630, 215, "4. COOLING RACK", "#a3e635"),
    (710, 280, "5. SHOP COUNTER", "#f43f5e")
]

for sx, sy, sname, scol in stations:
    w = len(sname) * 7 + 10
    draw.rectangle([sx - 4, sy - 2, sx + w, sy + 14], fill="#1e2430", outline=scol, width=1)
    draw.text((sx, sy), sname, fill=scol, font=font_badge)

# Header banner
draw.rectangle([0, 0, W, 42], fill="#161b26")
draw.line([0, 42, W, 42], fill="#3b4252", width=2)
draw.text((16, 10), "HARROW BAKERY · AUTHENTIC MEDIEVAL BAKERY HOUSE", fill="#f5d742", font=font_title)
draw.text((W - 320, 14), "The Settlers II Aesthetic · Full Solid Architecture", fill="#c0caf5", font=font_sub)

out_file = "/Users/hungpham/projects/harrow-settlers/delivery-evidence/definitive_settlers_bakery_scene.png"
canvas.save(out_file, "PNG")
print("✅ Saved definitive bakery scene:", out_file)
