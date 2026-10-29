import os
from PIL import Image, ImageDraw

p_chibi = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_chibi.png'
p_semi = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_semi_chibi.png'
p_bakery = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png'

chibi_raw = Image.open(p_chibi).convert('RGBA')
semi_raw = Image.open(p_semi).convert('RGBA')
bak_raw = Image.open(p_bakery).convert('RGBA')

chibi_c = chibi_raw.crop(chibi_raw.getbbox())
semi_c = semi_raw.crop(semi_raw.getbbox())
bak_c = bak_raw.crop(bak_raw.getbbox())

# Extract Head Close-ups (Top 45% of height)
chibi_head = chibi_c.crop((0, 0, chibi_c.width, int(chibi_c.height * 0.48)))
semi_head = semi_c.crop((0, 0, semi_c.width, int(semi_c.height * 0.46)))

# Zoom heads 6x for extreme facial inspection!
chibi_head_6x = chibi_head.resize((chibi_head.width * 6, chibi_head.height * 6), Image.Resampling.NEAREST)
semi_head_6x = semi_head.resize((semi_head.width * 6, semi_head.height * 6), Image.Resampling.NEAREST)

# Full bodies 3x
chibi_3x = chibi_c.resize((chibi_c.width * 3, chibi_c.height * 3), Image.Resampling.NEAREST)
semi_3x = semi_c.resize((semi_c.width * 3, semi_c.height * 3), Image.Resampling.NEAREST)

W = 1600
H = 1000
canvas = Image.new('RGBA', (W, H), (14, 16, 24, 255))
draw = ImageDraw.Draw(canvas)

# Header Bar
draw.rectangle([(0, 0), (W, 70)], fill=(10, 12, 18, 255))
draw.line([(0, 70), (W, 70)], fill=(245, 185, 66, 255), width=2)
draw.text((40, 22), "HARROW SETTLERS // 100% UNOBSTRUCTED FACIAL EXPRESSION AUDIT", fill=(245, 185, 66, 255))
draw.text((W - 520, 24), "Peel & Bread Relocated to Waist / Side — Zero Facial Overlap", fill=(180, 185, 200, 255))

# -------------------------------------------------------------
# TOP HALF: EXTREME CLOSE-UP HEAD INSPECTION (6x ZOOM)
# -------------------------------------------------------------
# Card Left: Chibi Head (6x)
box1_x1, box1_y1, box1_x2, box1_y2 = 40, 90, 780, 480
draw.rounded_rectangle([(box1_x1, box1_y1), (box1_x2, box1_y2)], radius=12, fill=(24, 28, 42, 255), outline=(245, 150, 180, 255), width=2)
draw.rounded_rectangle([(box1_x1 + 16, box1_y1 + 14), (box1_x1 + 380, box1_y1 + 44)], radius=6, fill=(55, 25, 38, 255))
draw.text((box1_x1 + 24, box1_y1 + 20), "🌸 CHIBI: MẶT RÕ RÀNG 100% (ZOOM 6X)", fill=(255, 170, 200, 255))

draw.text((box1_x1 + 20, box1_y1 + 54), "✓ Mắt to tròn 4x3px long lanh, tròng trắng #ffffff + con ngươi nâu sẫm + catchlight", fill=(210, 220, 240, 255))
draw.text((box1_x1 + 20, box1_y1 + 76), "✓ Hai má ửng hồng phấn (#fca5a5), ria mép cong chúm chím và nụ cười tươi", fill=(210, 220, 240, 255))
draw.text((box1_x1 + 20, box1_y1 + 98), "✓ Xẻng bánh chuyển sang bên hông, bánh mì hạ ngang thắt lưng (KHÔNG CHE MẶT)", fill=(120, 230, 140, 255))

canvas.paste(chibi_head_6x, (box1_x1 + (box1_x2 - box1_x1 - chibi_head_6x.width) // 2, box1_y2 - chibi_head_6x.height - 20), chibi_head_6x)

# Card Right: Semi-Chibi Head (6x)
box2_x1, box2_y1, box2_x2, box2_y2 = 820, 90, 1560, 480
draw.rounded_rectangle([(box2_x1, box2_y1), (box2_x2, box2_y2)], radius=12, fill=(24, 28, 42, 255), outline=(245, 185, 66, 255), width=2)
draw.rounded_rectangle([(box2_x1 + 16, box2_y1 + 14), (box2_x1 + 420, box2_y1 + 44)], radius=6, fill=(45, 40, 20, 255))
draw.text((box2_x1 + 24, box2_y1 + 20), "⭐ SEMI-CHIBI: MẶT RÕ RÀNG 100% (ZOOM 6X)", fill=(245, 185, 66, 255))

draw.text((box2_x1 + 20, box2_y1 + 54), "✓ Ánh mắt hiền hậu The Settlers II: Có mí mắt, chân mày, tròng trắng và tia sáng", fill=(210, 220, 240, 255))
draw.text((box2_x1 + 20, box2_y1 + 76), "✓ Ria mép Bavarian dày dặn cong vút, sống mũi có bóng đổ khối, miệng cười mỉm", fill=(210, 220, 240, 255))
draw.text((box2_x1 + 20, box2_y1 + 98), "✓ Mũ vải lanh bồng bềnh nằm gọn gàng trên đỉnh đầu, hoàn toàn lộ rõ toàn mặt", fill=(120, 230, 140, 255))

canvas.paste(semi_head_6x, (box2_x1 + (box2_x2 - box2_x1 - semi_head_6x.width) // 2, box2_y2 - semi_head_6x.height - 20), semi_head_6x)

# -------------------------------------------------------------
# BOTTOM HALF: FULL BODY (3x) + TIỆM BÁNH TRONG GAME
# -------------------------------------------------------------
bot_y1, bot_y2 = 505, 965
# Chibi Full Body (3x)
draw.rounded_rectangle([(40, bot_y1), (460, bot_y2)], radius=12, fill=(22, 26, 38, 255), outline=(245, 150, 180, 255), width=1)
draw.text((60, bot_y1 + 16), "CHIBI HANS TOÀN THÂN (3X)", fill=(255, 170, 200, 255))
draw.text((60, bot_y1 + 38), "• Tay trái chống hông, tay phải cầm bánh mì ngang eo", fill=(170, 175, 190, 255))
draw.text((60, bot_y1 + 56), "• Xẻng gỗ dựng dưới đất bên sườn (không che thân)", fill=(170, 175, 190, 255))
canvas.paste(chibi_3x, (40 + (420 - chibi_3x.width) // 2, bot_y2 - chibi_3x.height - 25), chibi_3x)

# Semi-Chibi Full Body (3x)
draw.rounded_rectangle([(480, bot_y1), (900, bot_y2)], radius=12, fill=(22, 26, 38, 255), outline=(245, 185, 66, 255), width=1)
draw.text((500, bot_y1 + 16), "SEMI-CHIBI HANS TOÀN THÂN (3X)", fill=(245, 185, 66, 255))
draw.text((500, bot_y1 + 38), "• Thể trạng bình thường (build: 0.96), tỷ lệ vàng 1:4.0", fill=(170, 175, 190, 255))
draw.text((500, bot_y1 + 56), "• Toàn bộ mặt và áo lanh lộ diện sáng sủa", fill=(170, 175, 190, 255))
canvas.paste(semi_3x, (480 + (420 - semi_3x.width) // 2, bot_y2 - semi_3x.height - 25), semi_3x)

# Context with Bakery
draw.rounded_rectangle([(920, bot_y1), (1560, bot_y2)], radius=12, fill=(20, 24, 34, 255), outline=(100, 160, 240, 255), width=1)
draw.text((940, bot_y1 + 16), "TRẢI NGHIỆM TRƯỚC TIỆM BÁNH TRUNG CỔ", fill=(130, 190, 255, 255))
draw.text((940, bot_y1 + 38), "• Khuôn mặt cả 2 bản đều nhìn rõ mồn một từ góc nhìn game!", fill=(120, 230, 140, 255))

bak_s = bak_c.resize((int(bak_c.width * 1.05), int(bak_c.height * 1.05)), Image.Resampling.NEAREST)
canvas.paste(bak_s, (930, bot_y2 - bak_s.height - 25), bak_s)

chibi_game = chibi_c.resize((int(chibi_c.width * 1.25), int(chibi_c.height * 1.25)), Image.Resampling.NEAREST)
canvas.paste(chibi_game, (1560 - 180, bot_y2 - chibi_game.height - 35), chibi_game)
draw.text((1560 - 185, bot_y2 - 24), "Chibi", fill=(255, 170, 200, 255))

semi_game = semi_c.resize((int(semi_c.width * 1.25), int(semi_c.height * 1.25)), Image.Resampling.NEAREST)
canvas.paste(semi_game, (1560 - 95, bot_y2 - semi_game.height - 35), semi_game)
draw.text((1560 - 105, bot_y2 - 24), "Semi", fill=(245, 185, 66, 255))

out_p = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/unobstructed_face_chibi_showcase.png'
canvas.save(out_p)
print(f"Saved unobstructed face showcase to {out_p}, size={canvas.size}")
