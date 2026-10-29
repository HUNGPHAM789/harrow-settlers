// ISOMETRIC BUILDINGS A - 3D Isometric Engine (The Settlers II Standard)
// Modeled directly on the proven Last Fortress 3D isometric architecture (ISO(x,y,z))
// Buildings: b_iso_hq (96x104), b_iso_hut (64x62), b_iso_woodcutter (64x58), b_iso_forester (64x58),
// b_iso_quarry (64x56), b_iso_sawmill (80x72), b_iso_fisher (64x58), b_iso_farm (96x74)
// Plus authentic under-construction scaffolds for all 8 buildings.

include("_iso_lib.px.js")

// =========================================================================
// 1. CASTLE / HEADQUARTERS (b_iso_hq: 96x104, 3x3 footprint)
// =========================================================================
sprite("b_iso_hq", { w: 96, h: 104, outline: "a" }, (c) => {
  const N = 3, M = 3, H = 56
  const P = makeISO(96, 104, N, M)
  const W = N * 16, D = M * 16 // 48x48
  
  // 1. Ground Stone Plinth
  isoStonePlinth(c, P, 1, 1, 0, W - 2, D - 2, 4)
  
  // 2. Lower Fortress Keep Stone Walls (z = 4..24)
  isoBox(c, P, 2, 2, 4, W - 4, D - 4, 20, "n", "o", "m")
  // Horizontal stone ashlar courses
  for (let z = 8; z <= 24; z += 4) {
    isoLine(c, P, [2, D - 2, z], [W - 2, D - 2, z], "l", 1)
    isoLine(c, P, [W - 2, 2, z], [W - 2, D - 2, z], "l", 1)
  }
  // Vertical stone joints
  for (let x = 6; x < W - 4; x += 8) {
    isoLine(c, P, [x, D - 2, 4], [x, D - 2, 24], "l", 1)
    isoPx(c, P, [x + 1, D - 2, 23], "p")
  }
  for (let y = 6; y < D - 4; y += 8) {
    isoLine(c, P, [W - 2, y, 4], [W - 2, y, 24], "l", 1)
  }
  
  // 3. Flanking Corner Guard Towers (NW and NE corners)
  // Left Tower (NW corner: x = 0..12, y = D - 12..D, z = 0..34)
  isoBox(c, P, 0, D - 12, 0, 12, 12, 34, "n", "o", "m")
  isoConicalRoof(c, P, 6, D - 6, 8, 34, 46, "4", "3", "u")
  isoLine(c, P, [6, D, 14], [6, D, 22], "l", 2) // arrow slit
  
  // Right Tower (NE corner: x = W - 12..W, y = 0..12, z = 0..34)
  isoBox(c, P, W - 12, 0, 0, 12, 12, 34, "n", "o", "m")
  isoConicalRoof(c, P, W - 6, 6, 8, 34, 46, "4", "3", "u")
  isoLine(c, P, [W, 6, 14], [W, 6, 22], "l", 2)
  
  // 4. Massive Arched Portcullis Main Gate (Center SW face)
  isoDoorSW(c, P, D - 2, 18, 4, 12, 16)
  // Gate wall torches
  isoPx(c, P, [15, D - 2, 14], "7")
  isoPx(c, P, [15, D - 2, 15], "8")
  isoPx(c, P, [33, D - 2, 14], "7")
  isoPx(c, P, [33, D - 2, 15], "8")
  
  // 5. Upper Castle Keep (z = 24..42, inset: x = 8..40, y = 8..40)
  isoBox(c, P, 8, 8, 24, W - 16, D - 16, 18, "n", "o", "m")
  // Upper stone courses
  for (let z = 28; z <= 42; z += 4) {
    isoLine(c, P, [8, D - 8, z], [W - 8, D - 8, z], "l", 1)
    isoLine(c, P, [W - 8, 8, z], [W - 8, D - 8, z], "l", 1)
  }
  // Stately Leaded Windows on upper keep
  isoBox(c, P, 14, D - 8, 28, 6, 0, 8, null, "8", null)
  isoLine(c, P, [17, D - 8, 28], [17, D - 8, 36], "6", 1)
  isoPx(c, P, [16, D - 8, 32], "9")
  isoBox(c, P, W - 8, 14, 28, 0, 6, 8, null, null, "8")
  isoLine(c, P, [W - 8, 17, 28], [W - 8, 17, 36], "6", 1)
  isoPx(c, P, [W - 8, 16, 32], "9")
  
  // Royal Heraldic Crest (Lion on Crimson) above gate
  isoBox(c, P, 21, D - 8, 28, 6, 0, 7, null, "A", null)
  isoPx(c, P, [23, D - 8, 31], "8")
  isoPx(c, P, [24, D - 8, 32], "8")
  isoPx(c, P, [23, D - 8, 34], "8")
  
  // Crenellated Battlements on Upper Keep top edge
  for (let bx = 8; bx < W - 8; bx += 6) {
    isoBox(c, P, bx, D - 8, 42, 3, 1, 4, "p", "o", "m")
  }
  for (let by = 8; by < D - 8; by += 6) {
    isoBox(c, P, W - 8, by, 42, 1, 3, 4, "p", "o", "m")
  }
  
  // 6. Central High Belfry Tower & Royal Flag
  isoBox(c, P, 18, 18, 42, 12, 12, 14, "n", "o", "m")
  isoGableRoof(c, P, 16, 16, 16, 16, 56, 68, "4", "3", "5", "o")
  
  // Royal Flagstaff & Flowing Pennant
  isoLine(c, P, [24, 24, 68], [24, 24, 82], "5", 1)
  const fp1 = P(24, 24, 81), fp2 = P(24, 24, 73)
  c.poly([fp1[0], fp1[1], fp1[0] + 14, fp1[1] + 3, fp1[0] + 8, fp1[1] + 6, fp2[0], fp2[1]], "A")
  c.line(fp1[0], fp1[1], fp1[0] + 14, fp1[1] + 3, "B", 1)
})

sprite("b_iso_hq_scaffold", { w: 96, h: 104, outline: "a" }, (c) => {
  const N = 3, M = 3, H = 56
  const P = makeISO(96, 104, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
  // Partial castle stone keep rising
  isoBox(c, P, 6, 6, 4, W - 12, D - 12, 16, "n", "o", "m")
})


// =========================================================================
// 2. SETTLER HUT (b_iso_hut: 64x62, 2x2 footprint)
// =========================================================================
sprite("b_iso_hut", { w: 64, h: 62, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 30
  const P = makeISO(64, 62, N, M)
  const W = N * 16, D = M * 16 // 32x32
  
  // 1. Cobblestone Plinth Foundation (z = 0..5)
  isoStonePlinth(c, P, 1, 1, 0, W - 2, D - 2, 5)
  
  // 2. Half-timbered Fachwerk Walls (z = 5..18)
  isoFachwerkSW(c, P, D - 2, 2, W - 2, 5, 18, true)
  isoFachwerkSE(c, P, W - 2, 2, D - 2, 5, 18, true)
  
  // 3. Arched Wooden Door on SW wall
  isoDoorSW(c, P, D - 2, 16, 5, 8, 11)
  
  // 4. Cozy Leaded Glass Window with Shutters, Warm Glow & Flower Box on SE wall
  isoWindowSE(c, P, W - 2, 10, 8, 8, 7, true)
  
  // 5. Steep Clay Tile Gable Roof (z = 17..31)
  isoGableRoof(c, P, 0, 0, W, D, 17, 31, "t", "r", "u", "e")
  
  // 6. Stone Chimney with Smoke
  isoChimney(c, P, 6, 8, 22, 5, 5, 8, true)
  
  // 7. Rainwater Barrel prop
  isoBarrel(c, P, 4, D, 0)
})

sprite("b_iso_hut_scaffold", { w: 64, h: 62, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 30
  const P = makeISO(64, 62, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
  // Partial timber framing
  isoBox(c, P, 2, 2, 4, W - 4, D - 4, 10, "h", "i", "g")
})


// =========================================================================
// 3. WOODCUTTER CABIN (b_iso_woodcutter: 64x58, 2x2 footprint)
// =========================================================================
sprite("b_iso_woodcutter", { w: 64, h: 58, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 26
  const P = makeISO(64, 58, N, M)
  const W = N * 16, D = M * 16 // 32x32
  
  // 1. Interlocking Horizontal Round Log Walls
  isoBox(c, P, 2, 2, 0, W - 4, D - 4, 16, "h", "j", "i")
  // Horizontal log seams & corner end-grain cuts
  for (let z = 2; z <= 16; z += 3) {
    isoLine(c, P, [2, D - 2, z], [W - 2, D - 2, z], "g", 1)
    isoLine(c, P, [W - 2, 2, z], [W - 2, D - 2, z], "h", 1)
    isoPx(c, P, [W - 2, D - 2, z], "k") // round cut end-grain!
  }
  
  // 2. Cabin Door & Window
  isoDoorSW(c, P, D - 2, 16, 0, 8, 12)
  isoWindowSE(c, P, W - 2, 8, 6, 8, 6, false)
  
  // 3. Cedar Shingle Roof with Moss Patches
  isoGableRoof(c, P, 0, 0, W, D, 15, 27, "j", "h", "k", "i")
  // Moss patches on roof
  isoPx(c, P, [8, 20, 20], "E")
  isoPx(c, P, [12, 18, 22], "F")
  
  // 4. Chopping Block & Embedded Iron Axe
  isoBox(c, P, 4, D, 0, 6, 6, 5, "k", "j", "h")
  isoLine(c, P, [7, D + 3, 5], [5, D + 3, 9], "j", 1) // axe haft
  isoBox(c, P, 4, D + 2, 9, 3, 1, 2, "5", "4", "2")   // axe blade
  
  // 5. Firewood Stack against SE Wall (neatly piled logs)
  isoLogPile(c, P, W - 2, 4, 0, 16, 7)
  
  // Porch Timber Post & Lantern
  isoLine(c, P, [W - 2, D - 2, 0], [W - 2, D - 2, 16], "k", 1)
  isoPx(c, P, [W - 2, D - 1, 10], "8")
})

sprite("b_iso_woodcutter_scaffold", { w: 64, h: 58, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 26
  const P = makeISO(64, 58, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 4. FORESTER LODGE (b_iso_forester: 64x58, 2x2 footprint)
// =========================================================================
sprite("b_iso_forester", { w: 64, h: 58, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 26
  const P = makeISO(64, 58, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Green Timber-Framed Walls
  isoBox(c, P, 2, 2, 0, W - 4, D - 4, 16, "c", "e", "d")
  isoLine(c, P, [2, D - 2, 0], [W - 2, D - 2, 0], "D", 1)
  isoLine(c, P, [2, D - 2, 16], [W - 2, D - 2, 16], "D", 1)
  isoLine(c, P, [W - 2, 2, 0], [W - 2, D - 2, 0], "D", 1)
  isoLine(c, P, [W - 2, 2, 16], [W - 2, D - 2, 16], "D", 1)
  isoLine(c, P, [2, D - 2, 0], [2, D - 2, 16], "D", 1)
  isoLine(c, P, [W - 2, D - 2, 0], [W - 2, D - 2, 16], "D", 1)
  isoLine(c, P, [W - 2, 2, 0], [W - 2, 2, 16], "D", 1)
  
  // 2. Door with Antler Plaque
  isoDoorSW(c, P, D - 2, 16, 0, 8, 12)
  isoPx(c, P, [20, D - 2, 13], "G") // white antler
  isoPx(c, P, [19, D - 2, 14], "G")
  isoPx(c, P, [21, D - 2, 14], "G")
  
  // 3. Thick Golden Straw Thatch Roof with moss
  isoGableRoof(c, P, 0, 0, W, D, 15, 27, "y", "w", "z", "e")
  isoPx(c, P, [10, 16, 26], "E")
  isoPx(c, P, [18, 16, 26], "F")
  
  // 4. Raised Seedling Nursery Planting Bed (Front Right)
  isoBox(c, P, 2, D, 0, 12, 5, 3, "h", "i", "g") // dark loam soil
  for (let sx = 4; sx <= 12; sx += 3) {
    isoPx(c, P, [sx, D + 2, 4], "F") // green sprout
    isoPx(c, P, [sx, D + 2, 5], "F")
  }
  
  // 5. Spade leaning on doorframe
  isoLine(c, P, [14, D, 0], [14, D - 2, 8], "j", 1)
  isoBox(c, P, 13, D, 0, 2, 1, 3, "5", "4", "2")
})

sprite("b_iso_forester_scaffold", { w: 64, h: 58, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 26
  const P = makeISO(64, 58, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 5. STONE QUARRY (b_iso_quarry: 64x56, 2x2 footprint)
// =========================================================================
sprite("b_iso_quarry", { w: 64, h: 56, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 24
  const P = makeISO(64, 56, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Stonemason's Rugged Granite Workshop Shed (Rear)
  isoBox(c, P, 2, 2, 0, 16, D - 4, 14, "n", "o", "m")
  isoGableRoof(c, P, 0, 0, 18, D, 13, 23, "4", "3", "5", "o")
  
  // 2. Open Stone Cutting Yard & Bench
  isoBox(c, P, 6, D - 4, 0, 10, 4, 6, "p", "o", "m")
  isoLine(c, P, [8, D - 2, 7], [12, D - 2, 7], "5", 1) // iron chisel
  
  // 3. Stacks of Dressed Granite Ashlar Blocks (Front Right)
  isoBox(c, P, 18, 14, 0, 10, 10, 5, "p", "o", "m")
  isoBox(c, P, 20, 16, 5, 8, 8, 4, "p", "o", "m")
  
  // 4. Heavy Wooden A-Frame Crane Hoist
  isoLine(c, P, [16, D - 2, 0], [22, D - 2, 20], "h", 2)
  isoLine(c, P, [28, D - 8, 0], [22, D - 2, 20], "i", 2)
  isoLine(c, P, [22, D - 2, 20], [30, D - 2, 23], "j", 2) // crane jib
  // Pulley & rope with iron lifting tongs
  isoLine(c, P, [30, D - 2, 23], [30, D - 2, 10], "H", 1)
  isoLine(c, P, [28, D - 2, 10], [32, D - 2, 10], "5", 1) // tongs
  isoLine(c, P, [28, D - 2, 10], [28, D - 2, 7], "5", 1)
  isoLine(c, P, [32, D - 2, 10], [32, D - 2, 7], "5", 1)
})

sprite("b_iso_quarry_scaffold", { w: 64, h: 56, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 24
  const P = makeISO(64, 56, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 6. SAWMILL (b_iso_sawmill: 80x72, 3x2 footprint)
// =========================================================================
sprite("b_iso_sawmill", { w: 80, h: 72, outline: "a" }, (c) => {
  const N = 3, M = 2, H = 32
  const P = makeISO(80, 72, N, M)
  const W = N * 16, D = M * 16 // 48x32
  
  // 1. Heavy Timber Mill Frame (Rear Wall & Support Trusses)
  isoBox(c, P, 2, 2, 0, W - 4, 6, 18, "h", "j", "i")
  
  // Upright Heavy Timber Posts
  const posts = [
    [2, D - 2], [Math.floor(W / 2), D - 2], [W - 2, D - 2],
    [2, 2], [Math.floor(W / 2), 2], [W - 2, 2]
  ]
  for (const [px, py] of posts) {
    isoLine(c, P, [px, py, 0], [px, py, 18], "h", 2)
  }
  // Diagonal Knee Braces
  isoLine(c, P, [2, D - 2, 12], [8, D - 2, 18], "i", 1)
  isoLine(c, P, [W - 2, D - 2, 12], [W - 8, D - 2, 18], "i", 1)
  
  // 2. Shingled Gable Roof
  isoGableRoof(c, P, 0, 0, W, D, 17, 31, "t", "r", "u", "i")
  
  // 3. Central Saw Carriage Bed & Gleaming Steel Circular Saw Blade!
  isoBox(c, P, 14, 10, 0, 20, 10, 6, "j", "j", "h")
  // Tree trunk log on carriage bed
  isoBox(c, P, 10, 12, 6, 16, 6, 5, "h", "j", "g")
  isoPx(c, P, [26, 15, 8], "k") // round cut end of log!
  // STEEL CIRCULAR SAW DISC
  const sp = P(22, 13, 11)
  c.ellipse(Math.round(sp[0]), Math.round(sp[1]), 4, 7, "5")
  c.ellipse(Math.round(sp[0]), Math.round(sp[1]), 2, 4, "4")
  c.px(Math.round(sp[0]), Math.round(sp[1]), "1") // axle arbor
  c.px(Math.round(sp[0]), Math.round(sp[1] - 6), "G") // glint highlight!
  
  // 4. Stacks of Freshly Cut Golden Lumber Boards (Front Right)
  isoBox(c, P, 32, 12, 0, 14, 14, 8, "z", "k", "j")
  // Spacer battens between plank layers
  isoLine(c, P, [32, 26, 3], [46, 26, 3], "h", 1)
  isoLine(c, P, [32, 26, 6], [46, 26, 6], "h", 1)
  
  // Sawdust mounds
  isoPx(c, P, [24, 28, 0], "z")
  isoPx(c, P, [25, 28, 0], "z")
  isoPx(c, P, [24, 29, 0], "y")
})

sprite("b_iso_sawmill_scaffold", { w: 80, h: 72, outline: "a" }, (c) => {
  const N = 3, M = 2, H = 32
  const P = makeISO(80, 72, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 7. FISHERMAN HUT (b_iso_fisher: 64x58, 2x2 footprint)
// =========================================================================
sprite("b_iso_fisher", { w: 64, h: 58, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 26
  const P = makeISO(64, 58, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Wooden Pier Pilings (Standing in water)
  const pilings = [
    [2, D - 2], [14, D - 2], [26, D - 2],
    [2, 14], [14, 14], [26, 14]
  ]
  for (const [px, py] of pilings) {
    isoLine(c, P, [px, py, -4], [px, py, 4], "g", 2)
    // Water ripple ring
    const wp = P(px, py, -4)
    c.px(Math.round(wp[0] - 1), Math.round(wp[1]), "G")
    c.px(Math.round(wp[0] + 1), Math.round(wp[1]), "G")
  }
  
  // 2. Wooden Boardwalk / Pier Deck (z = 4)
  isoBox(c, P, 0, 0, 3, W, D, 2, "k", "j", "h")
  // Plank deck seams
  for (let px = 4; px < W; px += 4) {
    isoLine(c, P, [px, 0, 5], [px, D, 5], "i", 1)
  }
  
  // 3. Cedar Plank Fishing Shack (sitting on deck)
  isoBox(c, P, 2, 2, 5, 18, 18, 12, "h", "j", "i")
  isoGableRoof(c, P, 0, 0, 20, 20, 16, 25, "s", "q", "t", "i")
  // Door with rope handle
  isoDoorSW(c, P, 20, 6, 5, 6, 9)
  
  // 4. Fish Drying Rack (Front Right on dock)
  isoLine(c, P, [22, D - 4, 5], [22, D - 4, 16], "h", 1)
  isoLine(c, P, [30, D - 4, 5], [30, D - 4, 16], "i", 1)
  isoLine(c, P, [22, D - 4, 14], [30, D - 4, 14], "j", 1) // hanging pole
  // Brown hanging fish net
  isoPoly(c, P, [[22, D - 4, 14], [30, D - 4, 14], [30, D - 4, 8], [22, D - 4, 10]], "H")
  // Silver fish hanging to dry
  isoPx(c, P, [24, D - 4, 12], "5")
  isoPx(c, P, [24, D - 4, 11], "5")
  isoPx(c, P, [27, D - 4, 12], "5")
  isoPx(c, P, [27, D - 4, 11], "5")
  
  // 5. Fish Barrel on dock edge
  isoBarrel(c, P, 22, 6, 5)
})

sprite("b_iso_fisher_scaffold", { w: 64, h: 58, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 26
  const P = makeISO(64, 58, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 8. FARM & BARN (b_iso_farm: 96x74, 3x3 footprint)
// =========================================================================
sprite("b_iso_farm", { w: 96, h: 74, outline: "a" }, (c) => {
  const N = 3, M = 3, H = 26
  const P = makeISO(96, 74, N, M)
  const W = N * 16, D = M * 16 // 48x48
  
  // 1. Stone Foundation Plinth
  isoStonePlinth(c, P, 1, 1, 0, W - 2, D - 2, 4)
  
  // 2. Red-Brown Timber Barn Walls (z = 4..18)
  isoBox(c, P, 2, 2, 4, W - 4, D - 4, 14, "s", "t", "r")
  // Vertical plank battens
  for (let x = 6; x < W - 4; x += 4) {
    isoLine(c, P, [x, D - 2, 4], [x, D - 2, 18], "s", 1)
  }
  for (let y = 6; y < D - 4; y += 4) {
    isoLine(c, P, [W - 2, y, 4], [W - 2, y, 18], "q", 1)
  }
  
  // 3. Double Barn Doors with X-Braces
  isoBox(c, P, 18, D - 2, 4, 14, 0, 12, null, "g", null)
  isoLine(c, P, [18, D - 2, 4], [25, D - 2, 16], "k", 1)
  isoLine(c, P, [18, D - 2, 16], [25, D - 2, 4], "k", 1)
  isoLine(c, P, [25, D - 2, 4], [32, D - 2, 16], "k", 1)
  isoLine(c, P, [25, D - 2, 16], [32, D - 2, 4], "k", 1)
  
  // 4. Gambrel Clay Tile Roof (z = 17..33)
  isoGableRoof(c, P, 0, 0, W, D, 17, 33, "u", "s", "t", "r")
  
  // 5. Open Upper Hayloft Door & Golden Hay Spill!
  isoBox(c, P, 20, D - 2, 20, 8, 0, 8, null, "g", null)
  // Golden straw spilling out onto sill
  isoBox(c, P, 19, D - 2, 19, 10, 3, 3, "z", "y", "x")
  // Hoist boom beam with rope & pulley above hayloft
  isoLine(c, P, [24, D - 2, 28], [24, D + 3, 28], "k", 2)
  isoLine(c, P, [24, D + 3, 28], [24, D + 3, 20], "H", 1)
  
  // 6. Rooster Weather Vane on roof apex
  isoLine(c, P, [24, 24, 33], [24, 24, 39], "5", 1)
  isoPx(c, P, [25, 24, 38], "B") // rooster comb
  isoPx(c, P, [23, 24, 38], "z") // rooster tail
  
  // 7. Props: Cartwheel & Sacks of Grain
  // Wagon wheel leaning against wall
  const wp = P(36, D - 1, 5)
  c.ring(Math.round(wp[0]), Math.round(wp[1]), 4, "h")
  c.px(Math.round(wp[0]), Math.round(wp[1]), "k")
  // Sacks of grain
  isoSacks(c, P, 8, D, 0)
})

sprite("b_iso_farm_scaffold", { w: 96, h: 74, outline: "a" }, (c) => {
  const N = 3, M = 3, H = 26
  const P = makeISO(96, 74, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})
