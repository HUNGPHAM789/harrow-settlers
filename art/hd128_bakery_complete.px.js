// 128px Scale Modern HD Complete Medieval Bakery (b_hd128_bakery_complete)
// Handcrafted using Authentic The Settlers II Color Harmony & PXL DSL
// 100% Solid Enclosed Architecture (No missing walls, no open voids)
// Features: Solid oak plank door with iron strap hinges, leaded diamond windows,
// attic dormer, flour hoist crane, gilded pretzel guild sign, riverstone foundation,
// outdoor dome oven with glowing embers, stacked firewood, rainwater barrel, and bread baskets.

pal({
  a: "#140e1b", // deep ink contour / dark crevice
  b: "#1f1628", // deep ambient occlusion shadow
  
  // Bavarian Warm Cream Plaster (The Beloved Authentic Settlers II Walls)
  c: "#5e5241", // deep plaster crease
  d: "#877960", // shadow plaster (South-West facade)
  e: "#b5a788", // mid warm plaster
  f: "#ded3b8", // lit warm plaster
  g: "#f5edd2", // bright sunlit cream plaster (South-East facade)
  
  // Honey Oak Carved Timber Framing & Beams
  h: "#1c0d06", // deepest timber crease
  i: "#381c0c", // dark timber shadow
  j: "#5a2d13", // mid oak timber
  k: "#85451e", // warm honey oak timber
  l: "#b5662f", // bright sunlit oak edge
  m: "#df8e4d", // crisp wood highlight
  
  // River Stone & Chiseled Granite Masonry
  n: "#191c24", // deep mortar seam
  o: "#2d323f", // dark stone block
  p: "#484f63", // mid stone block
  q: "#6b748f", // lit stone face
  r: "#939ebf", // bright stone edge / quoin
  s: "#c2cce4", // crisp specular stone highlight
  
  // Radiant Terracotta Clay Spanish Roof Tiles (Vibrant Settlers Red-Orange)
  t: "#330e09", // under-eave roof shadow
  u: "#5c1910", // deep tile shadow
  v: "#8c2819", // dark terracotta
  w: "#bf3c24", // mid terracotta tile
  x: "#ea5e38", // bright sunlit terracotta tile
  y: "#ff825c", // radiant tile rim & ridge cap highlight
  
  // Hearth Fire, Coals & Leaded Glass Windows
  1: "#7a1a0d", // deep ember
  2: "#bd3a11", // glowing coal
  3: "#f57818", // bright orange hearth fire
  4: "#f5b838", // warm candlelit window / gilded pretzel sign
  5: "#fff28a", // intense white-hot flame / specular gold glint
  
  // Puffy Chimney Smoke
  6: "#384050", // soot rim
  7: "#5a667d", // mid smoke
  8: "#8798b5", // lit smoke
  9: "#c8d6eb", // wispy white smoke highlight
  
  // Living Props, Foliage & Bread
  A: "#3b2510", // wicker basket dark
  B: "#6e4822", // wicker basket mid
  C: "#a67135", // golden bread crust
  D: "#e0a553", // bright scored baguette
  E: "#fae5b5", // flour dusting on bread
  F: "#d4cbba", // flour sack canvas
  G: "#8f8473", // sack shadow & rope
  H: "#244d18", // deep ivy & moss
  I: "#498f32", // bright geranium leaf
  J: "#d62929", // scarlet geranium flower
  K: "#ff5e5e", // bright flower petal
  L: "#707b8f"  // lead / zinc roof flashing & downspout
})

ramps("ab", "cdefg", "hijklm", "nopqrs", "tuvwxy", "12345", "6789", "ABCDE", "FG", "HI", "JK")

// Isometric Projection Engine (2:1 dimetric)
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

function isoLine(c, P, a, b, col, w = 1) {
  const p = C3(P, a[0], a[1], a[2]), q = C3(P, b[0], b[1], b[2])
  c.line(p[0], p[1], q[0], q[1], col, w)
}

function isoPx(c, P, pt, col) {
  const p = C3(P, pt[0], pt[1], pt[2])
  c.px(p[0], p[1], col)
}

// 100% Solid Enclosed 3D Isometric Solid Box
// frontLeft:  faces South-West (at y + d)
// frontRight: faces South-East (at x + w)
// top:        faces Up (at z + h)
function isoBox(c, P, x, y, z, w, d, h, frontLeft, frontRight, top) {
  if (frontLeft) {
    isoPoly(c, P, [
      [x, y + d, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x, y + d, z + h]
    ], frontLeft)
  }
  if (frontRight) {
    isoPoly(c, P, [
      [x + w, y + d, z],
      [x + w, y, z],
      [x + w, y, z + h],
      [x + w, y + d, z + h]
    ], frontRight)
  }
  if (top) {
    isoPoly(c, P, [
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x, y + d, z + h]
    ], top)
  }
}

sprite("b_hd128_bakery_complete", { w: 380, h: 420, outline: "a" }, (c) => {
  const P = ISO(190, 200)
  const W = 114, D = 114
  
  // =========================================================================
  // 1. GROUND AMBIENT OCCLUSION & SUNLIT COBBLESTONE TERRACE (z: 0)
  // =========================================================================
  const gp = C3(P, W / 2, D / 2, 0)
  c.ellipse(gp[0] + 6, gp[1] + 6, 130, 58, "b")
  c.ellipse(gp[0] + 4, gp[1] + 4, 118, 52, "a")
  
  // Raised Cobblestone Entrance Porch / Terrace (x: 40 -> 84, y: D -> D + 22, z: 0 -> 6)
  isoBox(c, P, 38, D - 4, 0, 48, 22, 6, "o", "p", "q")
  // Cobblestone paving texture on terrace
  for (let px = 40; px < 82; px += 8) {
    for (let py = D; py < D + 18; py += 6) {
      isoPx(c, P, [px, py, 6], "r")
      isoPx(c, P, [px + 1, py, 6], "s")
      isoLine(c, P, [px, py + 5, 6], [px + 6, py + 5, 6], "n", 1)
    }
  }
  // Chiseled Stone Porch Steps (2 stepped risers)
  isoBox(c, P, 48, D + 16, 0, 28, 8, 3, "n", "o", "p")
  isoLine(c, P, [48, D + 24, 3], [76, D + 24, 3], "r", 1)
  
  // Warm amber light spill from bakery entrance onto porch stones
  const lp = C3(P, 62, D + 6, 6)
  c.ellipse(lp[0], lp[1], 32, 14, "2")
  c.ellipse(lp[0], lp[1], 20, 8, "3")
  
  // =========================================================================
  // 2. HEAVY RIVER STONE FOUNDATION PLINTH (z: 0 -> 26 px)
  // Completely enclosed on both South-West AND South-East visible sides!
  // =========================================================================
  isoBox(c, P, 4, 4, 0, W - 8, D - 8, 26, "o", "q", "p")
  
  // Chiseled Ashlar Masonry Courses & Corner Quoins (South-West Facade)
  for (let z = 2; z < 24; z += 7) {
    isoLine(c, P, [4, D - 4, z], [W - 4, D - 4, z], "n", 1)
    for (let x = 6; x < W - 6; x += 14) {
      isoLine(c, P, [x, D - 4, z], [x, D - 4, z + 6], "n", 1)
      isoLine(c, P, [x + 1, D - 4, z + 6], [x + 12, D - 4, z + 6], "r", 1) // top stone edge
      isoPx(c, P, [x + 2, D - 4, z + 6], "s")                               // specular corner
    }
  }
  
  // Chiseled Ashlar Masonry (South-East Sunlit Facade at x = W - 4)
  for (let z = 2; z < 24; z += 7) {
    isoLine(c, P, [W - 4, 4, z], [W - 4, D - 4, z], "n", 1)
    for (let y = 6; y < D - 6; y += 14) {
      isoLine(c, P, [W - 4, y, z], [W - 4, y, z + 6], "o", 1)
      isoLine(c, P, [W - 4, y, z + 6], [W - 4, y + 12, z + 6], "s", 1) // bright sunlit stone edge
    }
  }
  
  // Prominent Corner Quoins (Interlocking large corner blocks)
  for (let z = 2; z < 24; z += 12) {
    isoBox(c, P, W - 6, D - 6, z, 4, 4, 6, "p", "r", "s")
    isoBox(c, P, 2, D - 6, z + 6, 4, 4, 6, "o", "p", "q")
  }
  
  // Lush Green Moss & Lichen creeping up damp base stones
  for (let mx = 6; mx < 36; mx += 5) {
    isoPx(c, P, [mx, D - 4, 2], "H")
    isoPx(c, P, [mx + 1, D - 4, 3], "I")
    isoPx(c, P, [mx + 2, D - 4, 2], "H")
  }
  
  // =========================================================================
  // 3. GROUND FLOOR WALLS & BAVARIAN TIMBER FRAMING (z: 26 -> 82 px)
  // South-West Facade: Diffuse Warm Cream Plaster ('e'/'d')
  // South-East Facade: Sunlit Bright Bavarian Cream Plaster ('g'/'f')
  // =========================================================================
  isoBox(c, P, 6, 6, 26, W - 12, D - 12, 56, "e", "g", null)
  
  // Heavy Honey Oak Sill Beam & Wall Plates (Surrounding entire building)
  isoLine(c, P, [6, D - 6, 26], [W - 6, D - 6, 26], "i", 3)
  isoLine(c, P, [6, D - 6, 28], [W - 6, D - 6, 28], "l", 1)
  isoLine(c, P, [W - 6, 6, 26], [W - 6, D - 6, 26], "k", 3)
  isoLine(c, P, [W - 6, 6, 28], [W - 6, D - 6, 28], "m", 1)
  
  // Top Wall Plate Beam (under jetty overhang)
  isoLine(c, P, [6, D - 6, 80], [W - 6, D - 6, 80], "i", 3)
  isoLine(c, P, [W - 6, 6, 80], [W - 6, D - 6, 80], "k", 3)
  
  // Vertical Honey Oak Timber Posts (South-West Facade, every 18 units)
  for (let vx = 6; vx <= W - 6; vx += 18) {
    isoLine(c, P, [vx, D - 6, 26], [vx, D - 6, 80], "j", 3)
    isoLine(c, P, [vx + 1, D - 6, 26], [vx + 1, D - 6, 80], "l", 1)
  }
  // St. Andrew's Cross Timber Bracing (Fachwerk diagonals)
  isoLine(c, P, [24, D - 6, 28], [42, D - 6, 78], "j", 2)
  isoLine(c, P, [24, D - 6, 78], [42, D - 6, 28], "i", 2)
  isoLine(c, P, [78, D - 6, 28], [96, D - 6, 78], "j", 2)
  isoLine(c, P, [78, D - 6, 78], [96, D - 6, 28], "i", 2)
  
  // Vertical Timber Posts (South-East Sunlit Facade, at x = W - 6)
  for (let vy = 6; vy <= D - 6; vy += 20) {
    isoLine(c, P, [W - 6, vy, 26], [W - 6, vy, 80], "k", 3)
    isoLine(c, P, [W - 6, vy, 27], [W - 6, vy, 80], "m", 1) // sunlit timber highlight
  }
  isoLine(c, P, [W - 6, 26, 28], [W - 6, 46, 78], "k", 2)
  isoLine(c, P, [W - 6, 26, 78], [W - 6, 46, 28], "j", 2)
  isoLine(c, P, [W - 6, 66, 28], [W - 6, 86, 78], "k", 2)
  isoLine(c, P, [W - 6, 66, 78], [W - 6, 86, 28], "j", 2)
  
  // =========================================================================
  // 4. THE PROPORTIONATE DOORWAY & SOLID OAK PLANK DOOR (x: 48 -> 72, z: 26 -> 76)
  // Height = 50 units (142px clearance, perfectly scaled for 128px Settler!)
  // Solid oak vertical planks, heavy black forged-iron strap hinges & iron ring handle!
  // =========================================================================
  // Recessed Door Reveal & Stone Threshold
  isoBox(c, P, 48, D - 6, 26, 24, 0, 50, null, "a", null)
  
  // Solid Oak Plank Door (vertical planks in rich honey oak)
  isoBox(c, P, 50, D - 4, 26, 20, 0, 48, null, "j", null)
  for (let px = 50; px <= 70; px += 4) {
    isoLine(c, P, [px, D - 4, 26], [px, D - 4, 74], "h", 1) // plank seams
    isoLine(c, P, [px + 1, D - 4, 26], [px + 1, D - 4, 74], "k", 1) // lit plank edge
  }
  // Heavy Forged-Iron Strap Hinges (Top & Bottom)
  isoLine(c, P, [49, D - 4, 66], [64, D - 4, 66], "a", 2) // top hinge
  isoPx(c, P, [51, D - 4, 66], "q")                        // iron rivet
  isoPx(c, P, [62, D - 4, 66], "q")
  isoLine(c, P, [49, D - 4, 34], [64, D - 4, 34], "a", 2) // bottom hinge
  isoPx(c, P, [51, D - 4, 34], "q")
  isoPx(c, P, [62, D - 4, 34], "q")
  
  // Forged Iron Pull Ring & Keyhole Escutcheon
  isoPx(c, P, [65, D - 4, 50], "a")
  isoPx(c, P, [65, D - 4, 49], "q")
  isoPx(c, P, [66, D - 4, 49], "a")
  
  // Massive Carved Oak Doorframe & Cambered Arch Lintel
  isoLine(c, P, [48, D - 6, 26], [48, D - 6, 77], "h", 3)
  isoLine(c, P, [72, D - 6, 26], [72, D - 6, 77], "k", 3)
  isoLine(c, P, [46, D - 6, 76], [74, D - 6, 76], "l", 3)
  isoLine(c, P, [46, D - 6, 78], [74, D - 6, 78], "m", 1)
  
  // Warm Amber Glow peeking through decorative door transom fanlight
  isoBox(c, P, 53, D - 5, 68, 14, 0, 5, null, "4", null)
  isoPx(c, P, [59, D - 5, 70], "5")
  
  // =========================================================================
  // 5. LEADED DIAMOND WINDOWS & GERANIUM FLOWERBOXES
  // Recessed timber frames, lattice lead came, candlelit interior glow & glass sheen
  // =========================================================================
  // Ground Floor Front Window (South-West Facade, x: 80 -> 98, z: 42 -> 64)
  isoBox(c, P, 80, D - 6, 42, 18, 0, 22, null, "4", null) // warm yellow candlelit interior
  isoBox(c, P, 83, D - 6, 45, 12, 0, 16, null, "5", null) // brighter inner flame glow
  // Leaded Diamond Glass Mullions & Crossbars
  isoLine(c, P, [89, D - 6, 42], [89, D - 6, 64], "h", 1)
  isoLine(c, P, [80, D - 6, 53], [98, D - 6, 53], "h", 1)
  // Diagonal Specular Glass Reflection Sheen
  isoLine(c, P, [82, D - 6, 44], [94, D - 6, 62], "s", 1)
  
  // Wooden Window Shutters (Pinned open against wall)
  isoBox(c, P, 75, D - 5, 42, 5, 0, 22, null, "j", null)
  isoLine(c, P, [75, D - 5, 42], [75, D - 5, 64], "k", 1)
  isoBox(c, P, 98, D - 5, 42, 5, 0, 22, null, "j", null)
  isoLine(c, P, [103, D - 5, 42], [103, D - 5, 64], "l", 1)
  
  // Wooden Flowerbox with Blooming Red Geraniums & Trailing Ivy
  isoBox(c, P, 78, D - 3, 38, 22, 4, 6, "i", "k", "l")
  for (let fx = 80; fx < 98; fx += 3) {
    isoPx(c, P, [fx, D - 2, 44], "H")
    isoPx(c, P, [fx + 1, D - 2, 45], "I")
    isoPx(c, P, [fx + 1, D - 2, 46], "J") // scarlet flower
    isoPx(c, P, [fx + 2, D - 2, 46], "K") // bright petal
  }
  
  // Sunlit Side Window (South-East Facade at x = W - 6, y: 44 -> 64, z: 42 -> 64)
  isoBox(c, P, W - 6, 44, 42, 0, 20, 22, "4", null, null)
  isoLine(c, P, [W - 6, 54, 42], [W - 6, 54, 64], "i", 1)
  isoLine(c, P, [W - 6, 44, 53], [W - 6, 64, 53], "i", 1)
  isoLine(c, P, [W - 6, 46, 44], [W - 6, 60, 62], "s", 1)
  // Side Window Flowerbox
  isoBox(c, P, W - 4, 42, 38, 4, 24, 6, "j", "k", "l")
  for (let fy = 44; fy < 64; fy += 4) {
    isoPx(c, P, [W - 3, fy, 45], "I")
    isoPx(c, P, [W - 3, fy + 1, 46], "J")
  }
  
  // =========================================================================
  // 6. GILDED BAKER'S GUILD PRETZEL SIGN (The Iconic Bavarian Emblem!)
  // Mounted on front corner post at x = W - 4, y = D - 4, z = 72
  // Hand-forged wrought-iron scroll bracket hanging a golden pretzel!
  // =========================================================================
  // Wrought-iron scroll bracket extending out
  isoLine(c, P, [W - 6, D - 4, 74], [W + 8, D + 6, 74], "a", 2)
  isoLine(c, P, [W - 6, D - 4, 68], [W + 6, D + 5, 74], "a", 1) // diagonal support strut
  isoPx(c, P, [W + 8, D + 6, 75], "q")                          // decorative curled finial
  
  // Gilded Pretzel Hanging on Iron Chains
  isoLine(c, P, [W + 5, D + 5, 74], [W + 5, D + 5, 70], "a", 1) // chain
  isoLine(c, P, [W + 7, D + 6, 74], [W + 7, D + 6, 70], "a", 1)
  // The Golden Pretzel (Triple knot loop in radiant golden ochre & specular shine!)
  const pz = C3(P, W + 6, D + 5, 66)
  c.ellipse(pz[0], pz[1], 8, 6, "4")
  c.ellipse(pz[0], pz[1], 6, 4, "5")
  c.ellipse(pz[0] - 2, pz[1], 2, 2, "a") // left inner loop
  c.ellipse(pz[0] + 2, pz[1], 2, 2, "a") // right inner loop
  c.px(pz[0] - 1, pz[1] - 2, "5")        // specular glint
  
  // =========================================================================
  // 7. OVERHANGING SECOND STOREY / ATTIC (JETTYING) (z: 82 -> 130 px)
  // Bavarian cantilevered upper floor projecting 4 units past lower wall!
  // Supported by carved oak corbel brackets
  // =========================================================================
  // Jetty overhang underside shadow & fascia beam
  isoBox(c, P, 4, 4, 82, W - 8, D - 8, 48, "f", "g", null)
  
  // Carved Oak Jetty Corbels (Every 16 units under overhang)
  for (let jx = 6; jx < W - 6; jx += 16) {
    isoPoly(c, P, [
      [jx, D - 6, 78],
      [jx + 4, D - 6, 78],
      [jx + 4, D - 3, 82],
      [jx, D - 3, 82]
    ], "k")
  }
  // South-East corbels
  for (let jy = 6; jy < D - 6; jy += 16) {
    isoPoly(c, P, [
      [W - 6, jy, 78],
      [W - 6, jy + 4, 78],
      [W - 3, jy + 4, 82],
      [W - 3, jy, 82]
    ], "l")
  }
  
  // Upper Storey Bavarian Timber Framing
  isoLine(c, P, [4, D - 4, 82], [W - 4, D - 4, 82], "i", 3)
  isoLine(c, P, [4, D - 4, 84], [W - 4, D - 4, 84], "l", 1)
  isoLine(c, P, [W - 4, 4, 82], [W - 4, D - 4, 82], "k", 3)
  isoLine(c, P, [W - 4, 4, 84], [W - 4, D - 4, 84], "m", 1)
  
  // Vertical Studs & K-Bracing on Upper Storey
  for (let ux = 4; ux <= W - 4; ux += 20) {
    isoLine(c, P, [ux, D - 4, 82], [ux, D - 4, 128], "j", 3)
    isoLine(c, P, [ux + 1, D - 4, 82], [ux + 1, D - 4, 128], "l", 1)
  }
  for (let uy = 4; uy <= D - 4; uy += 20) {
    isoLine(c, P, [W - 4, uy, 82], [W - 4, uy, 128], "k", 3)
    isoLine(c, P, [W - 4, uy, 83], [W - 4, uy, 128], "m", 1)
  }
  
  // Upper Storey Leaded Casement Windows (Pair of cozy bedroom/loft windows)
  isoBox(c, P, 32, D - 4, 96, 16, 0, 18, null, "4", null)
  isoLine(c, P, [40, D - 4, 96], [40, D - 4, 114], "h", 1)
  isoLine(c, P, [32, D - 4, 105], [48, D - 4, 105], "h", 1)
  isoLine(c, P, [34, D - 4, 98], [46, D - 4, 112], "s", 1)
  
  isoBox(c, P, 68, D - 4, 96, 16, 0, 18, null, "4", null)
  isoLine(c, P, [76, D - 4, 96], [76, D - 4, 114], "h", 1)
  isoLine(c, P, [68, D - 4, 105], [84, D - 4, 105], "h", 1)
  isoLine(c, P, [70, D - 4, 98], [82, D - 4, 112], "s", 1)
  
  // =========================================================================
  // 8. 100% SOLID RADIANT TERRACOTTA GABLE ROOF (z: 124 -> 188 px)
  // Double-pitched with deep overhanging eaves, solid gable Fachwerk triangles,
  // carved bargeboard trims, and terracotta scalloped tiles.
  // =========================================================================
  const zEave = 124, zRidge = 188
  const yRidge = D / 2 // ridge runs along X-axis at center
  
  // FRONT-RIGHT GABLE FACHWERK TRIANGLE (Solid Wall at x = W, completely closes the building!)
  isoPoly(c, P, [
    [W + 2, -2, zEave],
    [W + 2, D + 6, zEave],
    [W + 2, yRidge, zRidge]
  ], "f") // bright sunlit cream plaster!
  // Carved Bargeboards & Gable Timber Framing
  isoLine(c, P, [W + 2, D + 6, zEave], [W + 2, yRidge, zRidge], "l", 4)
  isoLine(c, P, [W + 2, D + 6, zEave], [W + 2, yRidge, zRidge], "m", 1)
  isoLine(c, P, [W + 2, -2, zEave], [W + 2, yRidge, zRidge], "k", 4)
  // King Post & Diagonal Struts in Gable
  isoLine(c, P, [W + 2, yRidge, zEave], [W + 2, yRidge, zRidge - 6], "k", 3)
  isoLine(c, P, [W + 2, 16, zEave], [W + 2, yRidge, zRidge - 18], "k", 2)
  isoLine(c, P, [W + 2, D - 10, zEave], [W + 2, yRidge, zRidge - 18], "l", 2)
  
  // ATTIC GRAIN HOIST CRANE BEAM (Oak Pulley Beam projecting from Gable Peak)
  isoLine(c, P, [W - 8, yRidge, zRidge - 2], [W + 18, yRidge, zRidge - 2], "k", 4)
  isoLine(c, P, [W - 8, yRidge, zRidge], [W + 18, yRidge, zRidge], "m", 1)
  // Iron Pulley Wheel & Hanging Rope with Flour Sack!
  isoPx(c, P, [W + 16, yRidge, zRidge - 4], "a")
  isoLine(c, P, [W + 16, yRidge, zRidge - 4], [W + 16, yRidge, zRidge - 24], "G", 1) // rope
  // Flour Sack being hoisted
  const skp = C3(P, W + 16, yRidge, zRidge - 30)
  c.ellipse(skp[0], skp[1], 6, 8, "F")
  c.ellipse(skp[0] + 1, skp[1] - 1, 4, 6, "f")
  c.line(skp[0] - 4, skp[1] - 2, skp[0] + 4, skp[1] - 2, "G", 1)
  
  // SOUTH ROOF SLOPE (South-West Facing Slope, receives rich raking sunlight!)
  // Scalloped Spanish Terracotta Clay Tiles (Vibrant Settlers II Harmony)
  isoPoly(c, P, [
    [-2, D + 8, zEave],
    [W + 6, D + 8, zEave],
    [W + 6, yRidge, zRidge],
    [-2, yRidge, zRidge]
  ], "w")
  
  // NORTH ROOF SLOPE (Facing Away, in deep shadow)
  isoPoly(c, P, [
    [-2, -6, zEave],
    [W + 6, -6, zEave],
    [W + 6, yRidge, zRidge],
    [-2, yRidge, zRidge]
  ], "v")
  
  // RIDGE CAP TILES (Interlocking curved ridge tiles along peak)
  isoLine(c, P, [-2, yRidge, zRidge], [W + 6, yRidge, zRidge], "y", 4)
  isoLine(c, P, [-2, yRidge, zRidge + 1], [W + 6, yRidge, zRidge + 1], "x", 1)
  
  // Sculptural Clay Tile Rows with Shadow Mortar Lines & Radiant Highlights
  for (let rz = zEave + 5; rz < zRidge; rz += 7) {
    const tRatio = (rz - zEave) / (zRidge - zEave)
    const ry = (D + 8) - tRatio * ((D + 8) - yRidge)
    isoLine(c, P, [-1, ry, rz], [W + 5, ry, rz], "u", 2)
    for (let rx = 2; rx < W + 4; rx += 8) {
      isoLine(c, P, [rx, ry, rz], [rx, ry - 5, rz + 5], "v", 1)
      isoPx(c, P, [rx + 1, ry, rz], "y") // radiant tile rim highlight!
      isoPx(c, P, [rx + 2, ry, rz], "x")
    }
  }
  
  // Deep Overhang Ambient Eave Shadow onto Upper Storey
  isoLine(c, P, [0, D + 9, zEave - 2], [W + 4, D + 9, zEave - 2], "t", 4)
  
  // =========================================================================
  // 9. CHARMING ATTIC GABLED DORMER WINDOW (Roof Protrusion)
  // Sits on South Roof Slope at x: 26 -> 46, adding rich architectural depth!
  // =========================================================================
  const dX = 26, dW = 20, dZ = zEave + 22
  // Dormer Side Cheeks (Fachwerk timber & plaster)
  isoPoly(c, P, [
    [dX, D - 4, dZ],
    [dX, D - 18, dZ + 14],
    [dX, D - 18, dZ + 28],
    [dX, D - 4, dZ + 20]
  ], "e")
  isoPoly(c, P, [
    [dX + dW, D - 4, dZ],
    [dX + dW, D - 18, dZ + 14],
    [dX + dW, D - 18, dZ + 28],
    [dX + dW, D - 4, dZ + 20]
  ], "g")
  // Dormer Front Face & Leaded Window
  isoBox(c, P, dX, D - 4, dZ, dW, 0, 22, null, "f", null)
  isoBox(c, P, dX + 3, D - 3, dZ + 4, 14, 0, 14, null, "4", null)
  isoLine(c, P, [dX + 10, D - 3, dZ + 4], [dX + 10, D - 3, dZ + 18], "h", 1)
  isoLine(c, P, [dX + 3, D - 3, dZ + 11], [dX + 17, D - 3, dZ + 11], "h", 1)
  isoLine(c, P, [dX + 5, D - 3, dZ + 6], [dX + 15, D - 3, dZ + 16], "s", 1)
  // Dormer Miniature Pitched Clay Tile Roof
  isoPoly(c, P, [
    [dX - 2, D - 2, dZ + 22],
    [dX + 10, D - 2, dZ + 32],
    [dX + 10, D - 20, dZ + 32],
    [dX - 2, D - 20, dZ + 22]
  ], "w")
  isoPoly(c, P, [
    [dX + 22, D - 2, dZ + 22],
    [dX + 10, D - 2, dZ + 32],
    [dX + 10, D - 20, dZ + 32],
    [dX + 22, D - 20, dZ + 22]
  ], "x")
  isoLine(c, P, [dX + 10, D - 2, dZ + 32], [dX + 10, D - 20, dZ + 32], "y", 2)
  
  // =========================================================================
  // 10. RIVER STONE CHIMNEY & MULTI-TIER BILLOWING SMOKE
  // Ashlar stone chimney with lead step flashing, brick pot & animated-style puffy smoke
  // =========================================================================
  const chX = 72, chY = D / 2 - 12, chZ = zRidge - 10
  // Chimney Stone Shaft (Penetrates through roof)
  isoBox(c, P, chX, chY, chZ, 16, 16, 44, "o", "q", "p")
  // Lead Step Flashing at roof intersection (Weather sealing)
  isoLine(c, P, [chX - 2, chY + 18, chZ + 2], [chX + 18, chY + 18, chZ + 2], "L", 2)
  isoLine(c, P, [chX + 18, chY - 2, chZ + 2], [chX + 18, chY + 18, chZ + 2], "L", 2)
  
  // Stone Chimney Crown & Brick Chimney Pot
  isoBox(c, P, chX - 2, chY - 2, chZ + 40, 20, 20, 4, "p", "r", "s")
  isoBox(c, P, chX + 4, chY + 4, chZ + 44, 8, 8, 10, "u", "w", "a")
  // Soot rim
  isoLine(c, P, [chX + 2, chY + 14, chZ + 54], [chX + 14, chY + 14, chZ + 54], "6", 2)
  
  // Billowing Volumetric Smoke Plumes (Soft white clouds with shading)
  const sm1 = C3(P, chX + 8, chY + 8, chZ + 58)
  c.ellipse(sm1[0], sm1[1], 10, 8, "7")
  c.ellipse(sm1[0] + 2, sm1[1] - 2, 8, 6, "8")
  
  const sm2 = C3(P, chX + 12, chY + 4, chZ + 74)
  c.ellipse(sm2[0], sm2[1], 15, 12, "7")
  c.ellipse(sm2[0] + 3, sm2[1] - 3, 12, 9, "8")
  c.ellipse(sm2[0] + 5, sm2[1] - 5, 8, 6, "9")
  
  const sm3 = C3(P, chX + 18, chY - 2, chZ + 92)
  c.ellipse(sm3[0], sm3[1], 20, 16, "7")
  c.ellipse(sm3[0] + 4, sm3[1] - 4, 16, 12, "8")
  c.ellipse(sm3[0] + 7, sm3[1] - 6, 11, 8, "9")
  
  // =========================================================================
  // 11. OUTDOOR DOME BAKING OVEN WING (Attached to Left Facade)
  // Fieldstone base, clay brick dome, arched firebox mouth with glowing embers!
  // =========================================================================
  const ovX = 8, ovY = D + 2, ovZ = 0
  // Foundation Base
  isoBox(c, P, ovX, ovY, ovZ, 38, 24, 22, "o", "q", "p")
  // Curved Terracotta/Clay Dome on Top
  const dop = C3(P, ovX + 19, ovY + 12, ovZ + 22)
  c.ellipse(dop[0], dop[1], 28, 14, "v")
  c.ellipse(dop[0], dop[1] - 3, 24, 11, "w")
  c.ellipse(dop[0] + 3, dop[1] - 5, 18, 8, "x")
  
  // Arched Firebox Opening with Glowing Orange/Yellow Embers
  isoBox(c, P, ovX + 12, ovY + 24, 4, 16, 0, 14, null, "1", null)
  isoBox(c, P, ovX + 14, ovY + 24, 6, 12, 0, 10, null, "3", null)
  isoPx(c, P, [ovX + 19, ovY + 24, 9], "5")
  isoPx(c, P, [ovX + 20, ovY + 24, 9], "5")
  // Cast Iron Hinged Oven Door (Ajar)
  isoBox(c, P, ovX + 27, ovY + 26, 4, 4, 0, 14, null, "a", null)
  isoLine(c, P, [ovX + 27, ovY + 26, 4], [ovX + 31, ovY + 26, 18], "q", 1)
  
  // =========================================================================
  // 12. LIVING PROPS: FIREWOOD SHELTER, FLOUR SACKS, RAIN BARREL & BREAD BENCH
  // =========================================================================
  // Stacked Seasoned Firewood under Timber Awning (x: ovX - 4, y: ovY, z: 0)
  for (let lz = 2; lz < 16; lz += 4) {
    for (let ly = ovY + 4; ly < ovY + 20; ly += 6) {
      isoPx(c, P, [4, ly, lz], "m")
      isoPx(c, P, [4, ly + 1, lz], "l")
      isoPx(c, P, [4, ly + 2, lz], "j")
    }
  }
  
  // Wooden Rainwater Butt / Barrel under downspout (Right Corner at x = W - 2, y = 14)
  const rbp = C3(P, W + 2, 18, 0)
  c.ellipse(rbp[0], rbp[1], 10, 6, "h")
  c.rect(rbp[0] - 10, rbp[1] - 16, 20, 16, "j")
  c.ellipse(rbp[0], rbp[1] - 16, 10, 5, "k")
  // Iron barrel hoops
  c.hline(rbp[0] - 10, rbp[1] - 12, 20, "a")
  c.hline(rbp[0] - 10, rbp[1] - 4, 20, "a")
  // Zinc Gutter Downspout running down corner from eave
  isoLine(c, P, [W, 14, zEave - 4], [W + 2, 16, 16], "L", 2)
  
  // Woven Wicker Bread Baskets with Fresh Loaves on Display Bench
  // Wooden Bench on Porch (x: 82 -> 102, y: D + 4, z: 6)
  isoBox(c, P, 84, D + 6, 6, 22, 8, 8, "i", "k", "l")
  // Wicker Basket 1 (Round crusty country loaves)
  const bk1 = C3(P, 88, D + 10, 14)
  c.ellipse(bk1[0], bk1[1], 8, 5, "A")
  c.ellipse(bk1[0], bk1[1] - 1, 7, 4, "B")
  c.ellipse(bk1[0] - 2, bk1[1] - 2, 4, 3, "C")
  c.px(bk1[0] - 2, bk1[1] - 3, "D")
  c.ellipse(bk1[0] + 2, bk1[1] - 2, 4, 3, "C")
  c.px(bk1[0] + 2, bk1[1] - 3, "D")
  // Wicker Basket 2 (Crisp baguettes)
  const bk2 = C3(P, 98, D + 10, 14)
  c.ellipse(bk2[0], bk2[1], 8, 5, "A")
  c.line(bk2[0] - 3, bk2[1] - 3, bk2[0] + 2, bk2[1] - 10, "C", 2)
  c.line(bk2[0] - 2, bk2[1] - 4, bk2[0] + 3, bk2[1] - 9, "D", 1)
  c.px(bk2[0], bk2[1] - 6, "E")
  
  // Tied Canvas Flour Sacks on Wooden Pallet (x: 40, y: D + 10, z: 6)
  isoBox(c, P, 40, D + 12, 6, 12, 10, 12, "G", "F", "F")
  isoLine(c, P, [40, D + 17, 12], [52, D + 17, 12], "A", 2) // tie rope
  isoPx(c, P, [46, D + 17, 15], "F")                         // gathered ear
})
