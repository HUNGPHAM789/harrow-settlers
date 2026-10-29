import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

# Load the 3 GIF animations
p_idle = '/Users/hungpham/projects/harrow-settlers/art/out/anims/anim_chibi_baker_idle.gif'
p_walk = '/Users/hungpham/projects/harrow-settlers/art/out/anims/anim_chibi_baker_walk.gif'
p_knead = '/Users/hungpham/projects/harrow-settlers/art/out/anims/anim_chibi_baker_knead.gif'

def extract_frames(gif_path):
    im = Image.open(gif_path)
    frames = []
    try:
        while True:
            frames.append(im.copy().convert('RGBA'))
            im.seek(im.tell() + 1)
    except EOFError:
        pass
    return frames

f_idle = extract_frames(p_idle)
f_walk = extract_frames(p_walk)
f_knead = extract_frames(p_knead)

# Master animation loop: 24 frames at 12 fps (exactly 2.0 seconds seamless loop)
NUM_FRAMES = 24
FPS = 12
CANVAS_W, CANVAS_H = 1280, 720
SCALE = 3.6 # upscale chibi sprites for clear viewing

out_frames = []

for idx in range(NUM_FRAMES):
    # Base Canvas
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (15, 18, 26, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Header Banner
    draw.rectangle([(0, 0), (CANVAS_W, 70)], fill=(10, 12, 18, 255))
    draw.line([(0, 70), (CANVAS_W, 70)], fill=(245, 185, 66, 255), width=2)
    draw.text((40, 22), "HARROW SETTLERS // CHIBI BAKER ANIMATION CYCLE (THE WUSELFAKTOR LOOP)", fill=(245, 185, 66, 255))
    draw.text((CANVAS_W - 460, 24), "100% PXL Parametric 3D Shaded Rig • 12 FPS Seamless Loop", fill=(180, 185, 200, 255))
    
    # -----------------------------------------------------------------
    # CARD 1: IDLE / WAITING
    # -----------------------------------------------------------------
    c1_x1, c1_y1, c1_x2, c1_y2 = 40, 95, 420, 680
    draw.rounded_rectangle([(c1_x1, c1_y1), (c1_x2, c1_y2)], radius=12, fill=(24, 28, 42, 255), outline=(100, 160, 240, 255), width=2)
    draw.rounded_rectangle([(c1_x1 + 16, c1_y1 + 16), (c1_x1 + 300, c1_y1 + 46)], radius=6, fill=(25, 40, 65, 255))
    draw.text((c1_x1 + 24, c1_y1 + 22), "1. IDLE // NGHỈ NGƠI THỞ NHẸ", fill=(130, 190, 255, 255))
    
    draw.text((c1_x1 + 20, c1_y1 + 60), "• Thở nhịp nhàng, lồng ngực nhấp nhô nhẹ", fill=(200, 210, 230, 255))
    draw.text((c1_x1 + 20, c1_y1 + 82), "• Chớp mắt tự nhiên, mũ lanh bồng bềnh", fill=(200, 210, 230, 255))
    draw.text((c1_x1 + 20, c1_y1 + 104), "• Trạng thái chờ nguyên liệu / canh lò", fill=(120, 230, 140, 255))
    draw.line([(c1_x1 + 16, c1_y1 + 130), (c1_x2 - 16, c1_y1 + 130)], fill=(40, 48, 65, 255), width=1)
    
    # Frame selection (4 frames repeating)
    frame_i = f_idle[idx % len(f_idle)]
    fi_crop = frame_i.crop(frame_i.getbbox())
    fi_scaled = fi_crop.resize((int(fi_crop.width * SCALE), int(fi_crop.height * SCALE)), Image.Resampling.NEAREST)
    canvas.paste(fi_scaled, (c1_x1 + (c1_x2 - c1_x1 - fi_scaled.width) // 2, c1_y2 - fi_scaled.height - 40), fi_scaled)
    draw.text((c1_x1 + 100, c1_y2 - 30), "4 Frames (4 FPS)", fill=(130, 190, 255, 255))
    
    # -----------------------------------------------------------------
    # CARD 2: KNEADING DOUGH (THE ACTION HERO)
    # -----------------------------------------------------------------
    c2_x1, c2_y1, c2_x2, c2_y2 = 450, 95, 830, 680
    draw.rounded_rectangle([(c2_x1, c2_y1), (c2_x2, c2_y2)], radius=12, fill=(26, 28, 44, 255), outline=(245, 185, 66, 255), width=2)
    draw.rounded_rectangle([(c2_x1 + 16, c2_y1 + 16), (c2_x1 + 330, c2_y1 + 46)], radius=6, fill=(50, 42, 20, 255))
    draw.text((c2_x1 + 24, c2_y1 + 22), "2. KNEAD // NHÀO BỘT TRÊN BÀN", fill=(245, 185, 66, 255))
    
    draw.text((c2_x1 + 20, c2_y1 + 60), "• Hai tay ấn mạnh nhào bột xẹp xuống", fill=(210, 220, 240, 255))
    draw.text((c2_x1 + 20, c2_y1 + 82), "• Cục bột nảy đàn hồi trên bàn gỗ sồi", fill=(210, 220, 240, 255))
    draw.text((c2_x1 + 20, c2_y1 + 104), "• Thân người chúi về phía trước dồn lực", fill=(120, 230, 140, 255))
    draw.line([(c2_x1 + 16, c2_y1 + 130), (c2_x2 - 16, c2_y1 + 130)], fill=(50, 48, 60, 255), width=1)
    
    frame_k = f_knead[idx % len(f_knead)]
    fk_crop = frame_k.crop(frame_k.getbbox())
    fk_scaled = fk_crop.resize((int(fk_crop.width * SCALE), int(fk_crop.height * SCALE)), Image.Resampling.NEAREST)
    canvas.paste(fk_scaled, (c2_x1 + (c2_x2 - c2_x1 - fk_scaled.width) // 2, c2_y2 - fk_scaled.height - 40), fk_scaled)
    draw.text((c2_x1 + 95, c2_y2 - 30), "6 Frames (6 FPS)", fill=(245, 185, 66, 255))
    
    # -----------------------------------------------------------------
    # CARD 3: BOUNCY CHIBI WALK (TRANSPORT)
    # -----------------------------------------------------------------
    c3_x1, c3_y1, c3_x2, c3_y2 = 860, 95, 1240, 680
    draw.rounded_rectangle([(c3_x1, c3_y1), (c3_x2, c3_y2)], radius=12, fill=(24, 28, 42, 255), outline=(120, 230, 140, 255), width=2)
    draw.rounded_rectangle([(c3_x1 + 16, c3_y1 + 16), (c3_x1 + 330, c3_y1 + 46)], radius=6, fill=(25, 50, 30, 255))
    draw.text((c3_x1 + 24, c3_y1 + 22), "3. WALK // DÁNG ĐI NHÚN NHẢY CHIBI", fill=(120, 230, 140, 255))
    
    draw.text((c3_x1 + 20, c3_y1 + 60), "• Động học ngược 2-bone IK bước chân", fill=(210, 220, 240, 255))
    draw.text((c3_x1 + 20, c3_y1 + 82), "• Đầu nhấp nhô nhún nhảy (Bouncy bob)", fill=(210, 220, 240, 255))
    draw.text((c3_x1 + 20, c3_y1 + 104), "• Hai tay vung nhịp nhàng theo bước", fill=(120, 230, 140, 255))
    draw.line([(c3_x1 + 16, c3_y1 + 130), (c3_x2 - 16, c3_y1 + 130)], fill=(40, 52, 45, 255), width=1)
    
    frame_w = f_walk[idx % len(f_walk)]
    fw_crop = frame_w.crop(frame_w.getbbox())
    fw_scaled = fw_crop.resize((int(fw_crop.width * SCALE), int(fw_crop.height * SCALE)), Image.Resampling.NEAREST)
    canvas.paste(fw_scaled, (c3_x1 + (c3_x2 - c3_x1 - fw_scaled.width) // 2, c3_y2 - fw_scaled.height - 40), fw_scaled)
    draw.text((c3_x1 + 95, c3_y2 - 30), "8 Frames (8 FPS)", fill=(120, 230, 140, 255))
    
    out_frames.append(canvas)

# Save as High-Res Looping Animated GIF
out_gif = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/chibi_baker_animations.gif'
out_frames[0].save(out_gif, save_all=True, append_images=out_frames[1:], duration=1000 // FPS, loop=0)
print(f"Saved animated GIF: {out_gif}")

# Also convert to seamless looping MP4 video using ffmpeg
temp_dir = '/tmp/chibi_reel_frames'
os.makedirs(temp_dir, exist_ok=True)
for i, f in enumerate(out_frames):
    f.convert('RGB').save(f"{temp_dir}/frame_{i:03d}.png")

out_mp4 = '/Users/hungpham/projects/harrow-settlers/delivery-evidence/chibi_baker_animations.mp4'
cmd = [
    'ffmpeg', '-y', '-r', str(FPS),
    '-i', f"{temp_dir}/frame_%03d.png",
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.1',
    '-movflags', '+faststart',
    out_mp4
]
subprocess.run(cmd, check=True)
print(f"Saved MP4 video: {out_mp4}")
