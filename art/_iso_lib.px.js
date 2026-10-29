// Shared 3D Isometric Engine & Medieval Architectural Library for Harrow Settlers
// Modeled directly on the proven Last Fortress 3D isometric architecture (ISO(x,y,z))
// Authentic The Settlers II European Medieval Pixel Art Standard

pal({
  // Outline & Deep Shadows
  a: "#16111e", // deep ink outline
  b: "#251c2d", // deep shadow
  
  // Plaster & Mortar (Warm Bavarian Cream Fachwerk)
  c: "#786d58", // shadow plaster
  d: "#a89b80", // mid plaster
  e: "#ded6be", // lit warm plaster
  f: "#f5edd2", // bright cream plaster
  
  // Oak Timber Framing & Beams
  g: "#24130a", // deep timber shadow
  h: "#45220f", // dark oak timber
  i: "#6c3818", // mid oak timber
  j: "#944f22", // lit oak timber
  k: "#be6d34", // bright oak edge / pine plank
  
  // Granite & River Stone Masonry
  l: "#20232d", // stone deep mortar
  m: "#383c4c", // dark stone block
  n: "#585d73", // mid stone block
  o: "#7d85a0", // lit stone face
  p: "#a7b0cd", // bright stone edge / quoin
  
  // Terracotta Clay Tiles (Roofs)
  q: "#3d130e", // roof shadow
  r: "#6b1f15", // dark tile
  s: "#993020", // mid tile
  t: "#c74930", // lit tile
  u: "#ea6e4b", // bright ridge tile
  
  // Thatch & Straw (Huts & Barns)
  v: "#4e3310", // thatch shadow
  w: "#7d551b", // dark thatch
  x: "#b38228", // mid thatch
  y: "#deb043", // lit thatch
  z: "#fae075", // bright straw / hay
  
  // Deep Slate / Metal / Iron
  1: "#121721", // iron shadow
  2: "#222c3c", // iron dark
  3: "#3c4c62", // iron mid / slate tile
  4: "#5b708d", // iron lit / slate lit
  5: "#859cb8", // steel / blade / iron highlight
  
  // Windows, Hearth Fire & Molten Glow
  6: "#1a2533", // dark glass / window frame
  7: "#d9771e", // amber hearth / coal glow
  8: "#f5b838", // warm flame / golden cheese
  9: "#fff28a", // intense molten highlight / white-hot flame
  
  // Accents (Banners, Cloth, Foliage, Blooms, Flour)
  A: "#a31d24", // royal banner crimson
  B: "#d63638", // bright red awning / banner / poppy
  C: "#f26d6d", // red highlight
  D: "#1e3f66", // royal blue awning / stained glass
  E: "#467d36", // mid leaf / shutter green
  F: "#74b34b", // bright leaf green
  G: "#ffffff", // white canvas / steam / sail cloth / daisy
  H: "#d1c4b2", // sack canvas / rope
  I: "#9e866b", // sack shadow / basket
  J: "#2d6a4f"  // pine deep evergreen
})

ramps("ab", "cdef", "ghijk", "lmnop", "qrstu", "vwxyz", "12345", "6789", "ABC", "DEF", "HGI")

// -------------------------------------------------------------------------
// 1. 3D ISOMETRIC PROJECTION MATHEMATICS
// -------------------------------------------------------------------------
// Project (x, y, z) into screen space:
// x runs along grid x (SE, down-right: dx = +1, dy = +0.5)
// y runs along grid y (SW, down-left: dx = -1, dy = +0.5)
// z runs vertically UP: dx = 0, dy = -1
const ISO = (ox, oy) => (x, y, z = 0) => [ox + x - y, oy + (x + y) / 2 - z]
const C3 = (P, x, y, z) => P(x, y, z).map(Math.round)

// Factory to compute ox and oy such that the front-most footprint vertex
// sits precisely at [w / 2, h] of the canvas
function makeISO(w, h, N, M) {
  const ox = Math.floor(w / 2) - (N - M) * 16
  const oy = h - (N + M) * 8
  return ISO(ox, oy)
}

function isoPoly(c, P, pts, col) {
  c.poly(pts.flatMap(([x, y, z]) => P(x, y, z)), col)
}

function isoLine(c, P, a, b, col, w = 1) {
  const p = P(...a), q = P(...b)
  c.line(Math.round(p[0]), Math.round(p[1]), Math.round(q[0]), Math.round(q[1]), col, w)
}

function isoPx(c, P, p, col) {
  const s = P(...p)
  c.px(Math.round(s[0]), Math.round(s[1]), col)
}

// -------------------------------------------------------------------------
// 2. 3D ARCHITECTURAL PRIMITIVES
// -------------------------------------------------------------------------
// Isometric Box: top face at z+h, left face at y+d (SW), right face at x+w (SE)
function isoBox(c, P, x, y, z, w, d, h, top, left, right) {
  if (left) isoPoly(c, P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left)
  if (right) isoPoly(c, P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right)
  if (top) isoPoly(c, P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top)
}

// Stone Plinth Foundation with ashlar mortar joints and quoin highlights
function isoStonePlinth(c, P, x, y, z, w, d, h) {
  isoBox(c, P, x, y, z, w, d, h, "n", "o", "m")
  // Horizontal mortar courses
  for (let cz = z + 3; cz < z + h; cz += 3) {
    isoLine(c, P, [x, y + d, cz], [x + w, y + d, cz], "l", 1)
    isoLine(c, P, [x + w, y, cz], [x + w, y + d, cz], "l", 1)
  }
  // Vertical mortar joints
  for (let cx = x + 6; cx < x + w; cx += 8) {
    isoLine(c, P, [cx, y + d, z], [cx, y + d, z + h], "l", 1)
    isoPx(c, P, [cx + 1, y + d, z + h - 1], "p") // stone highlight
  }
  for (let cy = y + 6; cy < y + d; cy += 8) {
    isoLine(c, P, [x + w, cy, z], [x + w, cy, z + h], "l", 1)
  }
  // Corner quoin blocks
  isoLine(c, P, [x + w, y + d, z], [x + w, y + d, z + h], "p", 1)
}

// Bavarian Fachwerk Half-timbered Wall on SW face (faces viewer left)
function isoFachwerkSW(c, P, y, x0, x1, z0, z1, hasXBrace = true) {
  // Cream plaster infill
  isoPoly(c, P, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], "e")
  // Oak sill and top plate beams
  isoLine(c, P, [x0, y, z0], [x1, y, z0], "i", 1)
  isoLine(c, P, [x0, y, z1], [x1, y, z1], "i", 1)
  // Corner posts
  isoLine(c, P, [x0, y, z0], [x0, y, z1], "i", 1)
  isoLine(c, P, [x1, y, z0], [x1, y, z1], "i", 1)
  // Intermediate posts & diagonal X-braces
  const midX = (x0 + x1) / 2
  isoLine(c, P, [midX, y, z0], [midX, y, z1], "i", 1)
  if (hasXBrace) {
    isoLine(c, P, [x0, y, z0], [midX, y, z1], "i", 1)
    isoLine(c, P, [x0, y, z1], [midX, y, z0], "i", 1)
    isoLine(c, P, [midX, y, z0], [x1, y, z1], "i", 1)
    isoLine(c, P, [midX, y, z1], [x1, y, z0], "i", 1)
  }
}

// Bavarian Fachwerk Half-timbered Wall on SE face (faces viewer right, in shadow)
function isoFachwerkSE(c, P, x, y0, y1, z0, z1, hasXBrace = true) {
  isoPoly(c, P, [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], "d")
  isoLine(c, P, [x, y0, z0], [x, y1, z0], "h", 1)
  isoLine(c, P, [x, y0, z1], [x, y1, z1], "h", 1)
  isoLine(c, P, [x, y0, z0], [x, y0, z1], "h", 1)
  isoLine(c, P, [x, y1, z0], [x, y1, z1], "h", 1)
  const midY = (y0 + y1) / 2
  isoLine(c, P, [x, midY, z0], [x, midY, z1], "h", 1)
  if (hasXBrace) {
    isoLine(c, P, [x, y0, z0], [x, midY, z1], "h", 1)
    isoLine(c, P, [x, y0, z1], [x, midY, z0], "h", 1)
    isoLine(c, P, [x, midY, z0], [x, y1, z1], "h", 1)
    isoLine(c, P, [x, midY, z1], [x, y1, z0], "h", 1)
  }
}

// Steep Medieval Gable Roof with overlapping clay shingles & ridge tiles
function isoGableRoof(c, P, x0, y0, w, d, zBase, zPeak, leftSlopeCol = "t", rightSlopeCol = "r", ridgeCol = "u", gableCol = "e") {
  const midY = y0 + d / 2
  const overhang = 2
  // Left slope (SW, lit)
  isoPoly(c, P, [[x0 - overhang, midY, zPeak], [x0 + w + overhang, midY, zPeak], [x0 + w + overhang, y0 + d + overhang, zBase], [x0 - overhang, y0 + d + overhang, zBase]], leftSlopeCol)
  // Right slope (NE, shadow)
  isoPoly(c, P, [[x0 - overhang, y0 - overhang, zBase], [x0 + w + overhang, y0 - overhang, zBase], [x0 + w + overhang, midY, zPeak], [x0 - overhang, midY, zPeak]], rightSlopeCol)
  // Gable ends
  isoPoly(c, P, [[x0 + w, midY, zPeak], [x0 + w, y0 + d, zBase], [x0 + w, y0, zBase]], gableCol)
  isoLine(c, P, [x0 + w, midY, zPeak], [x0 + w, y0 + d, zBase], "i", 1)
  isoLine(c, P, [x0 + w, midY, zPeak], [x0 + w, y0, zBase], "h", 1)
  
  // Shingle tile horizontal courses across lit slope
  for (let z = zBase + 2; z < zPeak; z += 3) {
    const frac = (z - zBase) / (zPeak - zBase)
    const yL = midY + (y0 + d + overhang - midY) * (1 - frac)
    isoLine(c, P, [x0 - overhang, yL, z], [x0 + w + overhang, yL, z], "s", 1)
    // Little scalloped tile teeth
    for (let x = x0; x < x0 + w; x += 4) {
      isoPx(c, P, [x, yL, z + 1], "u")
    }
  }
  // Ridge cap tiles
  isoLine(c, P, [x0 - overhang, midY, zPeak], [x0 + w + overhang, midY, zPeak], ridgeCol, 1)
}

// Conical Slate Tower Roof
function isoConicalRoof(c, P, cx, cy, r, zBase, zPeak, leftCol = "4", rightCol = "3", finialCol = "u") {
  const steps = 12
  for (let i = 0; i < steps; i++) {
    const a1 = (i / steps) * Math.PI * 2
    const a2 = ((i + 1) / steps) * Math.PI * 2
    const p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, zBase]
    const p2 = [cx + Math.cos(a2) * r, cy + Math.sin(a2) * r, zBase]
    const col = (i >= 3 && i <= 8) ? leftCol : rightCol
    isoPoly(c, P, [[cx, cy, zPeak], p1, p2], col)
  }
  isoLine(c, P, [cx, cy, zBase], [cx, cy, zPeak], "5", 1)
  isoPx(c, P, [cx, cy, zPeak + 1], finialCol) // golden finial
}

// Arched Wooden Door with iron strap hinges
function isoDoorSW(c, P, y, x, z, w, h) {
  isoPoly(c, P, [[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]], "g")
  isoLine(c, P, [x + 1, y, z], [x + 1, y, z + h], "h", 1)
  isoLine(c, P, [x + w - 2, y, z], [x + w - 2, y, z + h], "h", 1)
  // Iron strap hinges
  isoLine(c, P, [x, y, z + 2], [x + w - 2, y, z + 2], "2", 1)
  isoLine(c, P, [x, y, z + h - 3], [x + w - 2, y, z + h - 3], "2", 1)
  isoPx(c, P, [x + w - 2, y, z + Math.floor(h / 2)], "5") // door handle
  // Arched stone lintel
  isoLine(c, P, [x - 1, y, z + h], [x + w + 1, y, z + h], "j", 1)
}

// Leaded Glass Window with Shutters, Warm Candle Glow & Flower Box
function isoWindowSE(c, P, x, y, z, w, h, hasFlowers = true) {
  // Dark window frame
  isoPoly(c, P, [[x, y, z], [x, y + w, z], [x, y + w, z + h], [x, y, z + h]], "6")
  // Golden candlelit glow inside
  isoPoly(c, P, [[x, y + 1, z + 1], [x, y + w - 1, z + 1], [x, y + w - 1, z + h - 1], [x, y + 1, z + h - 1]], "8")
  isoPx(c, P, [x, y + Math.floor(w / 2), z + Math.floor(h / 2)], "9")
  // Cross mullions
  isoLine(c, P, [x, y, z + Math.floor(h / 2)], [x, y + w, z + Math.floor(h / 2)], "6", 1)
  isoLine(c, P, [x, y + Math.floor(w / 2), z], [x, y + Math.floor(w / 2), z + h], "6", 1)
  // Forest-green wooden shutters
  isoPoly(c, P, [[x, y - 2, z], [x, y, z], [x, y, z + h], [x, y - 2, z + h]], "E")
  isoPoly(c, P, [[x, y + w, z], [x, y + w + 2, z], [x, y + w + 2, z + h], [x, y + w, z + h]], "E")
  // Window Flower Box with blooming red and white flowers
  if (hasFlowers) {
    isoLine(c, P, [x, y - 1, z], [x, y + w + 1, z], "h", 1)
    isoPx(c, P, [x, y + 1, z], "B") // poppy red
    isoPx(c, P, [x, y + Math.floor(w / 2), z + 1], "G") // daisy white
    isoPx(c, P, [x, y + w - 1, z], "B")
  }
}

// Stone / Brick Chimney with billowing smoke
function isoChimney(c, P, x, y, z, w, d, h, smoke = true) {
  isoBox(c, P, x, y, z, w, d, h, "p", "o", "m")
  isoLine(c, P, [x, y + d, z + h], [x + w, y + d, z + h], "p", 1)
  // Chimney pot
  isoBox(c, P, x + 1, y + 1, z + h, w - 2, d - 2, 2, "l", "m", "l")
  if (smoke) {
    isoPx(c, P, [x + w / 2, y + d / 2, z + h + 3], "G")
    isoPx(c, P, [x + w / 2 - 1, y + d / 2, z + h + 5], "G")
    isoPx(c, P, [x + w / 2 - 2, y + d / 2 + 1, z + h + 7], "4")
  }
}

// -------------------------------------------------------------------------
// 3. 3D PROPS & DECORATIONS
// -------------------------------------------------------------------------
function isoBarrel(c, P, x, y, z) {
  isoBox(c, P, x, y, z, 5, 5, 6, "i", "j", "h")
  isoLine(c, P, [x, y + 5, z + 2], [x + 5, y + 5, z + 2], "2", 1) // iron hoop
  isoLine(c, P, [x, y + 5, z + 5], [x + 5, y + 5, z + 5], "2", 1)
  isoPx(c, P, [x + 2, y + 2, z + 6], "1") // water inside
}

function isoLogPile(c, P, x, y, z, w, h) {
  isoBox(c, P, x, y, z, w, 6, h, "j", "j", "h")
  // Round end-grain cuts
  for (let lz = z + 2; lz < z + h; lz += 3) {
    for (let lx = x + 2; lx < x + w; lx += 3) {
      isoPx(c, P, [lx, y + 6, lz], "k")
    }
  }
}

function isoCrate(c, P, x, y, z, s) {
  isoBox(c, P, x, y, z, s, s, s, "j", "j", "h")
  isoLine(c, P, [x, y + s, z], [x + s, y + s, z + s], "k", 1) // diagonal batten
  isoLine(c, P, [x + s, y, z], [x + s, y + s, z + s], "i", 1)
}

function isoSacks(c, P, x, y, z) {
  isoBox(c, P, x, y, z, 5, 4, 5, "H", "H", "I")
  isoPx(c, P, [x + 2, y + 2, z + 5], "G") // tied top
}

function isoAnvil(c, P, x, y, z) {
  // Tree stump
  isoBox(c, P, x, y, z, 6, 6, 5, "k", "j", "h")
  // Steel anvil
  isoBox(c, P, x + 1, y + 1, z + 5, 4, 4, 3, "5", "4", "2")
  isoPx(c, P, [x, y + 3, z + 7], "5") // anvil horn point!
}

// -------------------------------------------------------------------------
// 4. UNDER-CONSTRUCTION 3D SCAFFOLDING
// -------------------------------------------------------------------------
function drawScaffold3D(c, P, W, D, H) {
  // Stone footprint outline on ground
  isoLine(c, P, [0, 0, 0], [W, 0, 0], "m", 1)
  isoLine(c, P, [W, 0, 0], [W, D, 0], "m", 1)
  isoLine(c, P, [W, D, 0], [0, D, 0], "l", 1)
  isoLine(c, P, [0, D, 0], [0, 0, 0], "l", 1)
  // Partial stone base rising
  isoBox(c, P, 1, 1, 0, W - 2, D - 2, 4, "n", "o", "m")
  
  // Upright scaffolding timber poles
  const poles = [
    [0, 0], [W, 0], [W, D], [0, D],
    [Math.floor(W / 2), 0], [Math.floor(W / 2), D],
    [0, Math.floor(D / 2)], [W, Math.floor(D / 2)]
  ]
  for (const [px, py] of poles) {
    isoLine(c, P, [px, py, 0], [px, py, H + 4], "h", 1)
    isoPx(c, P, [px, py, H + 4], "k")
  }
  
  // Horizontal scaffolding ledger poles & plank working platforms
  const platformLevels = [8, 18, 28]
  for (const pz of platformLevels) {
    if (pz < H) {
      isoLine(c, P, [0, D, pz], [W, D, pz], "j", 1)
      isoLine(c, P, [W, 0, pz], [W, D, pz], "i", 1)
      isoLine(c, P, [0, 0, pz], [W, 0, pz], "h", 1)
      // Planks laid on platform
      isoBox(c, P, Math.floor(W * 0.3), D - 4, pz, Math.floor(W * 0.4), 4, 1, "k", "j", "i")
    }
  }
  // Diagonal cross braces between poles
  isoLine(c, P, [0, D, 0], [W, D, 14], "i", 1)
  isoLine(c, P, [0, D, 14], [W, D, 0], "i", 1)
  
  // Wooden ladder leaning on scaffold
  const ladX = Math.floor(W * 0.4)
  isoLine(c, P, [ladX, D + 3, 0], [ladX, D, 16], "h", 1)
  isoLine(c, P, [ladX + 3, D + 3, 0], [ladX + 3, D, 16], "h", 1)
  for (let rz = 2; rz < 16; rz += 3) {
    const t = rz / 16
    isoLine(c, P, [ladX, D + 3 * (1 - t), rz], [ladX + 3, D + 3 * (1 - t), rz], "k", 1)
  }
  
  // Hoist pulley boom with rope & crate
  isoLine(c, P, [W, D, H], [W + 4, D + 4, H + 3], "j", 2)
  isoLine(c, P, [W + 4, D + 4, H + 3], [W + 4, D + 4, 8], "H", 1)
  isoCrate(c, P, W + 2, D + 2, 4, 4)
}
