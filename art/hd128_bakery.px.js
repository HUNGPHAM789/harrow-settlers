// 128px Scale Ultra HD Medieval Bakery (b_hd128_bakery)
// Authoring Resolution: 340x360 px canvas
// Human Scale: 128px character (71 px/metre)
// Doorway height: 148px clearance (matches 128px Settler with ample headroom)
// 2 Storeys with Bavarian Fachwerk timber framing, Spanish terracotta tiles, river stone plinth

pal({
  a: "#110b16", // darkest crevice
  b: "#1c1424", // deep occlusion
  
  // Plaster & Mortar (Bavarian Cream)
  c: "#5e5443", // occlusion plaster
  d: "#877b63", // shadow plaster
  e: "#b5aa91", // mid plaster
  f: "#d6cbb0", // lit plaster
  g: "#ede3c7", // bright cream plaster
  
  // Carved Oak Framing & Timber Beams
  h: "#1c0d06", // deepest timber crease
  i: "#33180a", // dark oak timber
  j: "#4f2610", // mid oak timber
  k: "#733817", // lit oak timber
  l: "#9c4e20", // bright timber highlight
  m: "#bf6c34", // pine plank / wooden paddle
  
  // River Stone Masonry (Ashlar & fieldstone)
  n: "#171821", // mortar line
  o: "#2b2e3b", // dark stone
  p: "#454b5c", // mid stone
  q: "#636c82", // lit stone
  r: "#8792ad", // bright stone
  s: "#afbad4", // crisp specular stone
  
  // Terracotta Clay Tiles
  t: "#2b0a07", // under-eave roof shadow
  u: "#4f140d", // deep tile shadow
  v: "#782216", // dark tile
  w: "#a83522", // mid tile
  x: "#cc4f33", // lit tile
  y: "#e87154", // bright tile ridge
  
  // Hearth Fire, Coals & Windows
  1: "#7a1a0d", // deep ember
  2: "#bd3a11", // glowing coal
  3: "#f57818", // bright orange flame
  4: "#f5b838", // warm flame / candlelit window
  5: "#fff28a", // intense molten core
  
  // Smoke Plume
  6: "#333a47", // soot
  7: "#556073", // mid smoke
  8: "#8291a8", // lit smoke
  9: "#b8c7db", // wispy smoke
  
  // Living Props
  A: "#452d14", // wicker basket dark
  B: "#785328", // wicker mid
  C: "#ad7d40", // golden bread crust
  D: "#e0ad65", // bread flour score
  E: "#d6ccbe", // flour sack canvas
  F: "#9c9182", // sack shadow & rope
  G: "#234a1a", // moss & ivy
  H: "#3f7a2f", // bright leaf
  I: "#c72e2e", // flower red
  J: "#e85858"  // bright petal
})

ramps("ab", "cdefg", "hijklm", "nopqrs", "tuvwxy", "12345", "6789", "ABCD", "EF", "GH", "IJ")

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

sprite("b_hd128_bakery", { w: 340, h: 360, outline: "a" }, (c) => {
  const P = ISO(170, 160)
  const W = 110, D = 110
  
  // 1. Soft Ground Ambient Occlusion Ellipse
  const gp = C3(P, W / 2, D / 2, 0)
  c.ellipse(gp[0] + 4, gp[1] + 4, 115, 52, "b")
  c.ellipse(gp[0] + 2, gp[1] + 2, 105, 46, "a")
  
  // Warm yellow light spill onto ground from door and oven
  c.ellipse(gp[0] - 25, gp[1] + 35, 36, 16, "2")
  c.ellipse(gp[0] - 25, gp[1] + 35, 22, 10, "3")
  
  // 2. Heavy River Stone Foundation Plinth (z: 0 -> 24 px)
  isoBox(c, P, 4, 4, 0, W - 8, D - 8, 24, "o", "p", "q")
  
  // Chiseled stone masonry with deep mortar seams
  for (let z = 2; z < 22; z += 7) {
    for (let x = 6; x < W - 12; x += 14) {
      isoLine(c, P, [x, D - 4, z], [x + 12, D - 4, z], "r", 1)
      isoLine(c, P, [x + 12, D - 4, z], [x + 12, D - 4, z + 5], "o", 1)
      isoPx(c, P, [x + 2, D - 4, z + 5], "s") // specular corner highlight
    }
    isoLine(c, P, [4, D - 4, z], [W - 4, D - 4, z], "n", 1)
  }
  
  // Moss on damp lower stones
  for (let mx = 8; mx < 45; mx += 6) {
    isoPx(c, P, [mx, D - 4, 2], "G")
    isoPx(c, P, [mx + 1, D - 4, 3], "H")
  }
  
  // 3. Ground Floor Walls & Bavarian Fachwerk Oak Framing (z: 24 -> 80 px)
  isoBox(c, P, 8, 8, 24, W - 16, D - 16, 56, "d", "f", "e")
  
  // Timber sill beam & top plate
  isoLine(c, P, [8, D - 8, 24], [W - 8, D - 8, 24], "i", 3)
  isoLine(c, P, [8, D - 8, 26], [W - 8, D - 8, 26], "l", 1)
  isoLine(c, P, [8, D - 8, 78], [W - 8, D - 8, 78], "i", 3)
  
  // Vertical timber studs (spaced every 18 units)
  for (let vx = 8; vx <= W - 8; vx += 18) {
    isoLine(c, P, [vx, D - 8, 24], [vx, D - 8, 78], "j", 3)
    isoLine(c, P, [vx + 1, D - 8, 24], [vx + 1, D - 8, 78], "l", 1)
  }
  // St. Andrew's diagonal cross braces
  isoLine(c, P, [26, D - 8, 26], [44, D - 8, 76], "j", 2)
  isoLine(c, P, [26, D - 8, 76], [44, D - 8, 26], "i", 2)
  isoLine(c, P, [80, D - 8, 26], [98, D - 8, 76], "j", 2)
  isoLine(c, P, [80, D - 8, 76], [98, D - 8, 26], "i", 2)
  
  // 4. THE PROPORTIONATE DOORWAY (z: 24 -> 76 px, height = 52 units ≈ 148px screen clearance!)
  // Perfectly matches 128px Settler walking through!
  isoBox(c, P, 50, D - 8, 24, 24, 0, 48, null, "a", null)
  isoBox(c, P, 52, D - 8, 26, 20, 0, 44, null, "1", null) // warm interior candlelit glow
  // Heavy oak door frame & lintel
  isoLine(c, P, [50, D - 8, 24], [50, D - 8, 72], "h", 3)
  isoLine(c, P, [74, D - 8, 24], [74, D - 8, 72], "k", 3)
  isoLine(c, P, [48, D - 8, 72], [76, D - 8, 72], "l", 3)
  
  // Leaded Glass Windows with warm glow
  isoBox(c, P, 82, D - 8, 42, 16, 0, 20, null, "4", null)
  isoLine(c, P, [90, D - 8, 42], [90, D - 8, 62], "h", 1)
  isoLine(c, P, [82, D - 8, 52], [98, D - 8, 52], "h", 1)
  // Window flowerbox with blooming red flowers
  isoBox(c, P, 80, D - 6, 38, 20, 4, 5, "j", "k", "l")
  for (let fx = 82; fx < 98; fx += 3) {
    isoPx(c, P, [fx, D - 5, 44], "I")
    isoPx(c, P, [fx + 1, D - 5, 45], "J")
  }
  
  // 5. Overhanging Second Storey / Attic (Jettying) (z: 80 -> 125 px)
  isoBox(c, P, 6, 6, 80, W - 12, D - 12, 45, "d", "f", "e")
  // Carved wooden jetty corbels supporting the cantilever
  for (let jx = 10; jx < W - 10; jx += 16) {
    isoLine(c, P, [jx, D - 6, 76], [jx, D - 6, 82], "k", 2)
  }
  
  // 6. Terracotta Clay Tile Gable Roof (z: 120 -> 180 px)
  const zEave = 115, zRidge = 175
  const yRidge = D / 2
  
  // South roof slope
  isoPoly(c, P, [
    [0, D + 4, zEave],
    [W + 4, D + 4, zEave],
    [W + 4, yRidge, zRidge],
    [0, yRidge, zRidge]
  ], "w")
  
  // North roof slope
  isoPoly(c, P, [
    [0, -4, zEave],
    [W + 4, -4, zEave],
    [W + 4, yRidge, zRidge],
    [0, yRidge, zRidge]
  ], "x")
  
  // Gable Fachwerk triangle
  isoPoly(c, P, [
    [W + 4, -4, zEave],
    [W + 4, D + 4, zEave],
    [W + 4, yRidge, zRidge]
  ], "d")
  isoLine(c, P, [W + 4, D + 4, zEave], [W + 4, yRidge, zRidge], "k", 3)
  isoLine(c, P, [W + 4, -4, zEave], [W + 4, yRidge, zRidge], "j", 3)
  
  // Individual curved clay tiles with mortar shadow
  for (let rz = zEave + 4; rz < zRidge; rz += 6) {
    const tRatio = (rz - zEave) / (zRidge - zEave)
    const ry = (D + 4) - tRatio * ((D + 4) - yRidge)
    isoLine(c, P, [2, ry, rz], [W + 2, ry, rz], "u", 2)
    for (let rx = 6; rx < W; rx += 7) {
      isoLine(c, P, [rx, ry, rz], [rx, ry - 4, rz + 4], "v", 1)
      isoPx(c, P, [rx + 1, ry, rz], "y") // tile rim specular
    }
  }
  // Ridge cap tiles
  isoLine(c, P, [0, yRidge, zRidge], [W + 4, yRidge, zRidge], "y", 3)
  
  // Deep ambient occlusion under eaves
  isoLine(c, P, [2, D + 5, zEave - 2], [W + 2, D + 5, zEave - 2], "t", 3)
  
  // 7. Stone Bread Oven & Smoking Chimney
  // Outdoor dome oven wing
  isoBox(c, P, 10, D - 10, 0, 36, 28, 28, "o", "p", "q")
  const op = C3(P, 28, D + 4, 28)
  c.ellipse(op[0], op[1], 24, 12, "v")
  c.ellipse(op[0], op[1] - 2, 20, 10, "w")
  
  // Oven mouth glowing with molten embers
  isoBox(c, P, 20, D + 18, 4, 16, 0, 14, null, "1", null)
  isoBox(c, P, 22, D + 18, 6, 12, 0, 10, null, "3", null)
  isoPx(c, P, [26, D + 18, 9], "5")
  isoPx(c, P, [27, D + 18, 9], "5")
  
  // Stone Chimney rising high
  isoBox(c, P, 36, D - 6, 28, 12, 12, 54, "o", "p", "q")
  // Soot wash on rim
  isoLine(c, P, [36, D + 6, 82], [48, D + 6, 82], "6", 2)
  
  // Multi-tier drifting smoke plume
  const sp1 = C3(P, 42, D, 86)
  c.ellipse(sp1[0], sp1[1], 8, 6, "7")
  const sp2 = C3(P, 44, D - 4, 98)
  c.ellipse(sp2[0], sp2[1], 11, 8, "8")
  const sp3 = C3(P, 47, D - 8, 112)
  c.ellipse(sp3[0], sp3[1], 15, 10, "9")
  
  // 8. Living Props (Wicker baskets with bread, flour sacks, firewood)
  // Stacked firewood
  isoBox(c, P, 4, D + 4, 0, 8, 16, 12, "j", "k", "h")
  for (let lz = 2; lz < 12; lz += 4) {
    for (let ly = D + 6; ly < D + 18; ly += 5) {
      isoPx(c, P, [4, ly, lz], "m")
      isoPx(c, P, [4, ly + 1, lz], "l")
    }
  }
  
  // Wicker bread baskets on right
  const bp = C3(P, W - 6, 24, 0)
  c.ellipse(bp[0], bp[1], 14, 8, "A")
  c.ellipse(bp[0], bp[1] - 2, 12, 6, "B")
  c.ellipse(bp[0] - 3, bp[1] - 4, 6, 3, "C")
  c.px(bp[0] - 3, bp[1] - 5, "D")
  c.ellipse(bp[0] + 3, bp[1] - 3, 6, 3, "C")
  c.px(bp[0] + 3, bp[1] - 4, "D")
  
  // Stacked canvas flour sacks
  isoBox(c, P, W - 16, 40, 0, 14, 12, 12, "F", "E", "E")
  isoLine(c, P, [W - 16, 46, 7], [W - 2, 46, 7], "A", 2) // rope binding
})
