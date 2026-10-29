// ISOMETRIC BUILDINGS A - Authentic Settlers II Medieval Pixel Art
// Buildings: b_iso_hq (96x104), b_iso_hut (64x62), b_iso_woodcutter (64x58), b_iso_forester (64x58),
// b_iso_quarry (64x56), b_iso_sawmill (80x72), b_iso_fisher (64x58), b_iso_farm (96x74)
// Plus authentic under-construction scaffolds for all 8 buildings.

pal({
  // Outline & Deep Shadows
  a: "#16111e", // deep ink outline
  b: "#251c2d", // deep shadow
  
  // Plaster & Mortar (Warm Cream Fachwerk)
  c: "#786d58", // shadow plaster
  d: "#a89b80", // mid-dark plaster
  e: "#d6cca8", // lit warm plaster
  f: "#f5edd2", // bright cream plaster
  
  // Oak Timber Framing (Fachwerk & Beams)
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
  
  // Thatch & Straw (Farm & Huts)
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
  
  // Windows, Warm Hearth & Lights
  6: "#1a2533", // dark glass / window frame
  7: "#d9771e", // amber hearth glow
  8: "#f5b838", // warm candle yellow
  9: "#fff28a", // bright light highlight
  
  // Accents (Flags, Banners, Foliage, Blooms, Flour)
  A: "#a31d24", // royal banner crimson
  B: "#d63638", // bright red bloom / flag
  C: "#f26d6d", // flag highlight
  D: "#264a27", // dark foliage / ivy
  E: "#467d36", // mid leaf / shutter green
  F: "#74b34b", // bright leaf green
  G: "#ffffff", // white sail / daisy / smoke puff
  H: "#d1c4b2", // sack canvas / rope
  I: "#9e866b"  // rope dark / flour sack shadow
})

ramps("ab", "cdef", "ghijk", "lmnop", "qrtu", "vwxyz", "12345", "6789", "ABC", "DEF", "HGI")

// --- REUSABLE DETAIL HELPERS ---
function drawStoneQuoins(c, x, y, h, leftFacing) {
  for (let py = y; py < y + h; py += 4) {
    const isBig = ((py - y) % 8) === 0
    const w = isBig ? 3 : 2
    if (leftFacing) {
      c.rect(x, py, w, 3, "o")
      c.px(x, py, "p")
    } else {
      c.rect(x - w + 1, py, w, 3, "n")
      c.px(x - w + 1, py, "o")
    }
  }
}

function drawScaffold(c, w, h) {
  // Common authentic wooden scaffold structure for under-construction phase
  const cx = Math.floor(w / 2), cy = h - 4
  // Foundation footprint stones
  c.poly([cx, cy, 8, cy - Math.floor(cx * 0.45), cx, cy - Math.floor(cx * 0.8), w - 8, cy - Math.floor(cx * 0.45)], "m")
  c.poly([cx, cy, 8, cy - Math.floor(cx * 0.45), 8, cy - Math.floor(cx * 0.45) - 6, cx, cy - 6], "l")
  c.poly([cx, cy, w - 8, cy - Math.floor(cx * 0.45), w - 8, cy - Math.floor(cx * 0.45) - 6, cx, cy - 6], "m")
  
  // Upright scaffolding timber poles
  const poles = [14, Math.floor(w * 0.35), cx, Math.floor(w * 0.65), w - 14]
  for (const px of poles) {
    const pyBase = cy - Math.floor(Math.abs(px - cx) * 0.45)
    c.line(px, pyBase, px, 12, "h", 1)
    c.px(px, 11, "k")
  }
  // Scaffolding horizontal decks & bracing
  const yDecks = [cy - 16, cy - 30, cy - 44]
  for (const yd of yDecks) {
    if (yd > 16) {
      c.line(12, yd + 6, w - 12, yd - 6, "j", 1)
      c.line(10, yd + 7, w - 10, yd - 5, "i", 1)
      // Planks laid on platform
      c.rect(cx - 10, yd - 2, 20, 2, "k")
    }
  }
  // Wooden diagonal braces
  c.line(14, cy - 10, Math.floor(w * 0.35), cy - 30, "i", 1)
  c.line(Math.floor(w * 0.35), cy - 10, 14, cy - 30, "i", 1)
  c.line(cx, cy - 15, Math.floor(w * 0.65), cy - 35, "i", 1)
  c.line(Math.floor(w * 0.65), cy - 15, cx, cy - 35, "i", 1)
  
  // Ladder leaning
  c.line(cx - 8, cy, cx - 4, cy - 26, "h", 1)
  c.line(cx - 3, cy, cx + 1, cy - 26, "h", 1)
  for (let ly = cy - 3; ly > cy - 24; ly -= 4) {
    c.hline(cx - 7 + Math.floor((cy - ly) * 0.16), ly, 4, "k")
  }
  // Hoist pulley & dangling rope with lumber crate
  c.line(cx + 8, 12, cx + 18, 16, "j", 1)
  c.line(cx + 18, 16, cx + 18, cy - 20, "H", 1)
  c.rect(cx + 15, cy - 20, 7, 6, "j")
  c.box(cx + 15, cy - 20, 7, 6, "h")
}


// =========================================================================
// 1. CASTLE / HEADQUARTERS (b_iso_hq: 96x104, 3x3 footprint)
// =========================================================================
sprite("b_iso_hq", { w: 96, h: 104, outline: "a" }, (c) => {
  // Base footprint center (48, 102). Footprint diamond: (48, 102), (4, 78), (48, 54), (92, 78).
  
  // --- BASE LEVEL: Heavy Granite Keep Walls ---
  // Left wall (SW facing, shadow side)
  c.poly([48, 100, 8, 80, 8, 52, 48, 72], "m")
  // Right wall (SE facing, lit side)
  c.poly([48, 100, 88, 80, 88, 52, 48, 72], "n")
  
  // Stone courses and ashlar blocks
  for (let y = 56; y <= 96; y += 6) {
    const dy = y - 72
    c.line(48, y, 8, y - 20, "l", 1)
    c.line(48, y, 88, y - 20, "m", 1)
    // Vertical mortar joints
    for (let x = 16; x < 48; x += 10) {
      const jy = y - Math.floor((48 - x) * 0.5)
      c.line(x, jy, x, jy + 5, "l", 1)
    }
    for (let x = 54; x < 84; x += 10) {
      const jy = y - Math.floor((x - 48) * 0.5)
      c.line(x, jy, x, jy + 5, "m", 1)
      c.px(x + 1, jy + 1, "o") // lit block highlight
    }
  }
  
  // Quoin stones on corner edges
  drawStoneQuoins(c, 8, 54, 26, true)
  drawStoneQuoins(c, 86, 54, 26, false)
  drawStoneQuoins(c, 47, 72, 28, false)
  
  // Massive Arched Main Gate & Portcullis (center SW/SE junction)
  c.poly([42, 98, 54, 98, 54, 78, 42, 78], "l")
  c.rect(43, 80, 10, 18, "g")
  // Heavy wooden planks with iron bands
  c.vline(45, 80, 18, "h")
  c.vline(48, 80, 18, "h")
  c.vline(51, 80, 18, "h")
  c.hline(43, 85, 10, "2")
  c.hline(43, 92, 10, "2")
  // Iron portcullis spikes & ring handles
  c.px(45, 90, "5")
  c.px(50, 90, "5")
  // Arched Stone Lintel above gate
  c.poly([41, 79, 48, 75, 55, 79, 53, 82, 48, 78, 43, 82], "p")
  
  // --- FLANKING GUARD TOWERS (Left & Right) ---
  // Left Watchtower (NW corner)
  c.poly([8, 62, 0, 58, 0, 32, 8, 36], "m")
  c.poly([8, 62, 16, 58, 16, 32, 8, 36], "n")
  // Arrow slits
  c.rect(3, 40, 2, 7, "l")
  c.rect(11, 40, 2, 7, "l")
  // Conical Slate Roof (Left Tower)
  c.poly([8, 14, 0, 33, 16, 33], "3")
  c.poly([8, 14, 8, 33, 16, 33], "4")
  c.line(8, 14, 8, 33, "5", 1)
  c.px(8, 13, "u") // golden finial
  
  // Right Watchtower (NE corner)
  c.poly([80, 62, 72, 58, 72, 32, 80, 36], "m")
  c.poly([80, 62, 88, 58, 88, 32, 80, 36], "n")
  c.rect(75, 40, 2, 7, "l")
  c.rect(83, 40, 2, 7, "l")
  // Conical Slate Roof (Right Tower)
  c.poly([80, 14, 72, 33, 88, 33], "3")
  c.poly([80, 14, 80, 33, 88, 33], "4")
  c.line(80, 14, 80, 33, "5", 1)
  c.px(80, 13, "u")
  
  // --- UPPER KEEP / GREAT HALL ---
  // Upper Keep body
  c.poly([48, 68, 22, 54, 22, 28, 48, 42], "m")
  c.poly([48, 68, 74, 54, 74, 28, 48, 42], "o")
  // Stone ashlar texture on keep
  c.line(48, 56, 22, 42, "l", 1)
  c.line(48, 56, 74, 42, "n", 1)
  c.line(48, 44, 22, 30, "l", 1)
  c.line(48, 44, 74, 30, "n", 1)
  
  // Stately Arched Windows with Leaded Glass & warm glow
  c.poly([32, 44, 38, 47, 38, 37, 32, 34], "l")
  c.rect(34, 38, 3, 7, "8")
  c.px(35, 41, "9")
  c.poly([58, 47, 64, 44, 64, 34, 58, 37], "l")
  c.rect(59, 38, 3, 7, "8")
  c.px(60, 41, "9")
  
  // Royal Heraldic Crest above gate (Gold Lion on Crimson)
  c.rect(45, 52, 6, 8, "A")
  c.box(45, 52, 6, 8, "y")
  c.px(47, 54, "z")
  c.px(48, 55, "z")
  c.px(47, 57, "z")
  
  // Battlements & Crenellations on Keep Top
  for (let bx = 22; bx < 48; bx += 6) {
    const by = 28 + Math.floor((bx - 22) * 0.54)
    c.rect(bx, by - 6, 4, 6, "m")
    c.px(bx, by - 6, "o")
  }
  for (let bx = 48; bx < 74; bx += 6) {
    const by = 42 - Math.floor((bx - 48) * 0.54)
    c.rect(bx, by - 6, 4, 6, "o")
    c.px(bx, by - 6, "p")
  }
  
  // High Central Belfry Tower & Royal Flag
  c.poly([48, 38, 40, 34, 40, 16, 48, 20], "m")
  c.poly([48, 38, 56, 34, 56, 16, 48, 20], "o")
  // Slate hip roof on central tower
  c.poly([48, 6, 38, 17, 58, 17], "3")
  c.poly([48, 6, 48, 17, 58, 17], "4")
  c.line(48, 6, 48, 17, "5", 1)
  
  // Royal Flagstaff & Flowing Pennant
  c.line(48, 6, 48, 0, "5", 1)
  c.poly([48, 1, 62, 4, 56, 7, 48, 9], "A")
  c.poly([48, 2, 60, 4, 54, 6, 48, 7], "B")
  c.line(48, 1, 62, 4, "C", 1)
  
  // Wall Torches flanking entrance
  c.px(39, 82, "7")
  c.px(39, 81, "8")
  c.px(57, 82, "7")
  c.px(57, 81, "8")
})

sprite("b_iso_hq_scaffold", { w: 96, h: 104, outline: "a" }, (c) => {
  drawScaffold(c, 96, 104)
  // Partial castle stone keep walls rising in center
  c.poly([48, 92, 20, 78, 20, 62, 48, 76], "m")
  c.poly([48, 92, 76, 78, 76, 62, 48, 76], "n")
  // In-progress stone blocks and mortar
  c.rect(44, 76, 8, 14, "l")
  c.px(45, 78, "h")
  c.px(50, 78, "h")
})


// =========================================================================
// 2. SETTLER HUT (b_iso_hut: 64x62, 2x2 footprint)
// =========================================================================
sprite("b_iso_hut", { w: 64, h: 62, outline: "a" }, (c) => {
  // Base center: (32, 60). Footprint: (32, 60), (2, 45), (32, 30), (62, 45).
  
  // 1. Cobblestone Foundation Plinth
  c.poly([32, 59, 2, 44, 2, 39, 32, 54], "m")
  c.poly([32, 59, 62, 44, 62, 39, 32, 54], "n")
  c.line(2, 41, 32, 56, "l", 1)
  c.line(32, 56, 62, 41, "m", 1)
  for (let x = 6; x < 32; x += 5) c.line(x, 41 + Math.floor((x-2)/2), x, 44 + Math.floor((x-2)/2), "l", 1)
  for (let x = 36; x < 62; x += 5) c.line(x, 56 - Math.floor((x-32)/2), x, 59 - Math.floor((x-32)/2), "m", 1)
  
  // 2. Cream Plaster Fachwerk Walls
  c.poly([32, 54, 2, 39, 2, 22, 32, 37], "d")
  c.poly([32, 54, 62, 39, 62, 22, 32, 37], "e")
  
  // 3. Half-timbered Oak Beams (Fachwerk) on SW Wall (shadow side)
  c.line(2, 39, 32, 54, "h", 1)
  c.line(2, 22, 32, 37, "h", 1)
  c.line(2, 39, 2, 22, "h", 1)
  c.line(32, 54, 32, 37, "h", 1)
  c.line(12, 44, 12, 27, "h", 1)
  c.line(22, 49, 22, 32, "h", 1)
  c.line(2, 24, 12, 42, "h", 1) // Diagonal brace
  c.line(2, 37, 12, 27, "h", 1)
  
  // 4. Half-timbered Oak Beams on SE Wall (lit side)
  c.line(32, 54, 62, 39, "i", 1)
  c.line(32, 37, 62, 22, "i", 1)
  c.line(62, 39, 62, 22, "i", 1)
  c.line(42, 49, 42, 32, "i", 1)
  c.line(52, 44, 52, 27, "i", 1)
  c.line(52, 42, 62, 24, "i", 1) // Diagonal K-brace
  c.line(52, 29, 62, 37, "i", 1)
  
  // 5. Arched Wooden Plank Door on SW wall
  c.poly([15, 49, 21, 52, 21, 37, 15, 34], "g")
  c.line(16, 35, 16, 50, "h", 1)
  c.line(19, 36, 19, 51, "h", 1)
  c.px(20, 45, "5") // iron handle
  c.line(14, 33, 22, 37, "j", 1) // wood arch lintel
  
  // 6. Cozy Window with Shutters & Warm Glow on SE wall
  c.poly([44, 46, 50, 43, 50, 35, 44, 38], "6")
  c.poly([45, 45, 49, 43, 49, 36, 45, 38], "8")
  c.px(47, 39, "9")
  c.line(44, 42, 50, 39, "6", 1) // window crossbar
  c.line(47, 45, 47, 37, "6", 1)
  // Forest-green wooden shutters
  c.poly([42, 47, 44, 46, 44, 38, 42, 39], "E")
  c.poly([50, 43, 52, 42, 52, 34, 50, 35], "E")
  // Window Flower Box with red and white blooms
  c.line(44, 47, 50, 44, "h", 1)
  c.px(45, 46, "B")
  c.px(47, 45, "G")
  c.px(49, 44, "B")
  
  // 7. Terracotta Tile Overhanging Gable Roof
  // Ridge from (32, 13) to (32, 41)
  c.poly([32, 13, 0, 26, 32, 41], "r")
  c.poly([32, 13, 64, 26, 32, 41], "t")
  // Shingle courses with individual scallops
  for (let r = 0; r < 7; r++) {
    const yStart = 15 + r * 4
    c.line(32, yStart, 64, yStart + 13 - r * 2, "s", 1)
    for (let x = 34 + r * 2; x < 62; x += 4) {
      const ty = yStart + Math.floor((x - 32) * 0.44)
      c.px(x, ty, "u")
    }
    c.line(32, yStart, 0, yStart + 13 - r * 2, "q", 1)
  }
  c.line(32, 13, 32, 41, "u", 1) // ridge cap
  
  // 8. Stone Chimney with Smoke
  c.poly([42, 17, 47, 14, 47, 4, 42, 7], "m")
  c.poly([47, 14, 50, 16, 50, 6, 47, 4], "o")
  c.poly([42, 7, 47, 4, 50, 6, 45, 9], "p")
  c.rect(45, 2, 3, 2, "l")
  c.px(46, 0, "G")
  
  // 9. Rainwater Barrel prop
  c.rect(6, 46, 5, 7, "h")
  c.box(6, 46, 5, 7, "g")
  c.hline(7, 48, 3, "i")
  c.hline(7, 51, 3, "i")
  c.px(8, 46, "1")
})

sprite("b_iso_hut_scaffold", { w: 64, h: 62, outline: "a" }, (c) => {
  drawScaffold(c, 64, 62)
  // Partial timber cottage framing
  c.poly([32, 54, 6, 41, 6, 28, 32, 41], "h")
  c.poly([32, 54, 58, 41, 58, 28, 32, 41], "i")
})


// =========================================================================
// 3. WOODCUTTER CABIN (b_iso_woodcutter: 64x58, 2x2 footprint)
// =========================================================================
sprite("b_iso_woodcutter", { w: 64, h: 58, outline: "a" }, (c) => {
  // Rustic Bavarian Log Cabin with horizontal round notched logs and outdoor chopping block!
  // Base center: (32, 56). Footprint: (32, 56), (4, 42), (32, 28), (60, 42).
  
  // 1. Horizontal Round Pine Logs (SW wall & SE wall)
  c.poly([32, 55, 4, 41, 4, 24, 32, 38], "h")
  c.poly([32, 55, 60, 41, 60, 24, 32, 38], "i")
  // Log seams & round highlights
  for (let y = 27; y <= 55; y += 4) {
    c.line(4, y - 14, 32, y, "g", 1)
    c.line(32, y, 60, y - 14, "j", 1)
    // Round end-grain log cuts visible on the corner
    c.circ(32, y, 1, "k")
    c.px(32, y, "h")
  }
  
  // 2. Cabin Door & Window
  c.poly([16, 45, 22, 48, 22, 36, 16, 33], "g")
  c.line(17, 34, 17, 47, "h", 1)
  c.px(21, 42, "5")
  c.poly([44, 44, 50, 41, 50, 34, 44, 37], "6")
  c.poly([45, 43, 49, 41, 49, 35, 45, 37], "8")
  c.line(44, 40, 50, 37, "6", 1)
  
  // 3. Cedar Shingle Roof with Moss Patches
  c.poly([32, 10, 2, 24, 32, 39], "h")
  c.poly([32, 10, 62, 24, 32, 39], "j")
  // Shingle lines
  for (let r = 0; r < 6; r++) {
    const yStart = 12 + r * 4
    c.line(32, yStart, 62, yStart + 14 - r * 2, "i", 1)
    c.line(32, yStart, 2, yStart + 14 - r * 2, "g", 1)
  }
  c.line(32, 10, 32, 39, "k", 1) // roof ridge
  // Moss green patches on roof
  c.px(24, 26, "E")
  c.px(25, 27, "F")
  c.px(42, 28, "E")
  c.px(43, 27, "F")
  
  // 4. Chopping Block & Embedded Iron Axe (Front Left)
  c.poly([8, 49, 14, 52, 14, 46, 8, 43], "g")
  c.poly([14, 52, 18, 50, 18, 44, 14, 46], "i")
  c.ellipse(13, 44, 4, 2, "k") // wood grain top of block
  c.px(13, 44, "h")
  // Iron Axe embedded
  c.line(13, 44, 10, 36, "j", 1) // axe haft
  c.rect(9, 36, 3, 2, "5")       // steel blade
  
  // 5. Firewood Stack against SE Wall (Round log ends)
  c.rect(48, 44, 10, 7, "g")
  for (let lx = 49; lx <= 56; lx += 3) {
    c.circ(lx, 46, 1, "k")
    c.px(lx, 46, "h")
    c.circ(lx + 1, 49, 1, "k")
    c.px(lx + 1, 49, "h")
  }
  
  // Hanging Lantern on porch post
  c.line(26, 34, 26, 48, "g", 1)
  c.px(25, 38, "8")
  c.px(25, 39, "7")
})

sprite("b_iso_woodcutter_scaffold", { w: 64, h: 58, outline: "a" }, (c) => {
  drawScaffold(c, 64, 58)
  // Partial log walls
  c.line(10, 48, 32, 54, "h", 2)
  c.line(32, 54, 54, 48, "i", 2)
})


// =========================================================================
// 4. FORESTER LODGE (b_iso_forester: 64x58, 2x2 footprint)
// =========================================================================
sprite("b_iso_forester", { w: 64, h: 58, outline: "a" }, (c) => {
  // Base center: (32, 56).
  // 1. Timber & Plaster Lodge Walls
  c.poly([32, 55, 4, 41, 4, 24, 32, 38], "d")
  c.poly([32, 55, 60, 41, 60, 24, 32, 38], "e")
  // Dark green stained timber frames
  c.line(4, 41, 32, 55, "D", 1)
  c.line(32, 55, 60, 41, "D", 1)
  c.line(4, 24, 32, 38, "D", 1)
  c.line(32, 38, 60, 24, "D", 1)
  c.line(4, 41, 4, 24, "D", 1)
  c.line(32, 55, 32, 38, "D", 1)
  c.line(60, 41, 60, 24, "D", 1)
  c.line(16, 47, 16, 30, "D", 1)
  c.line(46, 49, 46, 32, "D", 1)
  
  // 2. Door with Antler Crest
  c.poly([18, 48, 24, 51, 24, 36, 18, 33], "g")
  c.px(21, 32, "G") // white antler decoration above door
  c.px(20, 31, "G")
  c.px(22, 31, "G")
  
  // 3. Thick Layered Thatched Straw Roof with Overhang
  c.poly([32, 9, 1, 24, 32, 40], "w")
  c.poly([32, 9, 63, 24, 32, 40], "y")
  // Thatched texture rows
  for (let r = 0; r < 6; r++) {
    const yStart = 11 + r * 5
    c.line(32, yStart, 63, yStart + 15 - r * 2, "x", 1)
    for (let x = 34 + r * 2; x < 61; x += 3) {
      c.px(x, yStart + Math.floor((x - 32) * 0.45), "z")
    }
    c.line(32, yStart, 1, yStart + 15 - r * 2, "v", 1)
  }
  c.line(32, 9, 32, 40, "z", 1)
  // Moss growth on ridge
  c.px(32, 15, "E")
  c.px(32, 22, "F")
  
  // 4. Seedling Nursery Planting Bed (Front Right)
  c.poly([38, 52, 54, 44, 54, 48, 38, 56], "g")
  c.poly([38, 52, 54, 44, 52, 43, 36, 51], "h") // dark rich loam
  // Tiny green tree sprouts growing
  for (let sx = 40; sx < 52; sx += 3) {
    const sy = 51 - Math.floor((sx - 38) * 0.5)
    c.px(sx, sy, "F")
    c.px(sx, sy - 1, "F")
  }
  
  // 5. Spade and Wicker Basket on porch
  c.line(10, 48, 14, 40, "j", 1) // spade handle
  c.rect(13, 39, 3, 3, "4")       // spade metal blade
  c.rect(7, 47, 4, 4, "x")        // wicker basket
})

sprite("b_iso_forester_scaffold", { w: 64, h: 58, outline: "a" }, (c) => {
  drawScaffold(c, 64, 58)
  c.line(6, 44, 32, 54, "D", 1)
  c.line(32, 54, 58, 44, "D", 1)
})


// =========================================================================
// 5. STONE QUARRY (b_iso_quarry: 64x56, 2x2 footprint)
// =========================================================================
sprite("b_iso_quarry", { w: 64, h: 56, outline: "a" }, (c) => {
  // Heavy Stone Mason workshop with chisel bench, granite blocks and wooden crane hoist!
  // Base center: (32, 54).
  
  // 1. Stonemason's Workshop Shed (Rear Left)
  c.poly([24, 48, 4, 38, 4, 20, 24, 30], "m")
  c.poly([24, 48, 44, 38, 44, 20, 24, 30], "n")
  // Rough-hewn stone wall courses
  c.line(4, 29, 24, 39, "l", 1)
  c.line(24, 39, 44, 29, "m", 1)
  // Slate Lean-to Roof
  c.poly([24, 12, 2, 22, 24, 32], "3")
  c.poly([24, 12, 46, 22, 24, 32], "4")
  c.line(24, 12, 24, 32, "5", 1)
  
  // 2. Open Stone Cutting Yard & Bench
  c.rect(12, 38, 10, 5, "o")
  c.box(12, 38, 10, 5, "m")
  // Iron chisel & mallet on bench
  c.px(14, 39, "5")
  c.line(16, 40, 19, 38, "j", 1)
  
  // 3. Stacks of Dressed Granite Ashlar Blocks (Front Right)
  // Block 1
  c.poly([34, 50, 42, 54, 42, 46, 34, 42], "m")
  c.poly([42, 54, 50, 50, 50, 42, 42, 46], "o")
  c.poly([34, 42, 42, 46, 50, 42, 42, 38], "p")
  // Block 2 stacked above
  c.poly([36, 42, 44, 46, 44, 39, 36, 35], "m")
  c.poly([44, 46, 52, 42, 52, 35, 44, 39], "o")
  c.poly([36, 35, 44, 39, 52, 35, 44, 31], "p")
  
  // 4. Heavy Wooden A-Frame Crane Hoist
  c.line(28, 46, 34, 18, "h", 2)
  c.line(42, 40, 34, 18, "i", 2)
  c.line(34, 18, 48, 12, "j", 2) // crane jib
  // Hoist pulley wheel & rope with lifting tongs
  c.circ(47, 13, 2, "2")
  c.line(47, 14, 47, 32, "H", 1) // rope
  c.line(45, 32, 49, 32, "5", 1) // iron lifting scissor tongs
  c.line(45, 32, 44, 36, "5", 1)
  c.line(49, 32, 50, 36, "5", 1)
  
  // Rubble and stone chips on ground
  c.px(26, 50, "p")
  c.px(28, 52, "o")
  c.px(30, 48, "p")
})

sprite("b_iso_quarry_scaffold", { w: 64, h: 56, outline: "a" }, (c) => {
  drawScaffold(c, 64, 56)
  c.rect(26, 38, 12, 8, "m")
})


// =========================================================================
// 6. SAWMILL (b_iso_sawmill: 80x72, 3x2 footprint)
// =========================================================================
sprite("b_iso_sawmill", { w: 80, h: 72, outline: "a" }, (c) => {
  // Heavy Timber Sawmill with large spinning steel circular saw, log carrier bed & lumber piles!
  // Footprint 3x2. Base center bottom: (48, 70).
  
  // 1. Heavy Timber Mill Structure (open sides with cross trusses)
  // Rear wall
  c.poly([48, 54, 8, 34, 8, 18, 48, 38], "h")
  c.poly([48, 54, 76, 40, 76, 24, 48, 38], "i")
  
  // Heavy wooden support pillars
  c.line(16, 52, 16, 26, "g", 2)
  c.line(34, 61, 34, 34, "h", 2)
  c.line(48, 68, 48, 38, "i", 2)
  c.line(64, 60, 64, 32, "i", 2)
  c.line(74, 55, 74, 27, "j", 2)
  // Diagonal support knee-braces
  c.line(16, 30, 26, 35, "i", 1)
  c.line(48, 42, 38, 47, "h", 1)
  c.line(48, 42, 58, 47, "j", 1)
  
  // 2. Large Shingled Gable Roof
  c.poly([48, 10, 4, 26, 48, 42], "r")
  c.poly([48, 10, 78, 26, 48, 42], "t")
  for (let r = 0; r < 7; r++) {
    const yStart = 13 + r * 4
    c.line(48, yStart, 78, yStart + 13 - r * 2, "s", 1)
    c.line(48, yStart, 4, yStart + 13 - r * 2, "q", 1)
  }
  c.line(48, 10, 48, 42, "u", 1)
  
  // 3. Central Sawing Bed & Gleaming Circular Saw Blade!
  c.poly([24, 52, 42, 61, 42, 53, 24, 44], "h") // saw bed frame
  c.poly([42, 61, 56, 54, 56, 46, 42, 53], "j")
  // Tree log resting on feed carriage
  c.poly([20, 48, 36, 56, 36, 50, 20, 42], "g")
  c.circ(36, 50, 2, "k")
  c.px(36, 50, "h")
  // STEEL CIRCULAR SAW BLADE (gleaming vertical disc)
  c.ellipse(38, 46, 4, 7, "5")
  c.ellipse(38, 46, 2, 4, "4")
  c.px(38, 46, "1") // axle arbor
  c.px(38, 40, "G") // blade top highlight glint!
  
  // 4. Stacks of Freshly Cut Lumber Boards (Front Right)
  // Stack 1
  c.poly([52, 64, 66, 57, 66, 52, 52, 59], "j")
  c.poly([66, 57, 74, 61, 74, 56, 66, 52], "k")
  c.poly([52, 59, 66, 52, 74, 56, 60, 63], "z") // top board pine yellow
  // Spacer battens between planks
  c.line(52, 61, 66, 54, "h", 1)
  c.line(52, 63, 66, 56, "h", 1)
  
  // Sawdust mounds
  c.ellipse(40, 64, 6, 2, "z")
  c.ellipse(46, 66, 4, 2, "y")
})

sprite("b_iso_sawmill_scaffold", { w: 80, h: 72, outline: "a" }, (c) => {
  drawScaffold(c, 80, 72)
  c.line(16, 50, 48, 66, "h", 2)
  c.line(48, 66, 74, 53, "i", 2)
})


// =========================================================================
// 7. FISHERMAN HUT (b_iso_fisher: 64x58, 2x2 footprint)
// =========================================================================
sprite("b_iso_fisher", { w: 64, h: 58, outline: "a" }, (c) => {
  // Stilted lakeside fishing shack on wooden pilings with dock, fish drying rack, and barrels!
  // Base center: (32, 56).
  
  // 1. Wooden Pier / Dock Pilings (standing in water/shore)
  const pilings = [10, 22, 34, 46, 56]
  for (const px of pilings) {
    const py = 54 - Math.floor(Math.abs(px - 32) * 0.4)
    c.line(px, py + 3, px, py - 6, "g", 2)
    // Water ripple ring around piling
    c.px(px - 1, py + 3, "G")
    c.px(px + 1, py + 3, "G")
  }
  
  // 2. Wooden Boardwalk / Deck Platform
  c.poly([32, 52, 6, 39, 6, 36, 32, 49], "h")
  c.poly([32, 52, 60, 39, 60, 36, 32, 49], "i")
  c.poly([32, 49, 6, 36, 32, 23, 58, 36], "j")
  // Plank deck seams
  for (let dy = 26; dy < 48; dy += 3) {
    c.line(32, dy, 58, dy + 13 - Math.floor((dy - 26) * 0.4), "h", 1)
  }
  
  // 3. Weathered Cedar Plank Shack (sitting on deck)
  c.poly([28, 44, 12, 36, 12, 22, 28, 30], "h")
  c.poly([28, 44, 44, 36, 44, 22, 28, 30], "i")
  // Door with rope handle
  c.rect(18, 30, 6, 11, "g")
  c.px(22, 36, "H")
  
  // 4. Overhanging Shingle Roof
  c.poly([28, 12, 8, 22, 28, 32], "q")
  c.poly([28, 12, 48, 22, 28, 32], "s")
  c.line(28, 12, 28, 32, "t", 1)
  
  // 5. Fish Drying Rack (Front Right on dock)
  c.line(46, 46, 46, 34, "h", 1)
  c.line(56, 41, 56, 29, "i", 1)
  c.line(46, 36, 56, 31, "j", 1) // horizontal hanging pole
  // Brown hanging net
  c.poly([47, 36, 55, 32, 55, 38, 47, 42], "H")
  // Silver fish hanging to dry
  c.px(48, 38, "5")
  c.px(48, 39, "5")
  c.px(51, 36, "5")
  c.px(51, 37, "5")
  c.px(54, 34, "5")
  c.px(54, 35, "5")
  
  // 6. Barrels of Salted Fish & Mooring Rope
  c.rect(34, 45, 5, 6, "h")
  c.box(34, 45, 5, 6, "g")
  c.px(36, 45, "5") // fish inside barrel
  c.rect(40, 48, 4, 5, "i")
})

sprite("b_iso_fisher_scaffold", { w: 64, h: 58, outline: "a" }, (c) => {
  drawScaffold(c, 64, 58)
  c.line(10, 46, 32, 52, "h", 2)
  c.line(32, 52, 56, 46, "i", 2)
})


// =========================================================================
// 8. FARM & BARN (b_iso_farm: 96x74, 3x3 footprint)
// =========================================================================
sprite("b_iso_farm", { w: 96, h: 74, outline: "a" }, (c) => {
  // Stately Bavarian agricultural barn with stone plinth, gambrel roof, hayloft and hay spill!
  // Footprint 3x3. Base center: (48, 72).
  
  // 1. Stone Foundation Plinth
  c.poly([48, 70, 8, 50, 8, 45, 48, 65], "m")
  c.poly([48, 70, 88, 50, 88, 45, 48, 65], "n")
  
  // 2. Red-Brown Timber Barn Walls
  c.poly([48, 65, 8, 45, 8, 28, 48, 48], "s")
  c.poly([48, 65, 88, 45, 88, 28, 48, 48], "t")
  // Vertical plank battens
  for (let x = 12; x < 48; x += 6) {
    const y1 = 45 - Math.floor((48 - x) * 0.5)
    c.line(x, y1 + 20, x, y1 + 3, "r", 1)
  }
  for (let x = 54; x < 84; x += 6) {
    const y1 = 65 - Math.floor((x - 48) * 0.5)
    c.line(x, y1, x, y1 - 17, "s", 1)
  }
  
  // 3. Double Barn Doors with X-Braces
  c.poly([38, 64, 58, 64, 58, 48, 38, 48], "g")
  c.rect(40, 50, 8, 14, "h")
  c.rect(48, 50, 8, 14, "i")
  // X-bracing on barn doors
  c.line(40, 50, 47, 63, "k", 1)
  c.line(40, 63, 47, 50, "k", 1)
  c.line(48, 50, 55, 63, "k", 1)
  c.line(48, 63, 55, 50, "k", 1)
  
  // 4. Gambrel Clay Tile Roof
  c.poly([48, 8, 4, 28, 48, 48], "r")
  c.poly([48, 8, 92, 28, 48, 48], "u")
  for (let r = 0; r < 8; r++) {
    const yStart = 11 + r * 4
    c.line(48, yStart, 92, yStart + 20 - r * 2, "t", 1)
    c.line(48, yStart, 4, yStart + 20 - r * 2, "q", 1)
  }
  c.line(48, 8, 48, 48, "u", 1)
  
  // 5. Open Upper Hayloft Door & Golden Hay Spill!
  c.rect(43, 26, 10, 12, "g")
  c.poly([44, 27, 52, 27, 52, 37, 44, 37], "h")
  // Golden straw spilling out over the sill
  c.poly([42, 35, 54, 35, 52, 42, 44, 42], "y")
  c.poly([43, 36, 53, 36, 50, 44, 46, 44], "z")
  // Hoist boom beam with rope & pulley above hayloft
  c.line(48, 20, 48, 25, "k", 2)
  c.line(48, 25, 48, 34, "H", 1)
  
  // 6. Rooster Weather Vane on roof apex!
  c.line(48, 8, 48, 2, "5", 1)
  c.px(48, 3, "u")
  c.px(49, 2, "B") // rooster red comb
  c.px(47, 3, "z") // rooster tail
  
  // 7. Props: Cartwheel & Sacks of Grain
  // Large wagon wheel leaning on side wall
  c.ring(74, 54, 4, "h")
  c.px(74, 54, "k")
  c.line(71, 54, 77, 54, "j", 1)
  c.line(74, 51, 74, 57, "j", 1)
  // Sacks of grain
  c.ellipse(26, 56, 3, 4, "H")
  c.ellipse(30, 58, 3, 4, "H")
  c.px(26, 54, "I")
  c.px(30, 56, "I")
})

sprite("b_iso_farm_scaffold", { w: 96, h: 74, outline: "a" }, (c) => {
  drawScaffold(c, 96, 74)
  c.poly([48, 64, 18, 50, 18, 38, 48, 52], "s")
  c.poly([48, 64, 78, 50, 78, 38, 48, 52], "t")
})
