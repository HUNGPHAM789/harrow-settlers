import os
import json
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = "/Users/hungpham/projects/harrow-settlers"
ART_DIR = os.path.join(BASE_DIR, "art/out")
EVID_DIR = os.path.join(BASE_DIR, "delivery-evidence")

def load_frames(anim_name):
    json_path = os.path.join(ART_DIR, f"anims/{anim_name}.json")
    png_path = os.path.join(ART_DIR, f"anims/{anim_name}.png")
    with open(json_path, "r") as f:
        data = json.load(f)
    sheet = Image.open(png_path).convert("RGBA")
    frames = []
    keys = sorted(data["frames"].keys(), key=lambda k: int(k.split("_")[-1]))
    for k in keys:
        f_info = data["frames"][k]["frame"]
        x, y, w, h = f_info["x"], f_info["y"], f_info["w"], f_info["h"]
        frames.append(sheet.crop((x, y, x + w, y + h)))
    return frames

def load_sprite(sprite_name):
    png_path = os.path.join(ART_DIR, f"sprites/{sprite_name}.png")
    return Image.open(png_path).convert("RGBA")

print("Loading animation assets...")
anims = {
    "knead": load_frames("anim_chibi_baker_knead"),
    "oven": load_frames("anim_chibi_baker_oven"),
    "aroma": load_frames("anim_chibi_baker_aroma"),
    "carry": load_frames("anim_chibi_baker_carry"),
    "sneeze": load_frames("anim_chibi_baker_sneeze"),
    "walk": load_frames("anim_chibi_baker_walk"),
    "idle": load_frames("anim_chibi_baker_idle"),
}

props = {
    "hearth": load_sprite("prop_stone_hearth"),
    "table": load_sprite("prop_dough_table"),
    "basket": load_sprite("prop_bread_basket"),
    "sign": load_sprite("prop_pretzel_sign"),
    "sparrow": load_sprite("prop_sparrow"),
}

W, H = 1280, 720

# Fonts
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
    font_sec = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
    font_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 13)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 11)
except Exception:
    font_title = font_sec = font_bold = font_sub = font_badge = ImageFont.load_default()

def draw_card(draw, x, y, w, h, title, subtitle=None, highlight=False):
    bg_col = (20, 27, 44, 240) if not highlight else (26, 36, 58, 255)
    border_col = (74, 90, 128) if not highlight else (245, 158, 11)
    draw.rounded_rectangle([x, y, x + w, y + h], radius=8, fill=bg_col, outline=border_col, width=2 if highlight else 1)
    # Header tab
    draw.text((x + 12, y + 8), title, fill=(245, 185, 66) if highlight else (226, 232, 240), font=font_sec)
    if subtitle:
        draw.text((x + 12, y + 26), subtitle, fill=(148, 163, 184), font=font_sub)

def render_frame(t_idx, total_t=120):
    img = Image.new("RGBA", (W, H), (14, 19, 31, 255))
    draw = ImageDraw.Draw(img)
    
    # Subtle background pattern
    for py in range(0, H, 20):
        draw.line([(0, py), (W, py)], fill=(20, 27, 42, 100), width=1)
    for px in range(0, W, 20):
        draw.line([(px, 0), (px, H)], fill=(20, 27, 42, 100), width=1)
        
    # Top Banner
    draw.rounded_rectangle([20, 14, W - 20, 78], radius=8, fill=(18, 25, 40, 255), outline=(51, 65, 85), width=1)
    draw.text((36, 24), "HARROW SETTLERS", fill=(245, 158, 11), font=font_badge)
    draw.text((36, 40), "CHIBI BAKER PROFESSION SUITE & LIVING PROPS", fill=(255, 255, 255), font=font_title)
    
    # Badges on top right
    badges = [
        ("PXL PARAMETRIC RIG", (30, 41, 59), (148, 163, 184)),
        ("7 LIVING ANIMATIONS", (16, 185, 129), (255, 255, 255)),
        ("5 DIORAMA PROPS", (59, 130, 246), (255, 255, 255)),
        ("100% UNOBSTRUCTED FACE", (245, 158, 11), (0, 0, 0)),
    ]
    bx = W - 36
    for btext, bbg, bfg in reversed(badges):
        bbox = font_badge.getbbox(btext)
        bw = (bbox[2] - bbox[0]) + 16
        bx -= bw + 8
        draw.rounded_rectangle([bx, 34, bx + bw, 58], radius=4, fill=bbg)
        draw.text((bx + 8, 39), btext, fill=bfg, font=font_badge)

    # ------------------ ROW 1: THE CORE 4-STEP PRODUCTION CYCLE ------------------
    row1_y = 92
    c_w = (W - 40 - 36) // 4  # ~296px wide
    c_h = 280
    
    # Panel 1: Knead
    x1 = 20
    draw_card(draw, x1, row1_y, c_w, c_h, "01 / KNEAD & SQUASH", "Dough table + squashing dough")
    f_k = anims["knead"][t_idx % len(anims["knead"])]
    f_k_scaled = f_k.resize((f_k.width * 2, f_k.height * 2), Image.NEAREST)
    img.paste(f_k_scaled, (x1 + (c_w - f_k_scaled.width) // 2, row1_y + 60), f_k_scaled)
    draw.text((x1 + 16, row1_y + c_h - 42), "• 2-hand rhythmic kneading", fill=(203, 213, 225), font=font_sub)
    draw.text((x1 + 16, row1_y + c_h - 26), "• Squash & stretch dough ball", fill=(148, 163, 184), font=font_sub)

    # Panel 2: Oven Slide
    x2 = x1 + c_w + 12
    draw_card(draw, x2, row1_y, c_w, c_h, "02 / STOKE & LOAD OVEN", "Glowing embers & wooden peel")
    f_o = anims["oven"][t_idx % len(anims["oven"])]
    f_o_scaled = f_o.resize((f_o.width * 2, f_o.height * 2), Image.NEAREST)
    img.paste(f_o_scaled, (x2 + (c_w - f_o_scaled.width) // 2, row1_y + 60), f_o_scaled)
    draw.text((x2 + 16, row1_y + c_h - 42), "• Stone hearth with chimney smoke", fill=(203, 213, 225), font=font_sub)
    draw.text((x2 + 16, row1_y + c_h - 26), "• Peel slides raw dough inside", fill=(148, 163, 184), font=font_sub)

    # Panel 3: Aroma Bliss
    x3 = x2 + c_w + 12
    draw_card(draw, x3, row1_y, c_w, c_h, "03 / AROMA & HARVEST", "Steam curls & sparrow eating crumbs")
    f_a = anims["aroma"][t_idx % len(anims["aroma"])]
    f_a_scaled = f_a.resize((f_a.width * 2, f_a.height * 2), Image.NEAREST)
    img.paste(f_a_scaled, (x3 + (c_w - f_a_scaled.width) // 2, row1_y + 60), f_a_scaled)
    draw.text((x3 + 16, row1_y + c_h - 42), "• Sniffing hot golden bread aroma", fill=(203, 213, 225), font=font_sub)
    draw.text((x3 + 16, row1_y + c_h - 26), "• Tiny sparrow pecking crumbs", fill=(148, 163, 184), font=font_sub)

    # Panel 4: Carry Delivery
    x4 = x3 + c_w + 12
    draw_card(draw, x4, row1_y, c_w, c_h, "04 / HOT BREAD DELIVERY", "Carrying wicker basket to village")
    f_c = anims["carry"][t_idx % len(anims["carry"])]
    f_c_scaled = f_c.resize((f_c.width * 2, f_c.height * 2), Image.NEAREST)
    img.paste(f_c_scaled, (x4 + (c_w - f_c_scaled.width) // 2, row1_y + 60), f_c_scaled)
    draw.text((x4 + 16, row1_y + c_h - 42), "• Bouncy walk with basket full", fill=(203, 213, 225), font=font_sub)
    draw.text((x4 + 16, row1_y + c_h - 26), "• Feeds miners & woodcutters", fill=(148, 163, 184), font=font_sub)

    # ------------------ ROW 2: SETTLERS WUSELFAKTOR & PROPS ------------------
    row2_y = 384
    c_w_sneeze = 370
    c_w_walk = 370
    c_w_props = W - 40 - 24 - c_w_sneeze - c_w_walk # ~476px

    # Panel 5: Flour Sneeze Fiasco! (HIGHLIGHTED CARD)
    x5 = 20
    draw_card(draw, x5, row2_y, c_w_sneeze, c_h, "05 / COMEDIC FLOUR SNEEZE!", "Signature Settlers 'Wuselfaktor' humor", highlight=True)
    f_s = anims["sneeze"][t_idx % len(anims["sneeze"])]
    f_s_scaled = f_s.resize((f_s.width * 2, f_s.height * 2), Image.NEAREST)
    img.paste(f_s_scaled, (x5 + (c_w_sneeze - f_s_scaled.width) // 2, row2_y + 54), f_s_scaled)
    # Sneeze state tag
    s_frame = t_idx % len(anims["sneeze"])
    if s_frame < 4:
        s_txt = "Phase 1: Nose tickle buildup..."
        s_col = (203, 213, 225)
    elif s_frame < 6:
        s_txt = "Phase 2: *ACHOO!!* Flour cloud blast!"
        s_col = (245, 158, 11)
    else:
        s_txt = "Phase 3: Dusted solid white like a ghost!"
        s_col = (255, 255, 255)
    draw.text((x5 + 16, row2_y + c_h - 42), s_txt, fill=s_col, font=font_bold)
    draw.text((x5 + 16, row2_y + c_h - 26), "• Random comedy event during baking", fill=(148, 163, 184), font=font_sub)

    # Panel 6: Locomotion & Idle
    x6 = x5 + c_w_sneeze + 12
    draw_card(draw, x6, row2_y, c_w_walk, c_h, "06 / LOCOMOTION & IDLE", "Breathing cycle + Bouncy Chibi walk")
    f_w = anims["walk"][t_idx % len(anims["walk"])]
    f_i = anims["idle"][t_idx % len(anims["idle"])]
    f_w_scaled = f_w.resize((f_w.width * 2, f_w.height * 2), Image.NEAREST)
    f_i_scaled = f_i.resize((f_i.width * 2, f_i.height * 2), Image.NEAREST)
    img.paste(f_i_scaled, (x6 + 30, row2_y + 60), f_i_scaled)
    img.paste(f_w_scaled, (x6 + 190, row2_y + 60), f_w_scaled)
    draw.text((x6 + 60, row2_y + 225), "Idle Breathe", fill=(148, 163, 184), font=font_badge)
    draw.text((x6 + 225, row2_y + 225), "Bouncy Walk", fill=(148, 163, 184), font=font_badge)
    draw.text((x6 + 16, row2_y + c_h - 42), "• Parametric 2-bone IK legs & arms", fill=(203, 213, 225), font=font_sub)
    draw.text((x6 + 16, row2_y + c_h - 26), "• 100% visible face & rosy blushing cheeks", fill=(148, 163, 184), font=font_sub)

    # Panel 7: Living Diorama Props
    x7 = x6 + c_w_walk + 12
    draw_card(draw, x7, row2_y, c_w_props, c_h, "07 / LIVING DIORAMA PROPS", "Interactive workshop & environment props")
    
    # Draw all 5 props neatly
    # Prop 1: Stone Hearth
    p_h = props["hearth"].resize((props["hearth"].width * 2, props["hearth"].height * 2), Image.NEAREST)
    img.paste(p_h, (x7 + 16, row2_y + 54), p_h)
    draw.text((x7 + 22, row2_y + 164), "Stone Oven", fill=(203, 213, 225), font=font_badge)
    
    # Prop 2: Dough Table
    p_t = props["table"].resize((props["table"].width * 2, props["table"].height * 2), Image.NEAREST)
    img.paste(p_t, (x7 + 124, row2_y + 74), p_t)
    draw.text((x7 + 128, row2_y + 164), "Dough Table", fill=(203, 213, 225), font=font_badge)

    # Prop 3: Bread Basket
    p_b = props["basket"].resize((props["basket"].width * 2, props["basket"].height * 2), Image.NEAREST)
    img.paste(p_b, (x7 + 218, row2_y + 80), p_b)
    draw.text((x7 + 218, row2_y + 164), "Cooling Basket", fill=(203, 213, 225), font=font_badge)

    # Prop 4: Pretzel Sign
    p_s = props["sign"].resize((props["sign"].width * 2, props["sign"].height * 2), Image.NEAREST)
    img.paste(p_s, (x7 + 312, row2_y + 66), p_s)
    draw.text((x7 + 310, row2_y + 164), "Pretzel Sign", fill=(203, 213, 225), font=font_badge)

    # Prop 5: Settlement Sparrow
    p_sp = props["sparrow"].resize((props["sparrow"].width * 2, props["sparrow"].height * 2), Image.NEAREST)
    img.paste(p_sp, (x7 + 400, row2_y + 88), p_sp)
    draw.text((x7 + 398, row2_y + 164), "Sparrow", fill=(203, 213, 225), font=font_badge)

    draw.text((x7 + 16, row2_y + c_h - 42), "• Complete visual ecosystem for Bakery building", fill=(203, 213, 225), font=font_sub)
    draw.text((x7 + 16, row2_y + c_h - 26), "• Idle villagers stop to sniff aroma or watch sparks", fill=(148, 163, 184), font=font_sub)

    # ------------------ FOOTER ------------------
    draw.rounded_rectangle([20, H - 42, W - 20, H - 12], radius=6, fill=(18, 25, 40, 255), outline=(51, 65, 85), width=1)
    draw.text((36, H - 32), "HARROW SETTLERS • MODERN HD CHIBI SPEC • ZERO BOXES • 100% PXL PARAMETRIC RIG", fill=(148, 163, 184), font=font_sub)
    draw.text((W - 280, H - 32), "SEAMLESS 120-FRAME LOOP (15 FPS)", fill=(245, 158, 11), font=font_sub)

    return img

print("Rendering frame 0 for static showcase & verification...")
f0 = render_frame(0)
static_path = os.path.join(EVID_DIR, "chibi_baker_full_showcase.png")
f0.save(static_path)
print(f"Saved static showcase to {static_path}")

# Verification check (Rule 8)
arr = np.array(f0.convert("RGB"))
std_dev = np.std(arr)
unique_colors = len(np.unique(arr.reshape(-1, 3), axis=0))
print(f"Rule 8 Audit: std_dev={std_dev:.2f} (req > 20), unique_colors={unique_colors} (req > 500)")
assert std_dev > 20, f"Contrast too low: {std_dev}"
assert unique_colors > 500, f"Color count too low: {unique_colors}"
print(" Rule 8 Visual Verification PASSED!")

# Now render 120 frames
print("Rendering 120 animation frames for GIF and MP4...")
frames = []
for i in range(120):
    frames.append(render_frame(i, 120))
    if (i + 1) % 30 == 0:
        print(f"  Rendered {i + 1}/120 frames...")

# Save animated GIF
gif_path = os.path.join(EVID_DIR, "chibi_baker_full_profession_lifecycle.gif")
print("Saving master GIF...")
# Use 15 fps (66ms per frame)
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=66,
    loop=0,
    optimize=True
)
print(f"Saved GIF to {gif_path} ({os.path.getsize(gif_path)/1024:.1f} KB)")

# Save MP4 video via ffmpeg
mp4_path = os.path.join(EVID_DIR, "chibi_baker_full_profession_lifecycle.mp4")
print("Encoding master MP4 video via ffmpeg...")
ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-f", "image2pipe",
    "-vcodec", "png",
    "-r", "15",
    "-i", "-",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-movflags", "+faststart",
    "-crf", "18",
    mp4_path
]

proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
for f in frames:
    f.convert("RGB").save(proc.stdin, "PNG")
proc.stdin.close()
proc.wait()
print(f"Saved MP4 to {mp4_path} ({os.path.getsize(mp4_path)/1024:.1f} KB)")
