#!/usr/bin/env python3
"""
Test composition of the Solid Authentic Settlers II Bakery House
with vibrant sunny landscape, cobblestone terrace, and dedicated work stations.
"""
import PIL.Image as Image
import PIL.ImageDraw as ImageDraw

base_w, base_h = 720, 440
canvas = Image.new("RGBA", (base_w, base_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)

# 1. Vibrant Sunny Settlers II Sky & Meadow
# Sky gradient
for y in range(140):
    t = y / 140.0
    r = int(145 + t * (175 - 145))
    g = int(200 + t * (225 - 200))
    b = int(225 + t * (215 - 225))
    draw.line([(0, y), (base_w, y)], fill=(r, g, b, 255))

# Distant rolling hills & tree canopy
draw.polygon([(0, 110), (140, 95), (280, 115), (460, 90), (620, 110), (base_w, 95), (base_w, 150), (0, 150)], fill="#4d7835")
draw.polygon([(0, 125), (180, 110), (340, 128), (520, 108), (base_w, 122), (base_w, 160), (0, 160)], fill="#5d8f3c")

# Vibrant Green Meadow
draw.rectangle([0, 140, base_w, base_h], fill="#6ca33e")
# Grass texture & dandelions
for gx in range(0, base_w, 14):
    for gy in range(145, base_h, 12):
        draw.point((gx + (gy % 5), gy), fill="#82bd48")
        if (gx * 7 + gy * 13) % 29 == 0:
            draw.rectangle([gx, gy, gx + 2, gy + 2], fill="#f5d742") # dandelion

# Cobblestone village road (curving across foreground)
road_pts = [(0, 360), (160, 320), (380, 310), (560, 330), (base_w, 370), (base_w, base_h), (0, base_h)]
draw.polygon(road_pts, fill="#5a6070")
# Road highlight
draw.polygon([(0, 364), (160, 324), (380, 314), (560, 334), (base_w, 374), (base_w, base_h - 4), (0, base_h - 4)], fill="#747c91")

# 2. Raised Bakery Terrace & Paved Apron
# Broad polygonal terrace where the bakery and its working stations sit
terrace_pts = [(40, 260), (320, 150), (660, 260), (380, 370)]
draw.polygon(terrace_pts, fill="#484f63")
draw.polygon([(44, 258), (320, 152), (656, 258), (380, 366)], fill="#6b748f")

# Paste the complete solid Settlers II Bakery House!
bakery_img = Image.open("/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png").convert("RGBA")
# Scale slightly if needed
b_w, b_h = bakery_img.size
canvas.paste(bakery_img, (60, 10), bakery_img)

# Paste Specialized Props onto the sunlit terrace
props_to_paste = [
    ("prop_bakery_flour_barrel_3q.png", 360, 220),
    ("prop_bakery_dough_table_3q.png", 420, 230),
    ("prop_bakery_cooling_rack_3q.png", 530, 210),
    ("prop_bakery_bread_basket_3q.png", 490, 290),
    ("prop_bakery_pretzel_sign_3q.png", 610, 220),
    ("prop_bakery_sparrow_3q.png", 320, 340)
]

for pname, px, py in props_to_paste:
    pimg = Image.open(f"/Users/hungpham/projects/harrow-settlers/art/out/sprites/{pname}").convert("RGBA")
    canvas.paste(pimg, (px, py), pimg)

out_test = "/Users/hungpham/projects/harrow-settlers/delivery-evidence/test_solid_bakery_composition.png"
canvas.save(out_test, "PNG")
print("✅ Saved test composition:", out_test)
