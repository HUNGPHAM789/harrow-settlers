import os
from PIL import Image, ImageDraw, ImageFont

# Load assets
p_s_old = '/Users/hungpham/projects/harrow-settlers/art/out/hd128_settler/sprites/settler_baker_128.png'
p_s_new = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_128_v2.png'
p_b_old = '/Users/hungpham/projects/harrow-settlers/art/out/hd128_bakery/sprites/b_hd128_bakery.png'
p_b_new = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png'

s_old = Image.open(p_s_old).convert('RGBA')
s_new = Image.open(p_s_new).convert('RGBA')
b_old = Image.open(p_b_old).convert('RGBA')
b_new = Image.open(p_b_new).convert('RGBA')

# Crop tight to content
s_old_c = s_old.crop(s_old.getbbox())
s_new_c = s_new.crop(s_new.getbbox())
b_old_c = b_old.crop(b_old.getbbox())
b_new_c = b_new.crop(b_new.getbbox())

# Scale for display:
# Character 2x for clear visibility of micro-details
s_old_2x = s_old_c.resize((s_old_c.width * 2, s_old_c.height * 2), Image.Resampling.NEAREST)
s_new_2x = s_new_c.resize((s_new_c.width * 2, s_new_c.height * 2), Image.Resampling.NEAREST)

# Canvas dimensions
W = 1600
H = 960
canvas = Image.new('RGBA', (W, H), (15, 17, 24, 255))
draw = ImageDraw.Draw(canvas)

# Header Banner
draw.rectangle([(0, 0), (W, 70)], fill=(10, 12, 18, 255))
draw.line([(0, 70), (W, 70)], fill=(245, 185, 66, 255), width=2)
draw.text((40, 22), "HARROW SETTLERS // MODERN HD PIXEL ART UPGRADE AUDIT", fill=(245, 185, 66, 255))
draw.text((W - 480, 24), "100% Complete Architecture & Volumetric 128px Characters", fill=(180, 185, 200, 255))

# -------------------------------------------------------------
# COLUMN 1: PREVIOUS VERSION (INCOMPLETE & THIN)
# -------------------------------------------------------------
card1_x1, card1_y1, card1_x2, card1_y2 = 40, 90, 780, 920
draw.rounded_rectangle([(card1_x1, card1_y1), (card1_x2, card1_y2)], radius=12, fill=(22, 25, 34, 255), outline=(180, 70, 70, 255), width=2)
# Badge
draw.rounded_rectangle([(card1_x1 + 20, card1_y1 + 18), (card1_x1 + 340, card1_y1 + 48)], radius=6, fill=(50, 20, 20, 255))
draw.text((card1_x1 + 32, card1_y1 + 24), "❌ BẢN CŨ: THIẾU CHI TIẾT & BỊ 'HỔNG'", fill=(240, 100, 100, 255))

# Text points
draw.text((card1_x1 + 24, card1_y1 + 65), "• Nhà bánh: Thiếu tường bên phải (hở toang), cửa là hốc đen rỗng", fill=(170, 175, 190, 255))
draw.text((card1_x1 + 24, card1_y1 + 88), "• Không có cửa gỗ, thiếu mái dormer, thiếu cần cẩu bột, thiếu biển hiệu", fill=(170, 175, 190, 255))
draw.text((card1_x1 + 24, card1_y1 + 111), "• Dân làng 128px: Thân hình gầy mỏng (26px), tay que 5px, mắt chấm đen", fill=(170, 175, 190, 255))
draw.text((card1_x1 + 24, card1_y1 + 134), "• Thiếu vệt bột mì, thiếu túi đựng dụng cụ, thiếu mái che củi", fill=(170, 175, 190, 255))

# Divider line
draw.line([(card1_x1 + 20, card1_y1 + 160), (card1_x2 - 20, card1_y1 + 160)], fill=(40, 45, 60, 255), width=1)

# Placement: House Old on left, Settler Old 2x on right
# House Old
b_old_scaled = b_old_c.resize((int(b_old_c.width * 1.3), int(b_old_c.height * 1.3)), Image.Resampling.NEAREST)
canvas.paste(b_old_scaled, (card1_x1 + 30, card1_y2 - b_old_scaled.height - 40), b_old_scaled)

# Settler Old (2x scale)
canvas.paste(s_old_2x, (card1_x2 - s_old_2x.width - 60, card1_y2 - s_old_2x.height - 50), s_old_2x)
draw.text((card1_x2 - 190, card1_y2 - 35), "Dân cũ: Rộng 26px (Gầy)", fill=(200, 100, 100, 255))

# -------------------------------------------------------------
# COLUMN 2: NEW UPGRADED VERSION (100% COMPLETE & VOLUMETRIC)
# -------------------------------------------------------------
card2_x1, card2_y1, card2_x2, card2_y2 = 820, 90, 1560, 920
draw.rounded_rectangle([(card2_x1, card2_y1), (card2_x2, card2_y2)], radius=12, fill=(24, 28, 40, 255), outline=(245, 185, 66, 255), width=2)
# Badge
draw.rounded_rectangle([(card2_x1 + 20, card2_y1 + 18), (card2_x1 + 420, card2_y1 + 48)], radius=6, fill=(40, 48, 25, 255))
draw.text((card2_x1 + 32, card2_y1 + 24), "✅ BẢN MỚI: HOÀN THIỆN 100% & KHỐI ĐẶC AAA", fill=(120, 230, 140, 255))

# Text points
draw.text((card2_x1 + 24, card2_y1 + 65), "✓ Nhà bánh kín 100%: Tường 3D đặc, cửa gỗ sồi có bản lề sắt & then cài", fill=(210, 220, 240, 255))
draw.text((card2_x1 + 24, card2_y1 + 88), "✓ Mái ngói nung Settlers rực rỡ, mái nhô Dormer, cần trục ròng rọc tời bao bột", fill=(210, 220, 240, 255))
draw.text((card2_x1 + 24, card2_y1 + 111), "✓ Biển hiệu bánh quy xoắn mạ vàng (Pretzel), hiên thềm đá bậc tam cấp", fill=(210, 220, 240, 255))
draw.text((card2_x1 + 24, card2_y1 + 134), "✓ Dân làng Hans 128px vạm vỡ (64px), cơ bắp, xẻng nướng bánh, vệt bột mì", fill=(210, 220, 240, 255))

# Divider line
draw.line([(card2_x1 + 20, card2_y1 + 160), (card2_x2 - 20, card2_y1 + 160)], fill=(40, 50, 70, 255), width=1)

# Placement: House New on left, Settler New 2x on right
b_new_scaled = b_new_c.resize((int(b_new_c.width * 1.3), int(b_new_c.height * 1.3)), Image.Resampling.NEAREST)
canvas.paste(b_new_scaled, (card2_x1 + 30, card2_y2 - b_new_scaled.height - 40), b_new_scaled)

# Settler New (2x scale)
canvas.paste(s_new_2x, (card2_x2 - s_new_2x.width - 50, card2_y2 - s_new_2x.height - 50), s_new_2x)
draw.text((card2_x2 - 220, card2_y2 - 35), "Dân v2: Rộng 64px (Vạm vỡ)", fill=(120, 230, 140, 255))

# Save
out_p = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/modern_hd_character_house_upgrade_comparison.png'
canvas.save(out_p)
print(f"Comparison card saved to {out_p}, size={canvas.size}")
