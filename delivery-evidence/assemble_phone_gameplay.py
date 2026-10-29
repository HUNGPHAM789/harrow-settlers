import math
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (Smartphone frame: 1360x880, screen: 1280x720)
SCREEN_W, SCREEN_H = 1280, 720
BEZEL_X, BEZEL_Y = 40, 80
CANVAS_W, CANVAS_H = 1360, 880

# 1. Create Base Canvas with dark desk background
canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (14, 16, 22, 255))
draw = ImageDraw.Draw(canvas)

# Phone outer titanium/matte body
draw.rounded_rectangle([(BEZEL_X - 16, BEZEL_Y - 16), (BEZEL_X + SCREEN_W + 16, BEZEL_Y + SCREEN_H + 16)], radius=36, fill=(28, 30, 36, 255), outline=(55, 60, 75, 255), width=3)
# Screen bezel border
draw.rounded_rectangle([(BEZEL_X - 4, BEZEL_Y - 4), (BEZEL_X + SCREEN_W + 4, BEZEL_Y + SCREEN_H + 4)], radius=24, fill=(5, 5, 8, 255))

# 2. Render Screen Surface (1280x720)
screen = Image.new('RGBA', (SCREEN_W, SCREEN_H), (68, 128, 62, 255)) # Lush Bavarian Grass base
s_draw = ImageDraw.Draw(screen)

# Draw Isometric Terrain Grid & Textures (Authentic Settlers II vibrant sunny green)
TILE_W, TILE_H = 64, 32
for ty in range(-4, 28):
    for tx in range(-4, 28):
        sx = (tx - ty) * (TILE_W // 2) + 640
        sy = (tx + ty) * (TILE_H // 2) + 80
        # Checkerboard grass tones
        grass_col = (76, 142, 68, 255) if (tx + ty) % 2 == 0 else (72, 134, 64, 255)
        pts = [
            (sx, sy),
            (sx + TILE_W // 2, sy + TILE_H // 2),
            (sx, sy + TILE_H),
            (sx - TILE_W // 2, sy + TILE_H // 2)
        ]
        s_draw.polygon(pts, fill=grass_col)
        # Subtle grass blade highlights
        if (tx * 7 + ty * 13) % 5 == 0:
            s_draw.line([(sx - 2, sy + 14), (sx - 1, sy + 10)], fill=(98, 178, 86, 255), width=1)
        if (tx * 11 + ty * 3) % 7 == 0:
            s_draw.ellipse([(sx + 4, sy + 12), (sx + 7, sy + 15)], fill=(245, 220, 100, 255)) # tiny wildflowers

# 3. Draw Winding Cobblestone Road Network
road_pts = [
    (140, 560), (320, 480), (520, 420), (740, 380), (960, 360), (1180, 320)
]
for i in range(len(road_pts) - 1):
    p1 = road_pts[i]
    p2 = road_pts[i + 1]
    # Draw wide road path
    for offset in range(-16, 17, 2):
        s_draw.line([(p1[0], p1[1] + offset), (p2[0], p2[1] + offset)], fill=(145, 138, 122, 255), width=3)
    # Road edges with river pebbles
    for step in range(0, 100, 10):
        t = step / 100.0
        rx = p1[0] * (1 - t) + p2[0] * t
        ry = p1[1] * (1 - t) + p2[1] * t
        s_draw.ellipse([(rx - 14, ry - 14), (rx - 10, ry - 10)], fill=(110, 105, 95, 255))
        s_draw.ellipse([(rx + 10, ry + 10), (rx + 14, ry + 14)], fill=(168, 160, 142, 255))

# Branch road leading to Bakery Porch
branch_pts = [(520, 420), (500, 360), (460, 320)]
for i in range(len(branch_pts) - 1):
    p1 = branch_pts[i]
    p2 = branch_pts[i + 1]
    for offset in range(-12, 13, 2):
        s_draw.line([(p1[0] + offset, p1[1]), (p2[0] + offset, p2[1])], fill=(150, 142, 126, 255), width=3)

# 4. Load & Paste Upgraded Assets
# A. Upgraded Complete Bakery
p_bakery = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png'
bakery_raw = Image.open(p_bakery).convert('RGBA')
b_bbox = bakery_raw.getbbox()
bakery_crop = bakery_raw.crop(b_bbox)

# Super-sampling scale in-game: approx 0.85x scale on landscape 720p screen
bakery_game_w = int(bakery_crop.width * 0.95)
bakery_game_h = int(bakery_crop.height * 0.95)
bakery_scaled = bakery_crop.resize((bakery_game_w, bakery_game_h), Image.Resampling.LANCZOS)

# Position Bakery
bak_x = 340
bak_y = 60
screen.paste(bakery_scaled, (bak_x, bak_y), bakery_scaled)

# B. Upgraded 128px Baker Hans (Walking along road with his fresh sourdough loaf!)
p_settler = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_128_v2.png'
settler_raw = Image.open(p_settler).convert('RGBA')
s_bbox = settler_raw.getbbox()
settler_crop = settler_raw.crop(s_bbox)

# Scale Settler to game ratio (0.95x matching bakery)
settler_game_w = int(settler_crop.width * 0.95)
settler_game_h = int(settler_crop.height * 0.95)
settler_scaled = settler_crop.resize((settler_game_w, settler_game_h), Image.Resampling.LANCZOS)

# Place Baker Hans on the road near his bakery
hans_x = 580
hans_y = 350
screen.paste(settler_scaled, (hans_x, hans_y), settler_scaled)

# Name & Activity Tag above Baker Hans
tag_w, tag_h = 130, 26
s_draw.rounded_rectangle([(hans_x - 30, hans_y - 32), (hans_x - 30 + tag_w, hans_y - 32 + tag_h)], radius=6, fill=(15, 18, 26, 220), outline=(245, 185, 66, 255), width=1)
s_draw.text((hans_x - 22, hans_y - 28), "🥖 Hans (Thợ Bánh)", fill=(245, 185, 66, 255))

# C. Background Secondary Settler (Carrying firewood to oven)
# Flip settler and scale down slightly for depth
porter_scaled = settler_crop.resize((int(settler_crop.width * 0.70), int(settler_crop.height * 0.70)), Image.Resampling.LANCZOS).transpose(Image.FLIP_LEFT_RIGHT)
screen.paste(porter_scaled, (320, 280), porter_scaled)

# 5. Render Clean Modern Mobile HUD
# Top Bar: Resources Banner
s_draw.rectangle([(0, 0), (SCREEN_W, 54)], fill=(18, 22, 32, 230))
s_draw.line([(0, 54), (SCREEN_W, 54)], fill=(245, 185, 66, 200), width=2)

res_items = [
    ("💰 Vàng:", "1,450", (255, 215, 60)),
    ("🥖 Bánh Mì:", "128", (240, 160, 60)),
    ("🪵 Gỗ:", "210", (180, 120, 70)),
    ("🪨 Đá:", "95", (150, 165, 190)),
    ("🌾 Lúa Mì:", "340", (230, 200, 90)),
    ("👥 Dân Cư:", "24/30", (120, 220, 140))
]
rx_pos = 30
for label, val, col in res_items:
    s_draw.text((rx_pos, 16), label, fill=(180, 185, 200, 255))
    s_draw.text((rx_pos + 65, 16), val, fill=col)
    rx_pos += 165

# Top Right Controls (Speed & Pause)
s_draw.rounded_rectangle([(SCREEN_W - 170, 10), (SCREEN_W - 110, 44)], radius=8, fill=(35, 42, 60, 255), outline=(70, 85, 120, 255), width=1)
s_draw.text((SCREEN_W - 152, 17), "▶▶ 2X", fill=(245, 185, 66, 255))
s_draw.rounded_rectangle([(SCREEN_W - 90, 10), (SCREEN_W - 30, 44)], radius=8, fill=(35, 42, 60, 255), outline=(70, 85, 120, 255), width=1)
s_draw.text((SCREEN_W - 68, 17), "⏸", fill=(200, 210, 230, 255))

# Bottom Left: Mini-Map Compass Widget
map_x, map_y = 30, SCREEN_H - 140
s_draw.rounded_rectangle([(map_x, map_y), (map_x + 120, map_y + 110)], radius=12, fill=(18, 22, 32, 220), outline=(245, 185, 66, 255), width=2)
# Mini map grid simulation
s_draw.rectangle([(map_x + 10, map_y + 10), (map_x + 110, map_y + 80)], fill=(45, 80, 40, 255))
s_draw.ellipse([(map_x + 45, map_y + 35), (map_x + 65, map_y + 55)], fill=(180, 80, 40, 255)) # town center dot
s_draw.ellipse([(map_x + 52, map_y + 42), (map_x + 58, map_y + 48)], fill=(255, 255, 255, 255)) # camera view
s_draw.text((map_x + 22, map_y + 86), "BẢN ĐỒ HARROW", fill=(200, 210, 230, 255))

# Bottom Right: Big Golden Action Build Hammer Button
btn_r = 44
btn_cx, btn_cy = SCREEN_W - 75, SCREEN_H - 75
s_draw.ellipse([(btn_cx - btn_r, btn_cy - btn_r), (btn_cx + btn_r, btn_cy + btn_r)], fill=(245, 185, 66, 255), outline=(255, 240, 160, 255), width=3)
s_draw.ellipse([(btn_cx - btn_r + 4, btn_cy - btn_r + 4), (btn_cx + btn_r - 4, btn_cy + btn_r - 4)], fill=(210, 140, 30, 255))
s_draw.text((btn_cx - 16, btn_cy - 16), "🔨", fill=(255, 255, 255, 255))

# Notification Toast (Top Center)
toast_w, toast_h = 420, 38
toast_x = (SCREEN_W - toast_w) // 2
toast_y = 66
s_draw.rounded_rectangle([(toast_x, toast_y), (toast_x + toast_w, toast_y + toast_h)], radius=8, fill=(20, 25, 36, 240), outline=(120, 220, 140, 200), width=1)
s_draw.text((toast_x + 18, toast_y + 10), "✨ Lò bánh mì vừa xuất xưởng mẻ bánh thơm lừng (+12 Bánh)", fill=(120, 230, 140, 255))

# Camera Watermark
s_draw.text((SCREEN_W - 270, SCREEN_H - 30), "HARROW ENGINE // RETINA HIDPI", fill=(120, 130, 150, 180))

# 6. Paste Screen into Smartphone Bezel
canvas.paste(screen, (BEZEL_X, BEZEL_Y))

# Dynamic Island / Camera Punch-hole at left
cam_x, cam_y = BEZEL_X + 24, BEZEL_Y + SCREEN_H // 2
draw.ellipse([(cam_x - 7, cam_y - 7), (cam_x + 7, cam_y + 7)], fill=(0, 0, 0, 255), outline=(40, 45, 55, 255), width=1)

# Save phone landscape mockup
out_phone = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/phone_landscape_upgraded_gameplay.png'
canvas.save(out_phone)
print(f"Saved phone landscape upgraded gameplay: {out_phone}, size={canvas.size}")

# Also save standalone screen-only for 100% pixel inspection
out_screen = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/phone_landscape_upgraded_screen_only.png'
screen.save(out_screen)
print(f"Saved screen only: {out_screen}, size={screen.size}")
