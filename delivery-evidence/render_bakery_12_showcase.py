#!/usr/bin/env python3
"""
Master Visual Showcase: The 12-Animation Continuous Work Loop in Harrow Bakery House.
Renders high-res contact sheet with all 12 animations, purposeful props, and kinematic tags.
"""
import os
import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import PIL.ImageFont as ImageFont

gif_path = "/Users/hungpham/projects/harrow-settlers/art/out/_preview/bakery_open_house_profession_reel.gif"
out_img = "/Users/hungpham/projects/harrow-settlers/delivery-evidence/bakery_12_animations_overview.png"

im = Image.open(gif_path)
total_frames = im.n_frames

beats = [
    (3,  "01  SCOOP FLOUR", "Pantry: Wooden scoop dips into flour barrel"),
    (11, "02  POUR WATER & SALT", "Prep table: Terracotta pitcher pours spring water"),
    (19, "03  KNEAD DOUGH (2-HAND)", "Table: Vigorous 2-handed kneading with body lean"),
    (27, "04  SHAPE & SCORE", "Table: Shaping boules & cutting diagonal baker scores"),
    (35, "05  PEEL LOAD TO OVEN", "Hearth: Wooden peel stick slides raw dough into fire"),
    (43, "06  FLOUR SNEEZE (ACHOO!)", "Comedy: Flour cloud explosion, white-faced blink"),
    (51, "07  PEEL RETRIEVE BREAD", "Hearth: Wooden peel stick pulls out steaming loaves"),
    (59, "08  BREATHE IN AROMA", "Cooling rack: Inhaling warm yeast aroma proudly"),
    (67, "09  CARRY BASKET", "Workshop: Carrying wicker basket with bouncy stride"),
    (75, "10  SERVE AT COUNTER", "Storefront: Displaying bread & ringing brass bell"),
    (83, "11  RETURN TO LANE", "Courtyard: Walking back to workshop along apron"),
    (89, "12  READY FOR NEXT BATCH", "Workbench: Calm grounded breathing, adjusting toque")
]

card_w, card_h = 420, 240
cols = 3
rows = 4
pad = 16
header_h = 100
footer_h = 60

canvas_w = cols * card_w + (cols + 1) * pad
canvas_h = header_h + rows * (card_h + 40) + (rows + 1) * pad + footer_h

canvas = Image.new("RGBA", (canvas_w, canvas_h), "#161b22")
draw = ImageDraw.Draw(canvas)

# Header banner
draw.rectangle([0, 0, canvas_w, header_h], fill="#0d1117")
draw.line([0, header_h, canvas_w, header_h], fill="#30363d", width=2)

try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16)
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 16)
    font_desc = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
except Exception:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_badge = ImageFont.load_default()
    font_desc = ImageFont.load_default()

draw.text((pad + 10, 18), "HARROW BAKERY · 12-ANIMATION CONTINUOUS WORK LOOP", fill="#f5c44e", font=font_title)
draw.text((pad + 10, 60), "Purposeful Architecture · Specialized Interactive Props · The Baker Chef & His Wooden Stick", fill="#c9d1d9", font=font_sub)

y_start = header_h + pad

for i, (f_idx, title, desc) in enumerate(beats):
    col = i % cols
    row = i // cols
    x = pad + col * (card_w + pad)
    y = y_start + row * (card_h + 40 + pad)
    
    # Extract frame
    im.seek(min(total_frames - 1, f_idx))
    frame = im.convert("RGBA")
    
    # Card background & frame
    draw.rectangle([x - 2, y - 2, x + card_w + 2, y + card_h + 38], fill="#21262d", outline="#30363d", width=2)
    canvas.paste(frame, (x, y))
    
    # Label bar under card
    draw.rectangle([x, y + card_h, x + card_w, y + card_h + 36], fill="#1c2128")
    draw.text((x + 10, y + card_h + 4), title, fill="#58a6ff" if "STICK" not in title else "#f5c44e", font=font_badge)
    draw.text((x + 10, y + card_h + 20), desc, fill="#8b949e", font=font_desc)

# Footer
draw.rectangle([0, canvas_h - footer_h, canvas_w, canvas_h], fill="#0d1117")
draw.line([0, canvas_h - footer_h, canvas_w, canvas_h - footer_h], fill="#30363d", width=2)
draw.text((pad + 10, canvas_h - 40), "Harrow Settlers Modern HD Engine · Authentic The Settlers II Aesthetic · 100% Deterministic Kinematics", fill="#8b949e", font=font_sub)

canvas.save(out_img, "PNG")
print(f"✅ Generated master showcase: {out_img} ({canvas_w}x{canvas_h})")
