// 2X HD Prototype: Medieval Bavarian Bakery (b_hd_bakery)
// Built with True 3D ISO(x,y,z) at 30 px/metre (Last Fortress standard)
// Features all 3 requested add-ons:
// 1. Ambient Occlusion & Crevice Dirt (under eaves, plinth contact, oven soot)
// 2. Living Props (Split firewood stack, flour sacks, bread baskets, pretzel trade sign, rain barrel, flowerbox)
// 3. Animated Effects & Rich Lighting (4-frame chimney smoke, flickering hearth fire, ground light spill)

pal({
  // Outline & Deep Crevice Occlusion
  a: "#110d18", // darkest crevice & occlusion
  b: "#1f1726", // deep shadow
  
  // Plaster & Mortar (Cream Bavarian Fachwerk)
  c: "#665c49", // occlusion plaster
  d: "#8f8369", // shadow plaster
  e: "#bfb49b", // mid plaster
  f: "#ded6be", // lit plaster
  g: "#f5edd2", // bright cream plaster
  
  // Oak Timber Framing (Heavy carved beams)
  h: "#1c0d06", // deepest timber crease
  i: "#361a0b", // dark oak timber
  j: "#542a12", // mid oak timber
  k: "#7a3e1c", // lit oak timber
  l: "#a85929", // bright timber highlight
  m: "#cb7c44", // pine plank / wooden paddle
  
  // River Stone & Fieldstone Masonry (High relief)
  n: "#1a1c24", // stone mortar crease
  o: "#2d313d", // dark stone
  p: "#474d5e", // mid stone
  q: "#687087", // lit stone face
  r: "#8e98b3", // bright stone highlight
  s: "#b8c1db", // crisp stone specular
  
  // Terracotta Clay Tiles (Spanish curved tile pattern)
  t: "#2e0c08", // under-eave roof shadow
  u: "#54160e", // deep tile shadow
  v: "#822619", // dark tile
  w: "#b33b27", // mid tile
  x: "#d95738", // lit tile face
  y: "#f07d58", // bright tile ridge highlight
  
  // Hearth Fire, Molten Coals & Warm Glow
  1: "#7a1a0d", // deep red ember
  2: "#bd3a11", // glowing coal
  3: "#f57818", // bright orange flame
  4: "#f5b838", // golden flame / warm window light
  5: "#fff28a", // intense white-hot core
  
  // Animated Chimney Smoke
  6: "#383f4f", // dense dark soot
  7: "#606b80", // mid smoke
  8: "#8fa0bc", // lit smoke
  9: "#c8d4e6", // faint wispy smoke plume
  
  // Living Props & Accents
  A: "#4a3319", // wicker basket dark
  B: "#8a6538", // wicker basket mid
  C: "#c4985a", // golden baked bread crust
  D: "#f0d592", // bread score / flour dust
  E: "#e8ded1", // canvas flour sack
  F: "#a89b88", // sack shadow & rope
  G: "#2d5e23", // deep moss & foliage
  H: "#4f9e33", // bright leaf green
  I: "#d93838", // red geranium bloom
  J: "#f06c6c", // bright flower petal
  K: "#2b4259", // water in barrel
  L: "#4d7399"  // water highlight
})

ramps("ab", "cdefg", "hijklm", "nopqrs", "tuvwxy", "12345", "6789", "ABCD", "EF", "GH", "IJ", "KL")

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

anim("b_hd_bakery", { w: 128, h: 128, frames: 4, fps: 4, outline: "a" }, (c) => {
  const f = c.frame || 0
  const P = ISO(64, 60)
  const W = 54, D = 54
  
  // -----------------------------------------------------------------------
  // ADD-ON 1: AMBIENT OCCLUSION & GROUND CONTACT SHADOWS
  // -----------------------------------------------------------------------
  // Soft ground contact shadow ellipse underneath building footprint
  const gp = C3(P, W / 2, D / 2, 0)
  c.ellipse(gp[0] + 2, gp[1] + 2, 54, 25, "b")
  c.ellipse(gp[0] + 1, gp[1] + 1, 48, 22, "a")
  
  // Warm yellow light spill onto the ground in front of the oven/door
  c.ellipse(gp[0] - 12, gp[1] + 16, 16, 7, "2")
  c.ellipse(gp[0] - 12, gp[1] + 16, 10, 4, "3")
  
  // -----------------------------------------------------------------------
  // 1. HIGH-RELIEF RIVER STONE FOUNDATION PLINTH (z: 0 -> 12)
  // -----------------------------------------------------------------------
  isoBox(c, P, 2, 2, 0, W - 4, D - 4, 12, "o", "p", "q")
  
  // Individual rounded stone blocks on South-East face
  for (let z = 1; z < 11; z += 5) {
    for (let x = 4; x < W - 6; x += 9) {
      isoLine(c, P, [x, D - 2, z], [x + 7, D - 2, z], "r", 1)
      isoLine(c, P, [x + 7, D - 2, z], [x + 7, D - 2, z + 3], "o", 1)
      isoPx(c, P, [x + 1, D - 2, z + 3], "s") // specular highlight on stone corner
    }
  }
  // Mortar creases
  isoLine(c, P, [2, D - 2, 6], [W - 2, D - 2, 6], "n", 1)
  
  // Moss creeping up the stone base (Add-on 1 & 2)
  isoPx(c, P, [6, D - 2, 1], "G"); isoPx(c, P, [7, D - 2, 2], "H"); isoPx(c, P, [8, D - 2, 1], "G")
  isoPx(c, P, [28, D - 2, 1], "G"); isoPx(c, P, [29, D - 2, 1], "H")
  
  // -----------------------------------------------------------------------
  // 2. FACHWERK OAK & CREAM PLASTER WALLS (z: 12 -> 36)
  // -----------------------------------------------------------------------
  // Plaster core
  isoBox(c, P, 4, 4, 12, W - 8, D - 8, 24, "d", "f", "e")
  
  // Ambient Occlusion shadow under top eaves (Add-on 1)
  isoLine(c, P, [4, D - 4, 35], [W - 4, D - 4, 35], "c", 2)
  isoLine(c, P, [4, D - 4, 36], [W - 4, D - 4, 36], "a", 1)
  
  // Heavy Timber Studs (Oak Framing)
  // Base sill beam
  isoLine(c, P, [4, D - 4, 12], [W - 4, D - 4, 12], "i", 2)
  isoLine(c, P, [4, D - 4, 13], [W - 4, D - 4, 13], "k", 1)
  // Corner posts
  isoLine(c, P, [4, D - 4, 12], [4, D - 4, 36], "j", 2)
  isoLine(c, P, [W - 4, D - 4, 12], [W - 4, D - 4, 36], "k", 2)
  // Center vertical stud
  isoLine(c, P, [32, D - 4, 12], [32, D - 4, 36], "j", 2)
  isoLine(c, P, [33, D - 4, 12], [33, D - 4, 36], "l", 1)
  // Diagonal cross-bracing (St. Andrew's cross)
  isoLine(c, P, [33, D - 4, 14], [W - 5, D - 4, 34], "j", 1)
  isoLine(c, P, [33, D - 4, 34], [W - 5, D - 4, 14], "i", 1)
  
  // -----------------------------------------------------------------------
  // 3. LEADED GLASS WINDOW WITH FLOWERBOX (South-East Wall)
  // -----------------------------------------------------------------------
  // Dark window recess with warm amber interior glow (Add-on 3)
  isoBox(c, P, 38, D - 4, 20, 10, 0, 10, null, "1", null)
  isoBox(c, P, 39, D - 4, 21, 8, 0, 8, null, "4", null)
  // Leaded diamond mullions
  isoLine(c, P, [43, D - 4, 21], [43, D - 4, 29], "h", 1)
  isoLine(c, P, [39, D - 4, 25], [47, D - 4, 25], "h", 1)
  // Timber window sill & flowerbox (Add-on 2)
  isoBox(c, P, 37, D - 3, 18, 12, 3, 3, "j", "k", "l")
  // Vibrant blooming geranium flowers
  isoLine(c, P, [38, D - 2, 21], [48, D - 2, 21], "G", 1)
  isoPx(c, P, [39, D - 2, 22], "I"); isoPx(c, P, [41, D - 2, 22], "J"); isoPx(c, P, [42, D - 2, 23], "I")
  isoPx(c, P, [45, D - 2, 22], "I"); isoPx(c, P, [47, D - 2, 22], "J")
  
  // -----------------------------------------------------------------------
  // 4. OVERHANGING TERRACOTTA CLAY TILE GABLE ROOF (z: 36 -> 60)
  // -----------------------------------------------------------------------
  const zEave = 34, zRidge = 58
  const yRidge = D / 2
  
  // Roof South slope
  isoPoly(c, P, [
    [0, D, zEave],
    [W, D, zEave],
    [W, yRidge, zRidge],
    [0, yRidge, zRidge]
  ], "w")
  
  // Roof North slope (rear lit)
  isoPoly(c, P, [
    [0, 0, zEave],
    [W, 0, zEave],
    [W, yRidge, zRidge],
    [0, yRidge, zRidge]
  ], "x")
  
  // Gable triangles (Fachwerk in-fill)
  isoPoly(c, P, [
    [W, 0, zEave],
    [W, D, zEave],
    [W, yRidge, zRidge]
  ], "d")
  // Timber truss in gable
  isoLine(c, P, [W, D, zEave], [W, yRidge, zRidge], "k", 2)
  isoLine(c, P, [W, 0, zEave], [W, yRidge, zRidge], "j", 2)
  isoLine(c, P, [W, yRidge, zEave], [W, yRidge, zRidge], "k", 2)
  
  // Micro-textured curved Spanish clay roof tiles (Add-on 1 & Avenue A)
  for (let rz = zEave + 2; rz < zRidge; rz += 4) {
    const tRatio = (rz - zEave) / (zRidge - zEave)
    const ry = D - tRatio * (D - yRidge)
    // Horizontal tile overlap line (shadow underneath each course)
    isoLine(c, P, [1, ry, rz], [W - 1, ry, rz], "u", 1)
    // Individual curved tile lips & highlights
    for (let rx = 3; rx < W - 2; rx += 4) {
      isoLine(c, P, [rx, ry, rz], [rx, ry - 3, rz + 3], "v", 1)
      isoPx(c, P, [rx + 1, ry, rz], "y") // bright tile highlight
    }
  }
  
  // Ridge Cap Tiles along peak
  isoLine(c, P, [0, yRidge, zRidge], [W, yRidge, zRidge], "y", 2)
  
  // Deep shadow under the wide overhanging roof eaves (Ambient Occlusion)
  isoLine(c, P, [1, D + 1, zEave - 1], [W - 1, D + 1, zEave - 1], "t", 2)
  
  // -----------------------------------------------------------------------
  // 5. STONE BREAD OVEN & SMOKING CHIMNEY (Front Left Wing)
  // -----------------------------------------------------------------------
  // Heavy outdoor dome oven base
  isoBox(c, P, 6, D - 6, 0, 20, 16, 14, "o", "p", "q")
  
  // Domed oven brick roof
  const op = C3(P, 16, D + 2, 14)
  c.ellipse(op[0], op[1], 12, 6, "v")
  c.ellipse(op[0], op[1] - 1, 10, 5, "w")
  
  // Arched Oven Mouth with Soot Staining (Add-on 1)
  isoBox(c, P, 11, D + 10, 2, 10, 0, 8, null, "a", null)
  // Soot wash above mouth
  isoBox(c, P, 10, D + 10, 10, 12, 0, 4, null, "6", null)
  
  // Molten flickering fire hearth (Add-on 3: Frame-dependent animation!)
  const fireF = (f % 4)
  const fCol1 = ["1", "2", "3", "2"][fireF]
  const fCol2 = ["2", "3", "4", "3"][fireF]
  const fCol3 = ["4", "5", "5", "4"][fireF]
  
  isoBox(c, P, 12, D + 9, 3, 8, 0, 6, null, fCol1, null)
  isoBox(c, P, 13, D + 9, 3, 6, 0, 4, null, fCol2, null)
  isoPx(c, P, [15, D + 9, 5], fCol3) // white-hot dancing spark
  isoPx(c, P, [16, D + 9, 4], "5")
  
  // Heavy Stone Chimney with Cap
  isoBox(c, P, 20, D - 4, 14, 6, 6, 26, "o", "p", "q")
  // Soot around chimney rim
  isoLine(c, P, [20, D + 2, 40], [26, D + 2, 40], "6", 1)
  
  // ANIMATED CHIMNEY SMOKE (Add-on 3: 4-Frame drifting puff)
  const sOffsets = [
    [[23, D - 1, 42, 3, "8"], [24, D - 2, 47, 4, "7"], [25, D - 4, 53, 5, "8"], [27, D - 6, 59, 6, "9"]],
    [[23, D - 1, 43, 3, "7"], [25, D - 3, 48, 5, "8"], [26, D - 5, 54, 5, "9"], [28, D - 7, 60, 6, "9"]],
    [[22, D - 1, 41, 4, "8"], [24, D - 2, 46, 4, "8"], [27, D - 5, 52, 6, "7"], [29, D - 8, 58, 6, "9"]],
    [[23, D - 1, 42, 3, "7"], [23, D - 2, 47, 5, "8"], [26, D - 4, 53, 5, "9"], [28, D - 7, 61, 7, "9"]]
  ]
  for (const puff of sOffsets[f]) {
    const sp = C3(P, puff[0], puff[1], puff[2])
    c.ellipse(sp[0], sp[1], puff[3], Math.round(puff[3] * 0.7), puff[4])
  }
  
  // -----------------------------------------------------------------------
  // 6. LIVING PROPS & BAKER'S VIGNETTES (Add-on 2)
  // -----------------------------------------------------------------------
  // Prop A: Stack of Split Firewood Logs next to oven
  isoBox(c, P, 2, D + 2, 0, 5, 8, 6, "j", "k", "h")
  for (let lz = 1; lz < 6; lz += 2) {
    for (let ly = D + 3; ly < D + 9; ly += 3) {
      isoPx(c, P, [2, ly, lz], "m") // exposed cut log face
      isoPx(c, P, [2, ly + 1, lz], "l")
    }
  }
  
  // Prop B: Baker's Wooden Peel (paddle with unbaked loaf)
  isoLine(c, P, [27, D + 6, 0], [25, D + 2, 16], "k", 1)
  isoBox(c, P, 24, D + 2, 14, 4, 0, 5, null, "m", null)
  
  // Prop C: Wicker Baskets of Fresh Golden Bread (Front Right)
  const bp1 = C3(P, W - 2, 16, 0)
  c.ellipse(bp1[0], bp1[1], 7, 4, "A")
  c.ellipse(bp1[0], bp1[1] - 1, 6, 3, "B")
  // Golden crust baguettes
  c.ellipse(bp1[0] - 2, bp1[1] - 3, 3, 2, "C")
  c.px(bp1[0] - 2, bp1[1] - 4, "D") // scored cut
  c.ellipse(bp1[0] + 2, bp1[1] - 2, 3, 2, "C")
  c.px(bp1[0] + 2, bp1[1] - 3, "D")
  
  // Prop D: Stacked Canvas Flour Sacks tied with rope
  isoBox(c, P, W - 8, 26, 0, 7, 6, 6, "F", "E", "E")
  isoLine(c, P, [W - 8, 29, 4], [W - 1, 29, 4], "A", 1) // rope binding
  isoBox(c, P, W - 7, 27, 6, 6, 5, 5, "F", "E", "E")
  
  // Prop E: Oak Rainwater Barrel with iron hoops under rear eave
  const rp = C3(P, 5, 4, 0)
  c.ellipse(rp[0], rp[1] - 3, 5, 7, "i")
  c.ellipse(rp[0], rp[1] - 4, 4, 6, "j")
  c.hline(rp[0] - 4, rp[1] - 5, 8, "n") // iron hoop
  c.ellipse(rp[0], rp[1] - 9, 4, 2, "K") // water surface
  c.px(rp[0] + 1, rp[1] - 9, "L") // water shine
  
  // Prop F: Hanging Wrought-Iron Pretzel Trade Sign
  const sp1 = C3(P, 34, D - 4, 28)
  c.line(sp1[0], sp1[1], sp1[0] + 6, sp1[1] + 1, "h", 1) // iron bracket
  c.line(sp1[0] + 6, sp1[1] + 1, sp1[0] + 6, sp1[1] + 4, "a", 1) // chain
  // Golden pretzel symbol
  c.ellipse(sp1[0] + 6, sp1[1] + 6, 3, 2, "4")
  c.px(sp1[0] + 6, sp1[1] + 6, "h")
})
