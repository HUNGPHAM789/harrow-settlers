// ISOMETRIC buildings per ISOMETRIC SPEC & audit feedback.
// True isometric 2:1 dimetric projection: left wall darker, right wall mid, roof lightest.
// Top-left light, 4-6 tones per material, selective dark outline, unmistakable silhouettes.
// Required buildings (name WxH):
// b_iso_mill 80x88, b_iso_bakery 64x62, b_iso_mine 64x60, b_iso_smelter 64x66,
// b_iso_smith 80x72, b_iso_tower 64x88, b_iso_market 80x70, b_iso_monument 112x120
// Plus corresponding _scaffold versions.

use("sweetie16")
pal({
  // Wood / Timber Ramps (dark shadow, dark, mid, lit, bright)
  a: "#1a0f07", // outline / deep wood shadow
  b: "#3a2010", // dark timber
  c: "#5c3317", // mid timber wall
  d: "#8b5a2b", // lit timber wall
  e: "#b07843", // bright wood highlight

  // Stone / Foundation Ramps
  f: "#1c1b22", // stone outline / mortar deep
  g: "#343541", // dark stone course
  h: "#525467", // mid stone block
  i: "#797b91", // lit stone block
  j: "#a3a5bc", // bright stone edge

  // Roof / Thatch / Tile Ramps
  k: "#2b120f", // dark roof shadow
  l: "#59221b", // dark tile / thatch base
  m: "#8c382b", // mid tile / thatch
  n: "#b84e3d", // lit tile / thatch
  o: "#db6e5b", // bright tile ridge

  // Metal / Iron / Roof Ramps (slate / copper / iron)
  p: "#111822", // iron outline
  q: "#223344", // iron dark
  r: "#3b526d", // iron mid
  s: "#62809e", // iron lit
  t: "#8fb1d1", // iron bright

  // Glass / Windows / Glow
  u: "#0d2b45", // window frame / dark
  v: "#203c56", // window glass mid
  w: "#63c74d", // warm light / glow / accent
  x: "#ffeb57", // bright light / gold flag

  // Props & Foliage accents
  y: "#283618", // dark foliage
  z: "#606c38", // foliage mid
  1: "#aacc00", // foliage lit
  2: "#7f4f24", // rope / leather / sack brown
  3: "#dda15e", // sack wheat / sand
  4: "#e63946", // banner red / bricks
  5: "#ffffff"  // white highlight / smoke
})

// --- REUSABLE ISOMETRIC HELPERS ---
// Every sprite bottom-center vertex touches the bottom of the canvas (x = w/2, y = h).
// Standard ISO box helper for building main bodies:
// baseW/baseH are the footprint dimensions in tile units (1 tile = 32x16 iso diamond roughly, or pixel box widths).
function isoBox(c, x, y, bw, bh, height, leftCol, rightCol, topCol, outlineCol) {
  // bw, bh: footprint width/depth in pixels or relative units
  // left wall: poly from bottom-center to left to top
  c.poly([x, y, x - bw/2, y - bh/2, x - bw/2, y - bh/2 - height, x, y - height], leftCol)
  // right wall: poly from bottom-center to right to top
  c.poly([x, y, x + bw/2, y - bh/2, x + bw/2, y - bh/2 - height, x, y - height], rightCol)
  // outline
  if (outlineCol) {
    c.line(x, y, x - bw/2, y - bh/2, outlineCol, 1)
    c.line(x, y, x + bw/2, y - bh/2, outlineCol, 1)
    c.line(x - bw/2, y - bh/2, x - bw/2, y - bh/2 - height, outlineCol, 1)
    c.line(x + bw/2, y - bh/2, x + bw/2, y - bh/2 - height, outlineCol, 1)
    c.line(x - bw/2, y - bh/2 - height, x, y - height, outlineCol, 1)
    c.line(x + bw/2, y - bh/2 - height, x, y - height, outlineCol, 1)
    c.line(x, y, x, y - height, outlineCol, 1)
  }
}

// Standard ISO pyramid/gable roof helper
function isoRoof(c, x, y, bw, bh, height, roofCol, ridgeCol, outlineCol) {
  // Diamond gable roof
  const peakY = y - height
  const leftX = x - bw/2
  const rightX = x + bw/2
  const frontY = y
  const backY = y - bh
  
  // Left roof slope
  c.poly([x, peakY, leftX, frontY - bh/2, x, frontY], roofCol)
  // Right roof slope (lighter)
  c.poly([x, peakY, rightX, frontY - bh/2, x, frontY], roofCol)
  
  if (ridgeCol) {
    // Ridge line following 2:1 slope
    c.line(x, peakY, leftX, frontY - bh/2, ridgeCol, 1)
    c.line(x, peakY, rightX, frontY - bh/2, ridgeCol, 1)
    c.line(x, peakY, x, frontY, ridgeCol, 1)
  }
  if (outlineCol) {
    c.line(leftX, frontY - bh/2, x, frontY, outlineCol, 1)
    c.line(rightX, frontY - bh/2, x, frontY, outlineCol, 1)
    c.line(x, peakY, leftX, frontY - bh/2, outlineCol, 1)
    c.line(x, peakY, rightX, frontY - bh/2, outlineCol, 1)
  }
}

// Scaffold helper for unbuilt / construction versions
function isoScaffold(c, x, y, bw, bh, height) {
  // Wooden poles and cross bracing
  const l = x - bw/2
  const r = x + bw/2
  const bottomY = y
  const topY = y - height
  const midY = y - height / 2

  // Vertical corner poles
  c.line(l, bottomY - bh/2, l, topY, "b", 1)
  c.line(r, bottomY - bh/2, r, topY, "b", 1)
  c.line(x, bottomY, x, topY, "b", 1)
  c.line(x, bottomY - bh, x - bw/4, topY - 4, "b", 1)

  // Horizontal and diagonal bracing
  c.line(l, midY, r, midY, "d", 1)
  c.line(l, bottomY - bh/2, x, midY, "c", 1)
  c.line(x, midY, r, bottomY - bh/2, "c", 1)
  c.line(l, topY, x, topY - 4, "d", 1)
  c.line(x, topY - 4, r, topY, "d", 1)

  // Partial scaffolding planks & ladder
  c.rect(l + 4, midY - 2, 12, 3, "c")
  c.line(l + 8, midY - 6, l + 8, midY + 6, "d", 1)
  c.line(l + 12, midY - 6, l + 12, midY + 6, "d", 1)
  for (let py = midY - 4; py <= midY + 4; py += 3) {
    c.hline(l + 8, py, 5, "c")
  }
}

// ==========================================
// 1. b_iso_mill (80x88) - Windmill with blades & round/octagonal base
// ==========================================
sprite("b_iso_mill", { w: 80, h: 88, outline: "a" }, (c) => {
  const cx = 40, cy = 84
  // Foundation stone
  isoBox(c, cx, cy, 40, 20, 16, "g", "h", "i", "f")
  // Wooden tower body
  isoBox(c, cx, cy - 16, 32, 16, 36, "b", "c", "d", "a")
  // Conical cap roof
  c.poly([cx, cy - 68, cx - 20, cy - 52, cx + 20, cy - 52], "l")
  c.poly([cx, cy - 68, cx, cy - 52, cx + 20, cy - 52], "m")
  c.line(cx, cy - 68, cx - 20, cy - 52, "k", 1)
  c.line(cx, cy - 68, cx + 20, cy - 52, "n", 1)
  // Door & windows
  c.rect(cx - 3, cy - 12, 6, 12, "u")
  c.rect(cx - 2, cy - 32, 4, 6, "w")
  c.rect(cx + 8, cy - 28, 4, 6, "w")
  // Large windmill blades (cross)
  c.line(cx - 32, cy - 56, cx + 32, cy - 32, "a", 2)
  c.line(cx - 24, cy - 32, cx + 24, cy - 56, "a", 2)
  // Sail fabric on blades
  c.poly([cx, cy - 44, cx - 32, cy - 56, cx - 24, cy - 32], "5")
  c.poly([cx, cy - 44, cx + 32, cy - 32, cx + 24, cy - 56], "5")
  c.poly([cx, cy - 44, cx - 24, cy - 32, cx - 16, cy - 20], "5")
  c.poly([cx, cy - 44, cx + 24, cy - 56, cx + 16, cy - 68], "5")
})
sprite("b_iso_mill_scaffold", { w: 80, h: 88, outline: "a" }, (c) => {
  const cx = 40, cy = 84
  isoBox(c, cx, cy, 40, 20, 16, "g", "h", "i", "f")
  isoBox(c, cx, cy - 16, 32, 16, 24, "b", "c", "d", "a")
  isoScaffold(c, cx, cy - 16, 36, 20, 40)
})

// ==========================================
// 2. b_iso_bakery (64x62) - Cozy cottage with stone oven & chimney, bread props
// ==========================================
sprite("b_iso_bakery", { w: 64, h: 62, outline: "a" }, (c) => {
  const cx = 32, cy = 58
  // Stone base & oven
  isoBox(c, cx, cy, 36, 22, 28, "g", "h", "i", "f")
  // Wooden gable roof with red/brown tiles
  isoRoof(c, cx, cy - 28, 40, 26, 20, "m", "n", "k")
  // Brick chimney puffing smoke
  c.rect(cx + 6, cy - 48, 8, 14, "4")
  c.px(cx + 8, cy - 51, "5")
  c.px(cx + 11, cy - 53, "5")
  // Door & warm glowing windows
  c.rect(cx - 12, cy - 10, 8, 10, "u")
  c.rect(cx + 4, cy - 18, 6, 6, "w")
  c.rect(cx - 10, cy - 18, 6, 6, "w")
  // Bread basket / sacks prop near door
  c.rect(cx - 18, cy - 4, 6, 5, "2")
  c.px(cx - 17, cy - 5, "3")
  c.px(cx - 15, cy - 5, "3")
})
sprite("b_iso_bakery_scaffold", { w: 64, h: 62, outline: "a" }, (c) => {
  const cx = 32, cy = 58
  isoBox(c, cx, cy, 36, 22, 16, "g", "h", "i", "f")
  isoScaffold(c, cx, cy - 16, 38, 24, 30)
})

// ==========================================
// 3. b_iso_mine (64x60) - Mountain tunnel mouth, ore cart, wooden struts
// ==========================================
sprite("b_iso_mine", { w: 64, h: 60, outline: "a" }, (c) => {
  const cx = 32, cy = 56
  // Rock & timber portal
  isoBox(c, cx, cy, 38, 22, 32, "g", "h", "i", "f")
  // Dark mine entrance arch
  c.poly([cx - 8, cy, cx - 8, cy - 18, cx + 8, cy - 18, cx + 8, cy], "a")
  c.rect(cx - 6, cy - 16, 12, 16, "1") // inner dark
  // Wooden support frame around entrance
  c.line(cx - 10, cy, cx - 10, cy - 20, "b", 2)
  c.line(cx + 10, cy, cx + 10, cy - 20, "b", 2)
  c.hline(cx - 10, cy - 20, 20, "b")
  // Ore cart on rails prop
  c.rect(cx + 8, cy - 6, 12, 8, "q")
  c.px(cx + 10, cy - 8, "r")
  c.px(cx + 14, cy - 7, "s") // ore chunks
  c.line(cx + 6, cy, cx + 22, cy, "a", 1) // rails
  // Wooden shingled roof over entrance
  isoRoof(c, cx, cy - 32, 42, 24, 16, "l", "m", "k")
})
sprite("b_iso_mine_scaffold", { w: 64, h: 60, outline: "a" }, (c) => {
  const cx = 32, cy = 56
  isoBox(c, cx, cy, 38, 22, 16, "g", "h", "i", "f")
  isoScaffold(c, cx, cy - 16, 40, 24, 28)
})

// ==========================================
// 4. b_iso_smelter (64x66) - Stone forge, large brick chimney, glowing fire box
// ==========================================
sprite("b_iso_smelter", { w: 64, h: 66, outline: "a" }, (c) => {
  const cx = 32, cy = 62
  // Heavy stone base
  isoBox(c, cx, cy, 36, 22, 30, "g", "h", "i", "f")
  // Large central brick chimney stack
  c.rect(cx - 8, cy - 54, 16, 32, "4")
  c.line(cx - 8, cy - 54, cx - 8, cy - 22, "1", 1)
  c.px(cx, cy - 58, "5")
  c.px(cx - 3, cy - 61, "5")
  // Fire furnace opening with intense glow
  c.rect(cx - 6, cy - 14, 12, 12, "u")
  c.rect(cx - 4, cy - 12, 8, 8, "x")
  // Roof overhang
  isoRoof(c, cx, cy - 30, 40, 24, 14, "l", "m", "k")
})
sprite("b_iso_smelter_scaffold", { w: 64, h: 66, outline: "a" }, (c) => {
  const cx = 32, cy = 62
  isoBox(c, cx, cy, 36, 22, 18, "g", "h", "i", "f")
  isoScaffold(c, cx, cy - 18, 38, 24, 30)
})

// ==========================================
// 5. b_iso_smith (80x72) - Smithy with anvil prop, wide timber workshop
// ==========================================
sprite("b_iso_smith", { w: 80, h: 72, outline: "a" }, (c) => {
  const cx = 40, cy = 68
  // Stone foundation & timber walls
  isoBox(c, cx, cy, 48, 24, 32, "b", "c", "d", "a")
  // Sloped roof
  isoRoof(c, cx, cy - 32, 52, 28, 20, "l", "m", "k")
  // Double doors & window
  c.rect(cx - 16, cy - 16, 12, 16, "u")
  c.rect(cx + 8, cy - 24, 8, 8, "w")
  // Anvil & log prop outside
  c.rect(cx + 20, cy - 6, 8, 6, "q")
  c.px(cx + 22, cy - 8, "s") // hammer
  c.rect(cx - 24, cy - 4, 10, 6, "7") // wood log pile
})
sprite("b_iso_smith_scaffold", { w: 80, h: 72, outline: "a" }, (c) => {
  const cx = 40, cy = 68
  isoBox(c, cx, cy, 48, 24, 16, "b", "c", "d", "a")
  isoScaffold(c, cx, cy - 16, 50, 26, 32)
})

// ==========================================
// 6. b_iso_tower (64x88) - Tall watchtower, battlements, lookout shield & flag
// ==========================================
sprite("b_iso_tower", { w: 64, h: 88, outline: "a" }, (c) => {
  const cx = 32, cy = 84
  // Massive stone tower base & shaft
  isoBox(c, cx, cy, 34, 20, 64, "g", "h", "i", "f")
  // Crenelated battlements / top platform
  isoBox(c, cx, cy - 64, 38, 24, 14, "h", "i", "j", "f")
  // Arrow slit windows
  c.rect(cx - 2, cy - 20, 3, 10, "u")
  c.rect(cx - 2, cy - 44, 3, 10, "u")
  c.rect(cx + 10, cy - 32, 3, 10, "u")
  // Doorway at base
  c.rect(cx - 4, cy - 12, 8, 12, "u")
  // Tall flagpole with red banner
  c.line(cx, cy - 78, cx, cy - 64, "b", 2)
  c.poly([cx, cy - 78, cx + 16, cy - 74, cx, cy - 70], "4")
})
sprite("b_iso_tower_scaffold", { w: 64, h: 88, outline: "a" }, (c) => {
  const cx = 32, cy = 84
  isoBox(c, cx, cy, 34, 20, 32, "g", "h", "i", "f")
  isoScaffold(c, cx, cy - 32, 38, 24, 48)
})

// ==========================================
// 7. b_iso_market (80x70) - Market stalls, awnings, crates and goods
// ==========================================
sprite("b_iso_market", { w: 80, h: 70, outline: "a" }, (c) => {
  const cx = 40, cy = 66
  // Wooden platform & counters
  isoBox(c, cx, cy, 50, 26, 24, "b", "c", "d", "a")
  // Striped cloth awnings / canopy
  c.poly([cx - 24, cy - 36, cx + 24, cy - 36, cx + 16, cy - 24, cx - 16, cy - 24], "4")
  c.poly([cx - 24, cy - 36, cx, cy - 44, cx + 24, cy - 36], "5")
  c.line(cx - 24, cy - 36, cx - 16, cy - 24, "b", 2)
  c.line(cx + 24, cy - 36, cx + 16, cy - 24, "b", 2)
  // Support poles
  c.line(cx - 20, cy - 10, cx - 20, cy - 36, "b", 1)
  c.line(cx + 20, cy - 10, cx + 20, cy - 36, "b", 1)
  // Fruit / goods crates stacked on counter
  c.rect(cx - 12, cy - 18, 8, 8, "3")
  c.rect(cx + 4, cy - 18, 8, 8, "2")
  c.px(cx - 10, cy - 16, "4")
  c.px(cx + 6, cy - 16, "w")
})
sprite("b_iso_market_scaffold", { w: 80, h: 70, outline: "a" }, (c) => {
  const cx = 40, cy = 66
  isoBox(c, cx, cy, 50, 26, 14, "b", "c", "d", "a")
  isoScaffold(c, cx, cy - 14, 52, 28, 36)
})

// ==========================================
// 8. b_iso_monument (112x120) - Great Hall (Wonder), grand pillars, statues, golden roof
// ==========================================
sprite("b_iso_monument", { w: 112, h: 120, outline: "a" }, (c) => {
  const cx = 56, cy = 114
  // Massive stone stepped terrace
  isoBox(c, cx, cy, 72, 36, 24, "g", "h", "i", "f")
  // Grand hall main stone body with columns
  isoBox(c, cx, cy - 24, 60, 30, 56, "h", "i", "j", "f")
  // Magnificent multi-tiered golden/copper roof
  isoRoof(c, cx, cy - 80, 68, 34, 32, "r", "s", "p")
  // Golden crowning finial & glowing crystal
  c.line(cx, cy - 112, cx, cy - 96, "x", 2)
  c.px(cx, cy - 114, "5")
  // Tall arched stained glass windows & heavy double doors
  c.rect(cx - 8, cy - 36, 16, 28, "u")
  c.rect(cx - 6, cy - 34, 12, 24, "w")
  c.rect(cx - 26, cy - 50, 8, 18, "u")
  c.rect(cx + 18, cy - 50, 8, 18, "u")
  c.rect(cx - 26, cy - 30, 8, 18, "u")
  c.rect(cx + 18, cy - 30, 8, 18, "u")
  // Decorative flags / banners on sides
  c.line(cx - 30, cy - 64, cx - 30, cy - 44, "b", 2)
  c.poly([cx - 30, cy - 64, cx - 18, cy - 60, cx - 30, cy - 56], "4")
  c.line(cx + 30, cy - 64, cx + 30, cy - 44, "b", 2)
  c.poly([cx + 30, cy - 64, cx + 42, cy - 60, cx + 30, cy - 56], "4")
})
sprite("b_iso_monument_scaffold", { w: 112, h: 120, outline: "a" }, (c) => {
  const cx = 56, cy = 114
  isoBox(c, cx, cy, 72, 36, 24, "g", "h", "i", "f")
  isoScaffold(c, cx, cy - 24, 64, 32, 70)
})

// ==========================================
// SHEET EXPORT
// ==========================================
sheet("iso_buildings_b", [
  "b_iso_mill", "b_iso_mill_scaffold",
  "b_iso_bakery", "b_iso_bakery_scaffold",
  "b_iso_mine", "b_iso_mine_scaffold",
  "b_iso_smelter", "b_iso_smelter_scaffold",
  "b_iso_smith", "b_iso_smith_scaffold",
  "b_iso_tower", "b_iso_tower_scaffold",
  "b_iso_market", "b_iso_market_scaffold",
  "b_iso_monument", "b_iso_monument_scaffold"
], { pad: 1 })
