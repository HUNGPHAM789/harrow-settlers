---
name: pxl-pixel-art
description: Create pixel art (game sprites, characters, items, tiles, tilesets, icons, scenes, sprite sheets) with pxl, a compact JavaScript DSL that renders PNGs and lets the user watch the painting live in a browser. Use when asked to draw, design or iterate on pixel art or game assets.
---

# pxl: pixel art as code

You write a small `.px.js` file; pxl renders PNGs and upscaled previews you can look at. The DSL
is built to avoid writing pixels twice: mirroring, auto-outline, palette-swap variants, reusable
parts, primitives, brushes and tilemaps. Needs Node ≥ 22.18. No install step.

`PXL` below means `node <this skill's directory>/bin/pxl.js`.

## Workflow

1. Write `art.px.js` (start from the template below; examples in `examples/`).
2. Build only what you're working on: `PXL build art.px.js --only slime,heart`
3. **Look at it**: read `out/_preview/<name>.png` (upscaled, checkerboard = transparent, grid every
   pixel, darker every 8). For exact pixel fixes use `PXL ascii art.px.js <name>` (keys + x/y rulers);
   it's cheaper than an image.
4. Fix with small edits (a `grid(x, y, ...)` patch, one op) and rebuild. Repeat.
5. If the user wants to watch: start `PXL serve art.px.js` in the background and give them the URL.
   It rebuilds on every save and replays the edited asset's painting steps; it also writes the same
   `out/` files, so keep reading previews as usual.

Errors name the file:line:col, the asset/layer/op path, and suggest fixes ("did you mean 'r'?").
One broken asset doesn't stop the others from building.

## Template

```js
pal({ k: "#1b1630", g: "#8ccf63", G: "#4c8a44", t: "#2a5560", w: "#fff6e0", r: "#e2585e", R: "#a63a4c" })
ramps("ktGg", "kRr")                   // dark -> light, drives shade()/light()

// Symmetric: write the left half, mirror it, outline it.
sprite("slime", { mx: true, outline: "k" }, `
  ....ggg
  ..ggGGg
  .ggGwGg
  gggkwgg
  gggkkgg
  tgggggg
  .tttttt`)
sprite("slime_red", { base: "slime", swap: { g: "r", G: "R" } })   // variant: 1 line

sprite("_eye", "wk\nkk")                                            // "_" = part, not exported
sprite("chest", { w: 16, h: 12, outline: "k" },
  rect(0, 3, 16, 9, "R"), rect(0, 0, 16, 4, "r"), stamp("_eye", 7, 4), shade([0, 9, 16, 3]))

scene("meadow", { w: 160, h: 96, bg: "w" },
  layer("ground", { y: 64 }, rect(0, 0, 160, 32, "G"), noise(0, 0, 160, 32, "g", 0.1, 3)),
  layer("props", stamp("slime", 40, 54), stamp("slime_red", 70, 54, { flip: "x" })),
  layer("shadow", { shade: true }, poly([38, 64, 88, 64, 92, 67, 34, 67], "k")))   // cast shadow

sheet("chars", ["slime*", "chest"], { pad: 1 })
```

## Essentials

- **Colors**: one-char keys from `pal`, `"#hex"`, `"."` skip, `"_"` erase. Default palette is pico8
  (`0-f`); `use("sweetie16" | "db16" | "endesga32" | "gray8")` for others.
- **Items run in order**: grid strings (drawn at 0,0), ops, `(c) => { c.rect(...) }` functions,
  `layer(...)`s. Then mirror → swap → flip → rot → outline (grows 1px each side) → crop.
- **Shapes**: `px rect box line(…, width) hline vline circ ring ellipse poly fill wire text`.
- **Tone**: `dither grad noise`, `shade/light(region, steps, density)`, `recolor`, and
  `shade:`/`light:` layers for cast shadows and glows. Regions: `[cx,cy,r]`, `[x,y,w,h]`,
  polygon, or a function. `clip(region, ...items)` restricts any items (half shapes, slopes).
- **Reuse**: `stamp tile pattern tilemap scatter`. Names can be groups or globs
  (`group("rocks", ["rock_a", "rock_a", "rock_b"])`, `"tree_*"`). Each placement picks randomly but
  reproducibly. Use `rflip`, `rswap`, `seed`, and `reseed: true` for per-copy variety.
- **Brushes**: `scatter("_leaf*", x, y, w, h, 30, { on: "g", clip: true, rflip: "xy" })` paints
  texture with tiny part sprites, only on the given colors.
- **Animation**: `anim("cat", { outline: "k", fps: 10 }, grid, frame(), frame(grid(23, 0, "_K")))`:
  frames are patches over shared items or a `base`; or `frames: 6` + `(c) => ... c.phase ...` for
  procedural loops. Stamping an anim animates the scene (`rdelay: true` desyncs copies, `frame: n`
  freezes one). Check `_preview/<name>.png` (all frames side by side) or `pxl ascii` per frame.
- **Glow**: `glow("zgQ", { r: 6, strength: 0.5 })` directly in a sprite/scene body gives every pixel
  of those keys a halo (flames, potions, moons, neon); `ramp: 2` instead stays in the palette.
  Give glowing things their own keys so nothing else lights up, or limit it with `where`.

Full API with every option: [reference.md](reference.md).
Dynamic lighting (lamps, light blocked by solid layers, sky light, Terraria-style): read
[lighting.md](lighting.md) only when a scene needs lights.

## Habits that save tokens and give better art

- Write half of anything symmetric (`mx`) and let `outline` draw outlines. Never hand-draw either.
- Recolors are `base` + `swap`; repeated details are `_parts` + `stamp`; families are a `group` or a
  loop: `for (let i = 1; i <= 3; i++) sprite("tree_" + i, ...)`.
- Large areas: primitives, `grad`, `noise`, `pattern`, `tilemap`. Never big hand grids.
- Organic texture (leaves, grass, stones, rust): 2–3 tiny brush parts + `scatter` with `on`/`clip`.
- **No filler noise.** Don't sprinkle `noise` speckle over walls, floors or plaster to make them
  "less flat": it reads as random dots, not material. Every mark on a surface needs a cause you
  could name, and it should sit where that cause would put it:
  - built structure: siding/plank lines, brick or stone courses with offset joints, tile seams;
  - weathering: rain-stain streaks under ledges and sills, splash-back grime fading up from the
    ground, rust runs under metal brackets, paint flaking off boards (following the board lines);
  - clutter that tells the story: posters, pipes, vents, cracks from a corner.
  Flat color is fine; a clean wall beats a dotted one. `noise` is OK only where the material itself
  is granular (gravel, sand, asphalt, tar roofs, rough stone), and keep it sparse. On faces drawn
  at an angle (3/4 views), make the marks follow the face's slant.
- Lighting: define `ramps`, then `light`/`shade` regions; stack a `density: 0.5` pass for soft edges.
  Use `shade: true` layers with a `poly` for cast shadows across many objects.
- Use mnemonic keys (`g`/`G` light/dark green). Keep 2–4 shades per material for a clean pixel-art look.
- Build with `--only` while iterating; a full build also writes every preview.

## Bigger sprite = MORE DRAWING, never a bigger copy (Boss 26/10/2026)
A 64 px version must be drawn at 64 px: new forms (fingers, folds, seams, eyes, hair locks), 4–6 hue-shifted tones per material
shaded per pixel from the form (the way the 64×64 portraits use `vol()` + `ramp()`), not the 32 px drawing with coordinates ×2 and a
few 1-px stripes. Measured 26/10: soldier L4 32 px 13 tones → L5 64 px 15 tones (Boss: «nhìn như setting 32 phóng to»); portraits
38–43 tones. Before showing any higher-resolution version, run the gate against the lower one:
`python3 ~/bin/pxl_detail_gain.py --low <low strip.png> --high <high strip.png> --frames N` (exit 1 «ONLY ENLARGED»).

Boss 26/10/2026: «bỏ blender đi … tại sao hình avatar nhìn chi tiết hơn sprite, sprite với chất lượng của avatar được ko? với setting 64. hiện tại setting 64 bạn làm sprite nhìn như setting 32 phóng to, ko thấy gì khác biệt»
Correction: #392
When: drawing any sprite at a higher resolution / «setting» than an existing one (32 → 64 px, a new quality level, a bigger hero)
Action: draw the detail at the target size with per-pixel form shading and material ramps (portrait technique); no Blender/3D route; run the detail-gain gate against the lower version before showing Boss
Gate: /Users/hungpham/bin/pxl_detail_gain.py

## Proportions by height; a person's face and hair from 60 px up (Boss 26/10/2026)
Chibi ≤ 55 px (head ≈ 1/3) · semi-chibi ≈ 60 px (≈ 4.3 heads, two-row eye, blush) · adult ≥ 70 px (≈ 6 heads like Final Fight's Guy).
At adult size draw the head the way Final Fight draws Poison: small face (≈ 7×7), one-row eye (lid · white · pupil), one shade pixel for
the nose, two for the mouth, hair as locks (dark partings arcing to the tie, broken light streaks on the lit side) — never a big round
face with a bar eye under a flat hair cap. Reference: `~/projects/last-delivery/sprite_lab/stills/painted_head.py`.

Boss 26/10/2026: «Phiên bản guy mặt và tóc không giống người - làm lại … mặt nhỏ nhưng ra nét người hơn, ra nét tóc hơn … càng cao thì phải càng anatomy kỹ hơn - càng thấp thì càng thiên về chibi, semi chibi»
Correction: #396
When: drawing a character still or sprite at a new height, or any human head at 60 px or more
Action: pick the proportion band from the height, paint the head with a small face + locks of hair, then run the anatomy gate before showing Boss
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pipeline/check_still_anatomy.py

## A head that reads human = a profile, not a blob (Boss 26/10/2026, #396 ×2)
Boss: «the face the head, the hair - still doesn't look like human, need research on real hand draw popular game female character».
Studied Hotaru (Garou), Chun-Li (SFA3), Poison (Final Fight): the face EDGE carries the drawing (brow ridge, nose tip, lips, chin, jaw to
neck), the face is the front half of the head, the eye is a lash line over white + pupil, hair = locks with a crown sheen and jagged tips,
the face profile keeps a dark ink edge. Hand-draw the head grid (`last-delivery/sprite_lab/stills/hand_head80.py`), research in
`sprite_lab/research/NOTES.md`.
Correction: #396
When: drawing or redrawing any human head at 70 px or more (adult), or Boss says a face/hair does not look human
Action: study real hand-drawn game sprites zoomed first, then hand-draw a profile head (face ≥ 0.22 of skin+hair, profile edge turning ≥ 3 times); never ship a parametric blob head
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pipeline/check_still_anatomy.py

## Faceless anime face + borrowed composition (Boss 26/10/2026)
Boss: «ok for cao 80, redraw with faceless (smaller face but visible and kinda anime faceshape and nose) · I like Hotaru composition, study
that as well see if you can recreate it». Reference: `last-delivery/sprite_lab/stills/hotaru_comp80.py` (faceless 3/4 head, V chin,
1 px nose, eyes under the fringe; Hotaru's pose measured on a 10 px grid, pose copied — never the reference's pixels).
Correction: #399
When: Boss asks for a «faceless» face or to recreate another game's composition for a still
Action: study the reference frame zoomed on a grid, copy proportions and pose only, draw a small 3/4 anime face with the eyes under the fringe, and declare "faceless" in the design so the gate uses faceless rules
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pipeline/check_still_anatomy.py

## Stills and sprites for Boss are BUILT WITH PXL — never typed-out pixel grids (Boss 26/10/2026, #392 ×3)
A still shown to Boss comes from a `.px.js` source: shapes (ellipse / polygon / tapered band chains for limbs and ponytails), a light
direction turned into hard cel tones with `ramps` + `shade`/`light`, cast shadows, `line` strokes for partings, lapels and folds,
palette swaps per setting (`pal` before each `sprite`), pxl's own `outline`. Tiny parts (an eye, a toe gap) may be a few `px`; a
head, hand or foot typed out row by row is hand-drawing. Reference: `~/projects/last-delivery/sprite_lab/pxl/heroine_stills.px.js`
(80 px faceless Hotaru composition, 60 px semi-chibi), boards `sprite_lab/pxl/boards.py` (runs the gate first).

Boss 26/10/2026: «but recreate with PXL skill, not you handraw it»
Correction: #392
When: making any character still, sprite or board of variants for Boss (any size, any style setting)
Action: write it as a .px.js built by pxl (shapes + ramps + strokes + outline), then run the pxl-still gate before building the board
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pipeline/check_pxl_still.py

## Hạ Vy: faceless face yes, Hotaru stance no (Boss 26/10/2026)
Faceless is the approved face for the heroine stills: the face shape stays (round chibi cheek at 45, V chin at 80) with a one-pixel nose,
the eyes lost in the fringe's shadow, no mouth. The stance stays the regular Vovinam guard pose (`figure45` / `figure60` in
`sprite_lab/pxl/heroine_stills.px.js`); Hotaru's open-hand wide stance (`figure80`) was tried and turned down — don't reuse it.

Boss 26/10/2026: «ok so i think i like faceless like that. but not the stance of hotaru like. the stance you create without hotaru preference is better. so just regular like you always do is fine»
Correction: #400
When: drawing Hạ Vy (or another hero) as a still or sprite after 26/10
Action: guard stance + faceless face built with pxl; run the pxl-still gate with `:faceless` on every faceless sprite
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pipeline/check_pxl_still.py

## Light from behind the character (Boss 26/10/2026)
Character stills are lit from BEHIND: a figure facing right gets `light: [-1, -1]` (top-left), so the back, shoulder and hair rim catch
the light and the front of the face and body turns into shade — V6's direction, now for every setting (V9 included). One design per
character, drawn at each height from one skeleton with per-band scales (`lamGuard` in `sprite_lab/pxl/heroine_stills.px.js`):
chibi 45–55, semi-chibi 60, adult 80 (shorter torso, longer legs, feet keep a foot's height). Mark such sprites `:back` in the gate.

Boss 26/10/2026: «so I think the lighting position i like is in the back … let's pick V6 and V9 setting (but with lighting in the back) - pick another character - do 45px, 50px, 55px, 60px 80px»
Correction: #401
When: lighting any character still or sprite (any setting, any size)
Action: put the light behind the character (top-left for a figure facing right) and run the pxl-still gate with `:back`
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pipeline/check_pxl_still.py

## Real light on a character still (pxl `lamp` + `lighting` + relief) — recipe from Lâm 60 (26/10/2026)
Paint local colours only (no cel bands), give every part its own dome (`c.bump("dome", { where: partMask })` back → front) and the
faceless face one facing direction (`c.normals(x, y, "d")`: it looks ahead, away from a back light), put ONE lamp low behind the
figure at shoulder height (`c.lamp(0, 12, { r: 44, power: 1.45, z: 3, color: "#ffe8c8" })`), then `lighting({ cell: 1, ambient: 0.55,
ambientColor: "#d8cfe0", relief: 1.4 })`: the back and shoulder flare into a rim, the front falls into shade. Colours leave the
palette (≈ 480); a function item after `lighting()` can snap each pixel back onto its unlit key's ramp (16 colours). Gate the lit
sprite with `:lit:back` (height + back light read on the PNG's main cloth). Reference: `lam60_l1/l2/l3` in
`~/projects/last-delivery/sprite_lab/pxl/heroine_stills.px.js`.

## Run cycles, built-in palettes, normal maps for the game, lit scenes — recipes from Lâm 60 (26/10/2026)
- **Run cycle**: `anim(name, { frames: 8, fps: 12, outline })` with one function reading `c.phase` → a pose (feet on stance/swing paths,
  hip bob, arms swinging against the legs, forward lean) → the same part painter as the stills. Legs by 2-bone IK taking the knee in
  FRONT of the hip→ankle line, and `throw` if a knee ever lands behind it (pxl build exits 1: «knee bends backward»).
- **Normal maps for an engine**: pxl writes `<name>_n.png` for sprites, not anims → also define each frame as a sprite (`phase: i/8`).
- **Built-in palettes**: map each ramp onto the palette with a best-fit, never-darker sequence (a tone may share its neighbour's colour)
  — greedy nearest jumps hues; small palettes can lose the back light (pico8 had no orange ramp): gate them `:lit:back` and say so.
- **Lit scene**: `anim(scene, …, layer("sky", { unlit: true }), layer(street with c.lamp() at every lamp object), layer(stamp the
  relief-mapped run, { frame: c.frame % 8 }), lighting({ cell: 1, ambient: 0.14, emit: lit windows/lamps/neon }), glow(...))`.
Reference: `~/projects/last-delivery/sprite_lab/pxl/lam_features.px.js`, deliverables `sprite_lab/pxl/features_boards.py`.

## Game sprites reuse the APPROVED design (Boss 26/10/2026)
When a character already has an approved still (Lâm 60), the battle/game frames are built from that design (same head data, stance,
proportions, hair) — never a fresh, simpler painter. squad_sheets.py compares the battle's Lâm head with the approved still.

Boss 26/10/2026: «Ủa lúc battle ko xài được sprite chi tiết à? Sprite Lâm 60 mình mới làm lúc nãy á?»
Correction: #406
When: turning an approved character still into game/battle frames
Action: build the frames from the approved builder's data (LAM_HEADS, stance, hair) and run the identity gate before packing sheets
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pxl/squad_sheets.py

### Correction #408 — battle animation stepped (26/10/2026)
- **Correction:** Boss: «Vậy là sprite chi tiết sẽ ko có animation smooth được … Tôi thấy animation của team kém hơn bản battle đầu tiên nhiều».
- **When:** baking pxl frames for anything that moves in a game (battle squad, zombies, any loop played by an engine).
- **Action:** pose functions are continuous, so bake dense: idle 12 · run/walk 16 · attack 12 · crouch 8 · kneel/skill 12 · ult 24, and play each loop by its
  cycle length in seconds (≈ 24 fps), never 6–8 frames at 6–12 fps. Held poses (idle, crouch) need breath + hand follow-through, not a 0.4 px bob.
  In the sim, a ranged unit holds its aim for a burst and ducks to reload — never flip states every shot (that alone reads as jitter).
- **Gate:** `python3 sprite_lab/pxl/check_smooth.py` (called by `squad_sheets.py`, rc 1: frame counts + no loop jump > 0.30 of the silhouette;
  reverse = the v3 sheet → rc 1) · `node tools/check_battle.mjs` «hold their aim for a burst» ≤ 1.0 flips/s (reverse `--mutate flicker` → rc 1).

Correction: #408
When: baking pxl frames for anything an engine animates (battle squad, zombies, loops) or writing the sim state that picks them
Action: bake dense (idle 12, run/walk 16, attack 12, crouch 8, kneel/skill 12, ult 24), play loops by cycle seconds (~24 fps), breathe held poses, ranged hold aim for a burst
Gate: /Users/hungpham/projects/last-delivery/sprite_lab/pxl/check_smooth.py

Correction: #409
When: about to put baked pxl frames into a game's real-time battle (Boss 26/10: «quay trở lại dạng sprite battle cũ» — he preferred the v1 code-drawn puppets)
Action: in Last Delivery the battle draws web/battle/puppet.js puppets redrawn every frame; pxl is for stills, portraits and backdrops (the battle's parallax layers stay pxl)
Gate: /Users/hungpham/projects/last-delivery/tools/check_battle.mjs

Correction: #416
When: a round promised as an UPGRADE of character sprites (more detail / better pose) — before spreading a look to more characters
Action: deliver the upgrade on the agreed characters first and show old vs new side by side; standing sprites: real poses (crossed arms, hand in pocket, gesture past the body), form shading per part from its silhouette onto 5–6 tone ramps (pxl lighting() burnt out or went muddy at 112×150), soft face form
Gate: /Users/hungpham/projects/last-delivery/tools/check_tachie_detail.py
- **Standing sprites from a reference sheet (Last Delivery v4, 26/10/2026)**: when my own guessed shapes stay stiff, make a Codex reference
  sheet from the approved portrait (`anchor-gen`, two poses, 3/4, head→hips), turn it into MATERIAL REGIONS + creases at the sprite size
  (`tools/tachie_ref_shapes.py`, also insightface landmarks → an affine for the face template), and let pxl paint: per-region form shading
  onto the game's ramps, creases one step down with a lit lip, outline, emotion faces at the landmarks. No reference colour is copied.

## Dialogue standing sprites = the Codex art itself (Boss 26/10/2026, last-delivery)
Boss: «Ko cần làm lại, lấy hình của codex luôn đi». Rebuilding a Codex reference sheet in pxl (v4) was wasted work: the dialogue
standing sprites (tachie) are the Codex poses cut out of the grey background (`art/tachie/<who>_<pose>.png`), shown smooth, not
pixel-rebuilt. (Block transcribed from ledger #417; the last-delivery session owns the workflow.)
Correction: #417
When: a character needs a dialogue standing sprite (tachie) and a Codex sheet of that character already exists
Action: cut the Codex pose out of its background and use it as-is; do not redraw it in pxl
Gate: none — the barrier lives in last-delivery (`check_script.py`: a standing-sprite speaker's line must resolve to art/tachie/<who>_<pose>.png when Codex art exists); this skill only records the rule

Correction: #418
When: putting Codex-drawn character art into the Last Delivery battle (Boss 26/10: «xài ảnh nét sprite luôn» → after seeing the crisp cut-outs «ảnh nét bị lỗi cắt crop, xài ảnh pixel đi»)
Action: battle sprites = the Codex sheet rebuilt to true 55 px pixels (tools/sprite_from_codex.py: one scale, area mean, palette keeping tinted accents), drawn 1:1 on the stage grid; the canvas renders at 2× so crisp art stays possible
Gate: /Users/hungpham/projects/last-delivery/tools/sprite_from_codex.py

Correction: #408
When: any hero art for the Last Delivery battle (Boss ×2: «animation của team kém hơn bản battle đầu tiên» → «sprite này di chuyển chưa mượt … đưa sprite từng bộ phận … ghép vô cho animation mượt»)
Action: ask the artist (Codex) for a PARTS sheet per docs/battle_part_spec.md (18 parts: head, torso, pelvis, weapon, near + far limbs, 3 hands), cut with tools/parts_from_codex.py, draw with web/battle/rig.js on puppet.js's skeleton every frame; frame strips only with ≥ 8 run frames
Gate: /Users/hungpham/projects/last-delivery/tools/check_battle.mjs

Correction: #419
When: making battle/character art for Last Delivery after 26/10 (Boss: «cách rap này ko đẹp … đổi kiểu game - làm kiểu rpg giống diablo 3,4 isometric … nhân vật nhìn giống kiểu liên quân mobile»)
Action: no cut-out (paper-doll) rigs of 2D parts; the battle is moving to an isometric action RPG with stylized 3D heroes — pxl stays for UI, portraits, backdrops until Boss picks the style
Gate: none — the style is Boss's pick; the first isometric slice gets its own gate once chosen
