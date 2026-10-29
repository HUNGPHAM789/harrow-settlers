// Vibrant Modern HD Medieval Bakery (Authentic The Settlers II Color Harmony)
// Handcrafted using PXL's native declarative parts, patterns, layers and glow

pal({
  a: "#16111e", // deep ink contour
  b: "#22192b", // deep shadow
  
  // Bavarian Warm Cream Plaster (The Beloved Settlers II Walls)
  c: "#786d58", // shadow plaster
  d: "#a89b80", // mid plaster
  e: "#ded6be", // lit warm plaster
  f: "#f5edd2", // bright cream sunlit plaster
  
  // Honey Oak Timber Framing & Beams
  g: "#24130a", // deep timber shadow
  h: "#45220f", // dark oak timber
  i: "#6c3818", // mid oak timber
  j: "#944f22", // lit honey oak timber
  k: "#be6d34", // bright oak edge / pine plank
  l: "#df8a48", // sunlit timber highlight
  
  // River Stone & Granite Plinth
  m: "#20232d", // deep mortar
  n: "#383c4c", // dark stone block
  o: "#585d73", // mid stone block
  p: "#7d85a0", // lit stone face
  q: "#a7b0cd", // bright stone edge / quoin
  r: "#d0d8ec", // crisp specular stone
  
  // Radiant Terracotta Clay Spanish Roof Tiles (Vibrant Settlers Red-Orange)
  s: "#3d130e", // under-eave shadow
  t: "#6b1f15", // deep tile
  u: "#993020", // mid terracotta
  v: "#c74930", // lit terracotta tile
  w: "#ea6e4b", // bright orange ridge tile
  x: "#ff916e", // sunlit tile rim highlight
  
  // Hearth Fire, Candlelit Windows & Molten Glow
  1: "#7a1a0d", // deep ember
  2: "#d9771e", // amber hearth glow
  3: "#f5b838", // warm flame / window light
  4: "#fff28a", // intense white-hot center
  
  // Puffy Chimney Smoke
  5: "#424b5c", // soot
  6: "#697791", // mid smoke
  7: "#9ab0d1", // lit smoke
  8: "#dce6f5", // wispy white smoke
  
  // Living Props & Foliage
  A: "#4a3319", // wicker basket dark
  B: "#8a6538", // wicker basket mid
  C: "#ba7e32", // golden bread crust
  D: "#f5c35b", // scored baguette highlight
  E: "#faeab8", // flour dusting
  F: "#d9d0c1", // flour sack canvas
  G: "#9c9180", // sack shadow & rope
  H: "#386b28", // deep leaf
  I: "#5ca83e", // bright meadow leaf
  J: "#e63939", // geranium red flower
  K: "#ff6b6b"  // bright flower petal
})

ramps("ab", "cdef", "ghijkl", "mnoprq", "stuvwx", "1234", "5678", "ABCDE", "FG", "HI", "JK")

// ---------------------------------------------------------------- Reusable Parts
sprite("_baguette", `
  ....CD
  ..CDE.
  .CDE..
  CDE...
  DE....`)

sprite("_flour_sack", { w: 16, h: 14, outline: "a" }, (c) => {
  c.ellipse(8, 7, 7, 5, "F")
  c.ellipse(8, 6, 6, 4, "F")
  c.hline(2, 6, 12, "G") // rope tie
  c.px(8, 4, "A")
  c.px(8, 3, "A")
})

sprite("_bread_basket", { w: 20, h: 12, outline: "a" }, (c) => {
  c.ellipse(10, 6, 9, 5, "A")
  c.ellipse(10, 5, 8, 4, "B")
  c.ellipse(6, 4, 4, 2, "C")
  c.px(6, 3, "D")
  c.ellipse(13, 4, 4, 2, "C")
  c.px(13, 3, "D")
  c.px(10, 4, "E")
})

sprite("_flowerbox", { w: 24, h: 8, outline: "a" }, (c) => {
  c.rect(0, 3, 24, 5, "h")
  c.hline(0, 3, 24, "j")
  c.hline(2, 1, 20, "H")
  c.hline(4, 0, 16, "I")
  c.px(4, 0, "J"); c.px(8, 1, "K"); c.px(12, 0, "J"); c.px(16, 1, "K"); c.px(19, 0, "J")
})

sprite("_pretzel_sign", { w: 16, h: 16, outline: "a" }, (c) => {
  c.line(0, 2, 12, 2, "h", 2) // iron bracket
  c.line(10, 2, 10, 6, "a", 1) // chain
  c.ellipse(10, 10, 5, 4, "3") // golden pretzel
  c.ellipse(10, 10, 3, 2, "1")
  c.px(10, 10, "3")
})

// ---------------------------------------------------------------- 3D Isometric Math
const ISO = (ox, oy) => (x, y, z = 0) => [ox + x - y, oy + (x + y) / 2 - z]
const C3 = (P, x, y, z) => P(x, y, z).map(Math.round)

function isoPoly(c, P, pts, col) {
  const flat = []
  for (const p of pts) {
    const s = C3(P, p[0], p[1], p[2])
    flat.push(s[0], s[1])
  }
  c.poly(flat, col)
}

function isoBox(c, P, x, y, z, w, d, h, left, right, top) {
  if (left) isoPoly(c, P, [[x, y + d, z], [x, y, z], [x, y, z + h], [x, y + d, z + h]], left)
  if (right) isoPoly(c, P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], right)
  if (top) isoPoly(c, P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top)
}

function isoLine(c, P, a, b, col, w = 1) {
  const p = C3(P, a[0], a[1], a[2]), q = C3(P, b[0], b[1], b[2])
  c.line(p[0], p[1], q[0], q[1], col, w)
}

function isoPx(c, P, pt, col) {
  const p = C3(P, pt[0], pt[1], pt[2])
  c.px(p[0], p[1], col)
}

anim("b_hd_bakery_vibrant", { w: 220, h: 230, frames: 4, fps: 4, outline: "a" }, (c) => {
  const f = c.frame || 0
  const P = ISO(110, 105)
  const W = 76, D = 76
  
  // 1. Soft Ground Contact Shadow
  const gp = C3(P, W / 2, D / 2, 0)
  c.ellipse(gp[0] + 3, gp[1] + 3, 76, 35, "b")
  c.ellipse(gp[0] + 1, gp[1] + 1, 68, 30, "a")
  
  // Warm yellow light spill onto cobblestone road from door & oven
  c.ellipse(gp[0] - 16, gp[1] + 24, 26, 12, "2")
  c.ellipse(gp[0] - 16, gp[1] + 24, 16, 7, "3")
  
  // 2. High-Relief River Granite Plinth (z: 0 -> 16 px)
  isoBox(c, P, 3, 3, 0, W - 6, D - 6, 16, "n", "o", "p")
  
  // Chiseled ashlar blocks with deep mortar seams
  for (let z = 2; z < 15; z += 5) {
    for (let x = 4; x < W - 8; x += 11) {
      isoLine(c, P, [x, D - 3, z], [x + 9, D - 3, z], "p", 1)
      isoLine(c, P, [x + 9, D - 3, z], [x + 9, D - 3, z + 4], "n", 1)
      isoPx(c, P, [x + 1, D - 3, z + 4], "q") // bright limestone highlight!
    }
    isoLine(c, P, [3, D - 3, z], [W - 3, D - 3, z], "m", 1)
  }
  
  // 3. Sunny Bavarian Cream Plaster & Honey Oak Framing (z: 16 -> 52 px)
  isoBox(c, P, 5, 5, 16, W - 10, D - 10, 36, "d", "f", "e")
  
  // Ambient Occlusion under top overhang
  isoLine(c, P, [5, D - 5, 51], [W - 5, D - 5, 51], "c", 2)
  
  // Honey Oak Timber Framing (Heavy carved beams)
  isoLine(c, P, [5, D - 5, 16], [W - 5, D - 5, 16], "h", 2) // sill beam
  isoLine(c, P, [5, D - 5, 17], [W - 5, D - 5, 17], "k", 1)
  isoLine(c, P, [5, D - 5, 50], [W - 5, D - 5, 50], "h", 2) // top plate
  
  // Vertical timber studs
  for (let vx = 5; vx <= W - 5; vx += 16) {
    isoLine(c, P, [vx, D - 5, 16], [vx, D - 5, 50], "i", 2)
    isoLine(c, P, [vx + 1, D - 5, 16], [vx + 1, D - 5, 50], "k", 1)
  }
  // St. Andrew's Cross Bracing
  isoLine(c, P, [21, D - 5, 18], [37, D - 5, 48], "i", 2)
  isoLine(c, P, [21, D - 5, 48], [37, D - 5, 18], "h", 2)
  isoLine(c, P, [53, D - 5, 18], [69, D - 5, 48], "i", 2)
  isoLine(c, P, [53, D - 5, 48], [69, D - 5, 18], "h", 2)
  
  // 4. Proportionate Arched Doorway (Height = 36 units ≈ 85px screen clearance!)
  isoBox(c, P, 36, D - 5, 16, 16, 0, 32, null, "a", null)
  isoBox(c, P, 38, D - 5, 18, 12, 0, 28, null, "2", null) // warm amber candlelit interior
  isoLine(c, P, [36, D - 5, 16], [36, D - 5, 48], "h", 2)
  isoLine(c, P, [52, D - 5, 16], [52, D - 5, 48], "j", 2)
  isoLine(c, P, [35, D - 5, 48], [53, D - 5, 48], "k", 2)
  
  // Leaded Glass Window with glowing warm light
  isoBox(c, P, 56, D - 5, 28, 12, 0, 14, null, "3", null)
  isoLine(c, P, [62, D - 5, 28], [62, D - 5, 42], "h", 1)
  isoLine(c, P, [56, D - 5, 35], [68, D - 5, 35], "h", 1)
  // Window flowerbox with red geraniums
  const fbp = C3(P, 55, D - 3, 26)
  c.stamp("_flowerbox", fbp[0], fbp[1])
  
  // Hanging Wrought-Iron Pretzel Sign
  const sp_sign = C3(P, 33, D - 5, 44)
  c.stamp("_pretzel_sign", sp_sign[0] - 2, sp_sign[1] - 4)
  
  // 5. Radiant Terracotta Clay Tile Gable Roof (z: 50 -> 88 px)
  const zEave = 48, zRidge = 86
  const yRidge = D / 2
  
  // South roof slope (lit face)
  isoPoly(c, P, [
    [0, D + 2, zEave],
    [W + 2, D + 2, zEave],
    [W + 2, yRidge, zRidge],
    [0, yRidge, zRidge]
  ], "v")
  
  // North roof slope
  isoPoly(c, P, [
    [0, -2, zEave],
    [W + 2, -2, zEave],
    [W + 2, yRidge, zRidge],
    [0, yRidge, zRidge]
  ], "w")
  
  // Gable triangle (Fachwerk in-fill)
  isoPoly(c, P, [
    [W + 2, -2, zEave],
    [W + 2, D + 2, zEave],
    [W + 2, yRidge, zRidge]
  ], "d")
  isoLine(c, P, [W + 2, D + 2, zEave], [W + 2, yRidge, zRidge], "j", 2)
  isoLine(c, P, [W + 2, -2, zEave], [W + 2, yRidge, zRidge], "i", 2)
  
  // Individual Spanish curved clay roof tiles with bright sunny rims!
  for (let rz = zEave + 3; rz < zRidge; rz += 5) {
    const tRatio = (rz - zEave) / (zRidge - zEave)
    const ry = (D + 2) - tRatio * ((D + 2) - yRidge)
    isoLine(c, P, [1, ry, rz], [W + 1, ry, rz], "t", 1)
    for (let rx = 3; rx < W; rx += 5) {
      isoLine(c, P, [rx, ry, rz], [rx, ry - 3, rz + 3], "u", 1)
      isoPx(c, P, [rx + 1, ry, rz], "w") // bright sunny terracotta highlight!
      isoPx(c, P, [rx + 1, ry - 1, rz + 1], "x") // specular rim
    }
  }
  // Ridge cap tiles along the very top
  isoLine(c, P, [0, yRidge, zRidge], [W + 2, yRidge, zRidge], "x", 2)
  
  // Deep shadow under overhanging roof eaves
  isoLine(c, P, [1, D + 3, zEave - 1], [W + 1, D + 3, zEave - 1], "s", 2)
  
  // 6. Stone Bread Oven & Smoking Chimney (Left Wing)
  isoBox(c, P, 6, D - 8, 0, 24, 18, 18, "n", "o", "p")
  const op = C3(P, 18, D + 1, 18)
  c.ellipse(op[0], op[1], 15, 8, "u")
  c.ellipse(op[0], op[1] - 1, 13, 6, "v")
  
  // Arched Oven Mouth with Soot Staining & Molten Fire
  isoBox(c, P, 12, D + 10, 3, 12, 0, 10, null, "a", null)
  // 4-Frame Dancing Fire Animation
  const fireF = (f % 4)
  const fc1 = ["1", "2", "3", "2"][fireF]
  const fc2 = ["2", "3", "4", "3"][fireF]
  isoBox(c, P, 14, D + 10, 4, 8, 0, 7, null, fc1, null)
  isoBox(c, P, 15, D + 10, 5, 6, 0, 5, null, fc2, null)
  isoPx(c, P, [17, D + 10, 7], "4") // white-hot dancing spark!
  
  // Stone Chimney with Puffy Drifting Smoke
  isoBox(c, P, 24, D - 5, 18, 8, 8, 36, "n", "o", "p")
  isoLine(c, P, [24, D + 3, 54], [32, D + 3, 54], "5", 2) // soot rim
  
  // Animated curling smoke plume (4-frame loop)
  const puffs = [
    [[28, D, 58, 4, "7"], [29, D - 2, 65, 6, "6"], [31, D - 4, 73, 7, "7"], [33, D - 6, 81, 8, "8"]],
    [[28, D, 59, 4, "6"], [30, D - 3, 66, 7, "7"], [32, D - 5, 74, 7, "8"], [34, D - 7, 82, 8, "8"]],
    [[27, D, 57, 5, "7"], [29, D - 2, 64, 6, "7"], [33, D - 5, 72, 8, "6"], [35, D - 8, 80, 8, "8"]],
    [[28, D, 58, 4, "6"], [28, D - 2, 65, 7, "7"], [32, D - 4, 73, 7, "8"], [34, D - 7, 83, 9, "8"]]
  ]
  for (const pf of puffs[f]) {
    const sp_puff = C3(P, pf[0], pf[1], pf[2])
    c.ellipse(sp_puff[0], sp_puff[1], pf[3], Math.round(pf[3] * 0.7), pf[4])
  }
  
  // 7. Living Props Stamp
  // Stacked firewood
  isoBox(c, P, 2, D + 2, 0, 6, 10, 8, "h", "i", "g")
  for (let lz = 2; lz < 8; lz += 3) {
    for (let ly = D + 3; ly < D + 11; ly += 4) {
      isoPx(c, P, [2, ly, lz], "k")
      isoPx(c, P, [2, ly + 1, lz], "l")
    }
  }
  
  // Flour Sacks on right
  const fsp = C3(P, W - 14, 28, 0)
  c.stamp("_flour_sack", fsp[0] - 8, fsp[1] - 14)
  
  // Bread Baskets with baguettes on right
  const bbp = C3(P, W - 2, 16, 0)
  c.stamp("_bread_basket", bbp[0] - 10, bbp[1] - 12)
})
