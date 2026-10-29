import os
from PIL import Image, ImageDraw

p_hand = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_128_v2.png'
p_rig128 = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_rig_128.png'
p_rig65 = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/settler_baker_rig_65.png'
p_bakery = '/Users/hungpham/projects/harrow-settlers/art/out/sprites/b_hd128_bakery_complete.png'

hand_img = Image.open(p_hand).convert('RGBA')
rig128_img = Image.open(p_rig128).convert('RGBA')
rig65_img = Image.open(p_rig65).convert('RGBA')
bak_img = Image.open(p_bakery).convert('RGBA')

# Crop tight
hand_c = hand_img.crop(hand_img.getbbox())
rig128_c = rig128_img.crop(rig128_img.getbbox())
rig65_c = rig65_img.crop(rig65_img.getbbox())
bak_c = bak_img.crop(bak_img.getbbox())

# Scale for inspection card
hand_2x = hand_c.resize((hand_c.width * 2, hand_c.height * 2), Image.Resampling.NEAREST)
rig128_2x = rig128_c.resize((rig128_c.width * 2, rig128_c.height * 2), Image.Resampling.NEAREST)

W = 1600
H = 920
canvas = Image.new('RGBA', (W, H), (14, 16, 24, 255))
draw = ImageDraw.Draw(canvas)

# Header
draw.rectangle([(0, 0), (W, 70)], fill=(10, 12, 18, 255))
draw.line([(0, 70), (W, 70)], fill=(245, 185, 66, 255), width=2)
draw.text((40, 22), "HARROW SETTLERS // PIXEL ART METHODOLOGY AUDIT (LAST FORTRESS RIG vs HAND-DRAWN)", fill=(245, 185, 66, 255))
draw.text((W - 460, 24), "Solving Programmer Box Drawing with 3D Lambert IK Rig", fill=(180, 185, 200, 255))

# -------------------------------------------------------------
# CARD 1: HAND-DRAWN (c.rect / c.line)
# -------------------------------------------------------------
c1_x1, c1_y1, c1_x2, c1_y2 = 40, 90, 520, 880
draw.rounded_rectangle([(c1_x1, c1_y1), (c1_x2, c1_y2)], radius=12, fill=(24, 26, 36, 255), outline=(200, 70, 70, 255), width=2)
draw.rounded_rectangle([(c1_x1 + 16, c1_y1 + 16), (c1_x1 + 320, c1_y1 + 46)], radius=6, fill=(50, 20, 20, 255))
draw.text((c1_x1 + 24, c1_y1 + 22), "❌ BẢN VẼ TAY THỦ CÔNG (c.rect)", fill=(240, 100, 100, 255))

draw.text((c1_x1 + 20, c1_y1 + 60), "• Ghép từ các khối chữ nhật & đường thẳng cứng", fill=(170, 175, 190, 255))
draw.text((c1_x1 + 20, c1_y1 + 82), "• Không có độ cong hữu cơ của giải phẫu cơ bắp", fill=(170, 175, 190, 255))
draw.text((c1_x1 + 20, c1_y1 + 104), "• Ánh sáng phẳng (flat shading), viền gượng gạo", fill=(170, 175, 190, 255))
draw.text((c1_x1 + 20, c1_y1 + 126), "• Cảm giác programmer-art vẽ pixel mò mẫm", fill=(170, 175, 190, 255))

draw.line([(c1_x1 + 16, c1_y1 + 152), (c1_x2 - 16, c1_y1 + 152)], fill=(45, 48, 65, 255), width=1)
canvas.paste(hand_2x, (c1_x1 + (c1_x2 - c1_x1 - hand_2x.width) // 2, c1_y2 - hand_2x.height - 40), hand_2x)
draw.text((c1_x1 + 60, c1_y2 - 32), "Bản cũ: Các khối c.rect chắp vá", fill=(220, 100, 100, 255))

# -------------------------------------------------------------
# CARD 2: LAST FORTRESS 3D PARAMETRIC RIG (R55Hbody IK + Lambert)
# -------------------------------------------------------------
c2_x1, c2_y1, c2_x2, c2_y2 = 540, 90, 1020, 880
draw.rounded_rectangle([(c2_x1, c2_y1), (c2_x2, c2_y2)], radius=12, fill=(24, 28, 42, 255), outline=(245, 185, 66, 255), width=2)
draw.rounded_rectangle([(c2_x1 + 16, c2_y1 + 16), (c2_x1 + 380, c2_y1 + 46)], radius=6, fill=(40, 48, 25, 255))
draw.text((c2_x1 + 24, c2_y1 + 22), "✅ BẢN RIG 3D LAST FORTRESS (R55Hbody)", fill=(120, 230, 140, 255))

draw.text((c2_x1 + 20, c2_y1 + 60), "✓ 2-bone Inverse Kinematics (IK) tính khớp xương tự nhiên", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 82), "✓ 3D Capsule & Ellipsoid với pháp tuyến mặt (Lambert Normal)", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 104), "✓ 5-Tone Auto-Ramp: Sáng vàng nắng ấm -> Tối tím xanh sâu", fill=(210, 220, 240, 255))
draw.text((c2_x1 + 20, c2_y1 + 126), "✓ Tự động viền nét chọn lọc theo độ sâu (Selective Contour)", fill=(210, 220, 240, 255))

draw.line([(c2_x1 + 16, c2_y1 + 152), (c2_x2 - 16, c2_y1 + 152)], fill=(45, 52, 75, 255), width=1)
canvas.paste(rig128_2x, (c2_x1 + (c2_x2 - c2_x1 - rig128_2x.width) // 2, c2_y2 - rig128_2x.height - 40), rig128_2x)
draw.text((c2_x1 + 40, c2_y2 - 32), "Bản mới: Khối cơ bắp 3D tròn đầy, bóng đổ mịn", fill=(120, 230, 140, 255))

# -------------------------------------------------------------
# CARD 3: IN-GAME COMBINATION (COMPLETE BAKERY + RIG SETTLER)
# -------------------------------------------------------------
c3_x1, c3_y1, c3_x2, c3_y2 = 1040, 90, 1560, 880
draw.rounded_rectangle([(c3_x1, c3_y1), (c3_x2, c3_y2)], radius=12, fill=(20, 24, 34, 255), outline=(100, 140, 200, 255), width=2)
draw.rounded_rectangle([(c3_x1 + 16, c3_y1 + 16), (c3_x1 + 380, c3_y1 + 46)], radius=6, fill=(25, 35, 55, 255))
draw.text((c3_x1 + 24, c3_y1 + 22), "🏰 TỔ HỢP TRONG GAME: NHÀ + DÂN RIG", fill=(130, 190, 255, 255))

draw.text((c3_x1 + 20, c3_y1 + 60), "• Nhà bánh hoàn thiện 100% kết hợp cùng Dân làng Rig", fill=(200, 210, 230, 255))
draw.text((c3_x1 + 20, c3_y1 + 82), "• Tỷ lệ kích thước ăn khớp hoàn hảo (Human scale)", fill=(200, 210, 230, 255))
draw.text((c3_x1 + 20, c3_y1 + 104), "• Đồng nhất ngôn ngữ chiếu sáng hướng Tây-Bắc", fill=(200, 210, 230, 255))
draw.text((c3_x1 + 20, c3_y1 + 126), "• Cùng chuẩn nghệ thuật đỉnh cao của Last Fortress!", fill=(200, 210, 230, 255))

draw.line([(c3_x1 + 16, c3_y1 + 152), (c3_x2 - 16, c3_y1 + 152)], fill=(40, 48, 65, 255), width=1)

# Scaled bakery and rig settler together
bak_s = bak_c.resize((int(bak_c.width * 1.05), int(bak_c.height * 1.05)), Image.Resampling.NEAREST)
canvas.paste(bak_s, (c3_x1 + 20, c3_y2 - bak_s.height - 40), bak_s)

rig_game = rig128_c.resize((int(rig128_c.width * 1.05), int(rig128_c.height * 1.05)), Image.Resampling.NEAREST)
canvas.paste(rig_game, (c3_x2 - rig_game.width - 30, c3_y2 - rig_game.height - 45), rig_game)
draw.text((c3_x2 - 200, c3_y2 - 32), "Hans 128px trước tiệm bánh", fill=(130, 190, 255, 255))

out_p = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/settler_rig_vs_handdrawn_comparison.png'
canvas.save(out_p)
print(f"Saved comparison to {out_p}, size={canvas.size}")
