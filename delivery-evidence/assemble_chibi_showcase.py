import os
from PIL import Image, ImageDraw

p_chibi = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_chibi.png'
p_semi = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_semi_chibi.png'
p_bakery = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png'

chibi_raw = Image.open(p_chibi).convert('RGBA')
semi_raw = Image.open(p_semi).convert('RGBA')
bak_raw = Image.open(p_bakery).convert('RGBA')

# Crop tight to content
chibi_c = chibi_raw.crop(chibi_raw.getbbox())
semi_c = semi_raw.crop(semi_raw.getbbox())
bak_c = bak_raw.crop(bak_raw.getbbox())

# Scale for display cards (3x nearest neighbor for pixel art clarity)
chibi_3x = chibi_c.resize((chibi_c.width * 3, chibi_c.height * 3), Image.Resampling.NEAREST)
semi_3x = semi_c.resize((semi_c.width * 3, semi_c.height * 3), Image.Resampling.NEAREST)

W = 1600
H = 960
canvas = Image.new('RGBA', (W, H), (14, 16, 24, 255))
draw = ImageDraw.Draw(canvas)

# Header Bar
draw.rectangle([(0, 0), (W, 70)], fill=(10, 12, 18, 255))
draw.line([(0, 70), (W, 70)], fill=(245, 185, 66, 255), width=2)
draw.text((40, 22), "HARROW SETTLERS // PXL PARAMETRIC RIG: CHIBI vs SEMI-CHIBI (REGULAR WEIGHT)", fill=(245, 185, 66, 255))
draw.text((W - 460, 24), "100% PXL Engine Driven by Numerical Ratios (Zero Hand-Drawing)", fill=(180, 185, 200, 255))

# -------------------------------------------------------------
# CARD 1: CHIBI VERSION (Cute 1:2.8 Ratio)
# -------------------------------------------------------------
c1_x1, c1_y1, c1_x2, c1_y2 = 40, 95, 520, 920
draw.rounded_rectangle([(c1_x1, c1_y1), (c1_x2, c1_y2)], radius=12, fill=(24, 28, 40, 255), outline=(245, 150, 180, 255), width=2)
# Badge
draw.rounded_rectangle([(c1_x1 + 16, c1_y1 + 16), (c1_x1 + 340, c1_y1 + 46)], radius=6, fill=(55, 25, 38, 255))
draw.text((c1_x1 + 24, c1_y1 + 22), "🌸 CHIBI VERSION (Tỷ lệ 1:2.8 Đáng Yêu)", fill=(255, 170, 200, 255))

draw.text((c1_x1 + 20, c1_y1 + 60), "• Tỷ lệ đầu/thân: 1:2.8 (Đầu to đáng yêu, má phúng phính)", fill=(210, 220, 240, 255))
draw.text((c1_x1 + 20, c1_y1 + 84), "• Mắt to tròn lấp lánh (Catchlight kép), má hồng phớt xinh", fill=(210, 220, 240, 255))
draw.text((c1_x1 + 20, c1_y1 + 108), "• Thân hình mềm mại, người bình thường (build: 0.90, KHÔNG cơ bắp)", fill=(210, 220, 240, 255))
draw.text((c1_x1 + 20, c1_y1 + 132), "• Tay chân ngắn xinh (limbLen: 0.58), xẻng bánh nhỏ gọn", fill=(210, 220, 240, 255))
draw.text((c1_x1 + 20, c1_y1 + 156), "• Phong cách: Animal Crossing / Kingdom Rush / PopCap", fill=(245, 185, 66, 255))

draw.line([(c1_x1 + 16, c1_y1 + 185), (c1_x2 - 16, c1_y1 + 185)], fill=(45, 50, 70, 255), width=1)
# Center the 3x sprite
canvas.paste(chibi_3x, (c1_x1 + (c1_x2 - c1_x1 - chibi_3x.width) // 2, c1_y2 - chibi_3x.height - 40), chibi_3x)
draw.text((c1_x1 + 90, c1_y2 - 32), "Chibi Hans: s=1.15, build=0.90", fill=(255, 170, 200, 255))

# -------------------------------------------------------------
# CARD 2: SEMI-CHIBI VERSION (Classic Settlers II 1:4.0 Golden Ratio)
# -------------------------------------------------------------
c2_x1, c2_y1, c2_x2, c2_y2 = 540, 95, 1020, 920
draw.rounded_rectangle([(c2_x1, c2_y1), (c2_x2, c2_y2)], radius=12, fill=(24, 28, 42, 255), outline=(245, 185, 66, 255), width=2)
# Badge
draw.rounded_rectangle([(c2_x1 + 16, c2_y1 + 16), (c2_x1 + 380, c2_y1 + 46)], radius=6, fill=(45, 40, 20, 255))
draw.text((c2_x1 + 24, c2_y1 + 22), "⭐ SEMI-CHIBI (Tỷ lệ 1:4.0 Chuẩn Settlers II)", fill=(245, 185, 66, 255))

draw.text((c2_x1 + 20, c2_y1 + 60), "• Tỷ lệ đầu/thân: 1:4.0 (Tỷ lệ vàng phong cách Trung Cổ)", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 84), "• Đầu vừa vặn, ánh nhìn biểu cảm, ria mép cong Bavarian", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 108), "• Thân hình cân đối, người bình thường (build: 0.96, KHÔNG cuồn cuộn)", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 132), "• Tay chân dài vừa phải (limbLen: 0.82), xẻng nướng bánh dài", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 156), "• Phong cách: The Settlers II / Final Fantasy Tactics / Anno", fill=(120, 230, 140, 255))

draw.line([(c2_x1 + 16, c2_y1 + 185), (c2_x2 - 16, c2_y1 + 185)], fill=(45, 52, 75, 255), width=1)
canvas.paste(semi_3x, (c2_x1 + (c2_x2 - c2_x1 - semi_3x.width) // 2, c2_y2 - semi_3x.height - 40), semi_3x)
draw.text((c2_x1 + 80, c2_y2 - 32), "Semi-Chibi Hans: s=1.25, build=0.96", fill=(245, 185, 66, 255))

# -------------------------------------------------------------
# CARD 3: IN-GAME BUILDING COMPARISON
# -------------------------------------------------------------
c3_x1, c3_y1, c3_x2, c3_y2 = 1040, 95, 1560, 920
draw.rounded_rectangle([(c3_x1, c3_y1), (c3_x2, c3_y2)], radius=12, fill=(20, 24, 34, 255), outline=(100, 160, 240, 255), width=2)
# Badge
draw.rounded_rectangle([(c3_x1 + 16, c3_y1 + 16), (c3_x1 + 380, c3_y1 + 46)], radius=6, fill=(25, 38, 55, 255))
draw.text((c3_x1 + 24, c3_y1 + 22), "🏰 SO SÁNH TỶ LỆ TRỰC DIỆN TRONG GAME", fill=(130, 190, 255, 255))

draw.text((c3_x1 + 20, c3_y1 + 60), "• Đặt trực tiếp 2 phiên bản trước Tiệm Bánh Mì Hoàn Thiện", fill=(200, 210, 230, 255))
draw.text((c3_x1 + 20, c3_y1 + 84), "• Cả 2 đều dùng 100% Rig PXL 3D Lambert (KHÔNG vẽ tay)", fill=(200, 210, 230, 255))
draw.text((c3_x1 + 20, c3_y1 + 108), "• Chibi: Hợp game casual, kawaii, nổi bật trên mobile", fill=(255, 170, 200, 255))
draw.text((c3_x1 + 20, c3_y1 + 132), "• Semi-Chibi: Chuẩn kinh điển Settlers II hoài niệm", fill=(245, 185, 66, 255))

draw.line([(c3_x1 + 16, c3_y1 + 185), (c3_x2 - 16, c3_y1 + 185)], fill=(40, 48, 65, 255), width=1)

# Scaled bakery
bak_s = bak_c.resize((int(bak_c.width * 1.05), int(bak_c.height * 1.05)), Image.Resampling.NEAREST)
canvas.paste(bak_s, (c3_x1 + 10, c3_y2 - bak_s.height - 40), bak_s)

# Place Chibi (scaled 1.2x) on the left
chibi_game = chibi_c.resize((int(chibi_c.width * 1.25), int(chibi_c.height * 1.25)), Image.Resampling.NEAREST)
canvas.paste(chibi_game, (c3_x2 - 180, c3_y2 - chibi_game.height - 45), chibi_game)
draw.text((c3_x2 - 185, c3_y2 - 32), "Chibi (Trái)", fill=(255, 170, 200, 255))

# Place Semi-Chibi (scaled 1.2x) on the right
semi_game = semi_c.resize((int(semi_c.width * 1.25), int(semi_c.height * 1.25)), Image.Resampling.NEAREST)
canvas.paste(semi_game, (c3_x2 - 95, c3_y2 - semi_game.height - 45), semi_game)
draw.text((c3_x2 - 105, c3_y2 - 32), "Semi (Phải)", fill=(245, 185, 66, 255))

out_p = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/chibi_and_semi_chibi_showcase.png'
canvas.save(out_p)
print(f"Saved chibi & semi-chibi showcase to {out_p}, size={canvas.size}")
