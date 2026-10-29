// ISOMETRIC BUILDINGS B - 3D Isometric Engine (The Settlers II Standard)
// Modeled directly on the proven Last Fortress 3D isometric architecture (ISO(x,y,z))
// Buildings: b_iso_mill (80x88), b_iso_bakery (64x62), b_iso_mine (64x60), b_iso_smelter (64x66),
// b_iso_smith (80x72), b_iso_tower (64x88), b_iso_market (80x70), b_iso_monument (112x120)
// Plus authentic under-construction scaffolds for all 8 buildings.

include("_iso_lib.px.js")

// =========================================================================
// 9. WINDMILL (b_iso_mill: 80x88, 2x3 footprint)
// =========================================================================
sprite("b_iso_mill", { w: 80, h: 88, outline: "a" }, (c) => {
  const N = 2, M = 3, H = 48
  const P = makeISO(80, 88, N, M)
  const W = N * 16, D = M * 16 // 32x48
  
  // 1. Tapering Stone Masonry Mill Tower Body (z = 0..38)
  // Base octagonal stone footprint
  isoStonePlinth(c, P, 2, 8, 0, 28, 32, 4)
  isoBox(c, P, 3, 9, 4, 26, 30, 20, "n", "o", "m")
  isoBox(c, P, 5, 11, 24, 22, 26, 14, "n", "o", "m")
  
  // Ashlar course lines
  for (let z = 8; z <= 36; z += 4) {
    isoLine(c, P, [3, 39, z], [29, 39, z], "l", 1)
    isoLine(c, P, [29, 9, z], [29, 39, z], "l", 1)
  }
  
  // 2. Arched Wooden Mill Doorway & Flour Sacks
  isoDoorSW(c, P, 39, 11, 4, 8, 12)
  isoSacks(c, P, 2, 40, 0)
  isoSacks(c, P, 22, 40, 0)
  
  // 3. Small Windows on tower shaft
  isoBox(c, P, 29, 20, 16, 0, 4, 6, null, null, "8")
  isoLine(c, P, [29, 22, 16], [29, 22, 22], "6", 1)
  
  // 4. Rotating Wooden Cap Housing (z = 38..48)
  isoBox(c, P, 7, 13, 38, 18, 22, 10, "h", "j", "i")
  // Conical thatched / shingle cap roof
  isoConicalRoof(c, P, 16, 24, 12, 48, 62, "u", "s", "k")
  
  // 5. Central Hub Axle for Windmill Sails
  const hp = P(16, 36, 43)
  c.circ(Math.round(hp[0]), Math.round(hp[1]), 3.5, "g")
  c.circ(Math.round(hp[0]), Math.round(hp[1]), 2, "2")
  c.px(Math.round(hp[0]), Math.round(hp[1]), "5")
})

sprite("b_iso_mill_scaffold", { w: 80, h: 88, outline: "a" }, (c) => {
  const N = 2, M = 3, H = 48
  const P = makeISO(80, 88, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
  isoBox(c, P, 4, 10, 4, 24, 28, 16, "n", "o", "m")
})


// =========================================================================
// 10. BAKERY (b_iso_bakery: 64x62, 2x2 footprint)
// =========================================================================
sprite("b_iso_bakery", { w: 64, h: 62, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 30
  const P = makeISO(64, 62, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Cobblestone Plinth
  isoStonePlinth(c, P, 1, 1, 0, W - 2, D - 2, 4)
  
  // 2. Half-timbered Bakery Walls (z = 4..18)
  isoFachwerkSW(c, P, D - 2, 2, W - 2, 4, 18, true)
  isoFachwerkSE(c, P, W - 2, 2, D - 2, 4, 18, true)
  
  // 3. Door & Window
  isoDoorSW(c, P, D - 2, 4, 4, 8, 12)
  isoWindowSE(c, P, W - 2, 10, 8, 8, 7, true)
  
  // 4. Clay Tile Gable Roof
  isoGableRoof(c, P, 0, 0, W, D, 17, 31, "t", "r", "u", "e")
  
  // 5. Outdoor Brick Bread Oven with Glowing Fire Hearth (Front Left)
  isoBox(c, P, 16, D - 2, 0, 14, 10, 8, "s", "t", "r")
  // Domed brick top
  const op = P(23, D + 3, 8)
  c.ellipse(Math.round(op[0]), Math.round(op[1]), 6, 3, "s")
  // Arched oven mouth glowing red/yellow
  isoBox(c, P, 19, D + 8, 2, 8, 0, 5, null, "7", null)
  isoPx(c, P, [23, D + 8, 4], "9") // intense coal glow!
  // Brick chimney puffing smoke
  isoChimney(c, P, 25, D - 2, 8, 4, 4, 8, true)
  
  // 6. Baker's Wooden Peel (paddle)
  isoLine(c, P, [16, D + 4, 0], [16, D + 4, 10], "k", 1)
  isoBox(c, P, 15, D + 4, 10, 3, 0, 4, null, "j", null)
  
  // 7. Wicker Baskets of Fresh Golden Bread (Front Right)
  const bp = P(W, 14, 0)
  c.ellipse(Math.round(bp[0]), Math.round(bp[1]), 4, 3, "I")
  c.px(Math.round(bp[0]), Math.round(bp[1] - 1), "8") // golden loaf
  c.px(Math.round(bp[0] + 1), Math.round(bp[1] - 1), "k")
})

sprite("b_iso_bakery_scaffold", { w: 64, h: 62, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 30
  const P = makeISO(64, 62, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 11. MINE (b_iso_mine: 64x60, 2x2 footprint)
// =========================================================================
sprite("b_iso_mine", { w: 64, h: 60, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 28
  const P = makeISO(64, 60, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Rocky Mountain Hillside Face behind portal
  isoBox(c, P, 2, 2, 0, W - 4, D - 4, 24, "m", "n", "o")
  // Fractured rock planes
  isoLine(c, P, [2, D - 2, 24], [W - 2, D - 2, 24], "p", 1)
  isoLine(c, P, [W - 2, 2, 24], [W - 2, D - 2, 24], "p", 1)
  isoLine(c, P, [2, D - 2, 12], [W - 2, D - 2, 12], "l", 1)
  
  // 2. Dark Mine Tunnel Mouth (Pitch Black Interior)
  isoBox(c, P, 8, D - 2, 0, 16, 0, 16, null, "1", null)
  
  // 3. Heavy Notched Timber Shoring Portal Frame
  // Left post
  isoLine(c, P, [8, D - 2, 0], [8, D - 2, 18], "h", 2)
  // Right post
  isoLine(c, P, [24, D - 2, 0], [24, D - 2, 18], "i", 2)
  // Heavy Lintel Beam across top
  isoBox(c, P, 6, D - 2, 17, 20, 2, 3, "k", "j", "h")
  // Corner diagonal knee-braces
  isoLine(c, P, [8, D - 2, 12], [12, D - 2, 17], "i", 2)
  isoLine(c, P, [24, D - 2, 12], [20, D - 2, 17], "j", 2)
  // Iron reinforcing bolt plates
  isoPx(c, P, [8, D - 2, 18], "5")
  isoPx(c, P, [24, D - 2, 18], "5")
  
  // 4. Narrow-Gauge Wooden Minecart Rail Tracks
  isoLine(c, P, [12, D - 10, 0], [12, D + 4, 0], "h", 1)
  isoLine(c, P, [20, D - 10, 0], [20, D + 4, 0], "i", 1)
  // Wooden sleepers
  isoLine(c, P, [10, D - 6, 0], [22, D - 6, 0], "g", 1)
  isoLine(c, P, [10, D - 1, 0], [22, D - 1, 0], "g", 1)
  isoLine(c, P, [10, D + 3, 0], [22, D + 3, 0], "g", 1)
  
  // 5. Wooden Ore Minecart on Rails loaded with Iron Ore & Coal
  isoBox(c, P, 11, D - 6, 2, 10, 8, 6, "2", "j", "h")
  // Iron corner bands
  isoLine(c, P, [11, D + 2, 2], [21, D + 2, 2], "2", 1)
  isoLine(c, P, [11, D + 2, 8], [21, D + 2, 8], "2", 1)
  // Iron wheels
  isoPx(c, P, [12, D + 2, 1], "5")
  isoPx(c, P, [19, D + 2, 1], "5")
  // Raw Iron Ore & Coal chunks
  isoBox(c, P, 12, D - 5, 8, 8, 6, 2, "2", "3", "1") // coal
  isoPx(c, P, [14, D - 2, 10], "5") // shiny silver iron ore!
  isoPx(c, P, [17, D - 3, 10], "p")
  isoPx(c, P, [15, D - 4, 10], "5")
  
  // 6. Mine Lantern hanging from lintel
  isoLine(c, P, [10, D - 2, 17], [10, D - 2, 13], "5", 1)
  isoPx(c, P, [10, D - 2, 12], "8")
  isoPx(c, P, [10, D - 2, 11], "7")
  
  // 7. Pickaxe leaning on wall
  isoLine(c, P, [26, D - 2, 0], [29, D - 2, 10], "j", 1)
  isoBox(c, P, 28, D - 2, 10, 3, 1, 2, "5", "4", "2")
})

sprite("b_iso_mine_scaffold", { w: 64, h: 60, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 28
  const P = makeISO(64, 60, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 12. SMELTER (b_iso_smelter: 64x66, 2x2 footprint)
// =========================================================================
sprite("b_iso_smelter", { w: 64, h: 66, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 34
  const P = makeISO(64, 66, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Industrial Stone & Firebrick Furnace Body (z = 0..20)
  isoStonePlinth(c, P, 2, 2, 0, W - 4, D - 4, 6)
  isoBox(c, P, 4, 4, 6, W - 8, D - 8, 14, "n", "o", "m")
  
  // 2. High Square Blast Furnace Chimney Stack (z = 20..38)
  isoBox(c, P, 8, 8, 20, 10, 10, 18, "p", "o", "m")
  // Thick billowing smoke puff
  const smp = P(13, 13, 40)
  c.circ(Math.round(smp[0]), Math.round(smp[1]), 3.5, "n")
  c.circ(Math.round(smp[0] - 1), Math.round(smp[1] - 2), 2.5, "o")
  c.px(Math.round(smp[0] - 2), Math.round(smp[1] - 3), "G")
  
  // 3. Arched Blast Hearth with Intense Molten Yellow/Orange Glow!
  isoBox(c, P, 18, D - 4, 4, 10, 0, 10, null, "l", null)
  // Glowing firebox
  isoBox(c, P, 19, D - 4, 5, 8, 0, 8, null, "7", null)
  isoBox(c, P, 20, D - 4, 6, 6, 0, 6, null, "8", null)
  isoPx(c, P, [23, D - 4, 8], "9") // white-hot molten core!
  // Tapping trough running molten iron down into sand molds
  isoLine(c, P, [23, D - 4, 4], [23, D + 3, 0], "8", 2)
  isoPx(c, P, [23, D + 2, 0], "9")
  
  // 4. Raw Material Piles: Coal (Black) and Iron Ore (Rust)
  // Coal pile (Front Left)
  isoBox(c, P, 2, D - 2, 0, 8, 6, 4, "1", "2", "1")
  isoPx(c, P, [5, D + 1, 4], "3")
  // Raw Iron Ore pile
  isoBox(c, P, 10, D - 2, 0, 6, 5, 3, "s", "t", "r")
  
  // 5. Stack of Finished Cast Iron Ingots
  isoBox(c, P, W - 4, 14, 0, 6, 8, 4, "5", "4", "3")
  isoLine(c, P, [W - 4, 18, 2], [W + 2, 18, 2], "2", 1)
})

sprite("b_iso_smelter_scaffold", { w: 64, h: 66, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 34
  const P = makeISO(64, 66, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 13. SMITHY / FORGE (b_iso_smith: 80x72, 3x2 footprint)
// =========================================================================
sprite("b_iso_smith", { w: 80, h: 72, outline: "a" }, (c) => {
  const N = 3, M = 2, H = 32
  const P = makeISO(80, 72, N, M)
  const W = N * 16, D = M * 16 // 48x32
  
  // 1. Open-Sided Stone Forge Structure
  isoBox(c, P, 2, 2, 0, W - 4, 6, 18, "n", "o", "m")
  isoBox(c, P, 2, 2, 0, 6, D - 4, 18, "n", "o", "m")
  
  // Heavy timber corner posts
  const posts = [
    [2, D - 2], [Math.floor(W / 2), D - 2], [W - 2, D - 2],
    [W - 2, 2]
  ]
  for (const [px, py] of posts) {
    isoLine(c, P, [px, py, 0], [px, py, 18], "h", 2)
  }
  
  // 2. Slate Tile Roof with Stone Forge Chimney
  isoGableRoof(c, P, 0, 0, W, D, 17, 31, "4", "3", "5", "m")
  isoChimney(c, P, 6, 6, 22, 5, 5, 8, true)
  
  // 3. Glowing Forge Hearth with Charcoal Bed & Hood
  isoBox(c, P, 6, 12, 0, 10, 10, 6, "m", "n", "l")
  // Glowing fire
  isoBox(c, P, 8, 14, 6, 6, 6, 1, "8", "7", "7")
  isoPx(c, P, [11, 17, 7], "9")
  
  // 4. Steel Anvil mounted on Massive Tree Stump (Center Stage)
  isoAnvil(c, P, 22, 18, 0)
  
  // 5. Wooden Water Quench Trough with Rising Steam
  isoBox(c, P, 32, 18, 0, 10, 6, 5, "3", "j", "h")
  const stp = P(37, 21, 6)
  c.px(Math.round(stp[0]), Math.round(stp[1]), "G") // rising steam wisp!
  
  // 6. Workbench with Sledgehammer & Tongs
  isoBox(c, P, 32, 6, 0, 12, 6, 7, "j", "j", "h")
  isoLine(c, P, [34, 10, 7], [40, 10, 7], "5", 1) // hammer haft
  isoBox(c, P, 33, 9, 7, 2, 2, 2, "2", "2", "1")   // hammer head
})

sprite("b_iso_smith_scaffold", { w: 80, h: 72, outline: "a" }, (c) => {
  const N = 3, M = 2, H = 32
  const P = makeISO(80, 72, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 14. WATCHTOWER (b_iso_tower: 64x88, 2x2 footprint)
// =========================================================================
sprite("b_iso_tower", { w: 64, h: 88, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 56
  const P = makeISO(64, 88, N, M)
  const W = N * 16, D = M * 16
  
  // 1. Stone Lower Tower Body (z = 0..32)
  isoStonePlinth(c, P, 2, 2, 0, W - 4, D - 4, 6)
  isoBox(c, P, 4, 4, 6, W - 8, D - 8, 26, "n", "o", "m")
  // Stone ashlar courses
  for (let z = 10; z <= 32; z += 4) {
    isoLine(c, P, [4, D - 4, z], [W - 4, D - 4, z], "l", 1)
    isoLine(c, P, [W - 4, 4, z], [W - 4, D - 4, z], "l", 1)
  }
  // Narrow vertical arrow slits
  isoLine(c, P, [16, D - 4, 16], [16, D - 4, 24], "l", 2)
  isoLine(c, P, [W - 4, 16, 16], [W - 4, 16, 24], "l", 2)
  
  // 2. Overhanging Timber Guard Gallery on Heavy Corbels (z = 32..44)
  // Timber corbel brackets
  for (let bx = 2; bx <= W - 2; bx += 6) {
    isoLine(c, P, [bx, D - 4, 30], [bx, D - 2, 34], "h", 2)
  }
  for (let by = 2; by <= D - 2; by += 6) {
    isoLine(c, P, [W - 4, by, 30], [W - 2, by, 34], "h", 2)
  }
  // Gallery body
  isoBox(c, P, 1, 1, 32, W - 2, D - 2, 12, "h", "j", "i")
  // Lookout window openings
  isoBox(c, P, 6, D - 1, 35, 6, 0, 5, null, "a", null)
  isoPx(c, P, [9, D - 1, 37], "8") // lantern light inside!
  isoBox(c, P, W - 1, 6, 35, 0, 6, 5, null, null, "a")
  
  // 3. Steep Conical Slate Tile Roof (z = 44..62)
  isoConicalRoof(c, P, 16, 16, 16, 44, 62, "4", "3", "5")
  
  // 4. Tall Wooden Flagpole & Royal Crimson Pennant
  isoLine(c, P, [16, 16, 62], [16, 16, 76], "5", 1)
  const fp1 = P(16, 16, 75), fp2 = P(16, 16, 68)
  c.poly([fp1[0], fp1[1], fp1[0] + 12, fp1[1] + 2, fp1[0] + 7, fp1[1] + 5, fp2[0], fp2[1]], "A")
  c.line(fp1[0], fp1[1], fp1[0] + 12, fp1[1] + 2, "B", 1)
  
  // 5. Watchman's Lantern hanging from gallery
  isoLine(c, P, [W - 1, 24, 34], [W - 1, 24, 28], "1", 1)
  isoPx(c, P, [W - 1, 24, 27], "8")
  isoPx(c, P, [W - 1, 24, 26], "7")
})

sprite("b_iso_tower_scaffold", { w: 64, h: 88, outline: "a" }, (c) => {
  const N = 2, M = 2, H = 56
  const P = makeISO(64, 88, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 15. MARKET (b_iso_market: 80x70, 3x2 footprint)
// =========================================================================
sprite("b_iso_market", { w: 80, h: 70, outline: "a" }, (c) => {
  const N = 3, M = 2, H = 30
  const P = makeISO(80, 70, N, M)
  const W = N * 16, D = M * 16 // 48x32
  
  // 1. Cobblestone Paved Market Square Floor (z = 0..2)
  isoStonePlinth(c, P, 0, 0, 0, W, D, 2)
  
  // 2. STALL 1 (Left): Red & White Striped Canvas Awning
  // Wooden support posts
  isoLine(c, P, [4, 18, 2], [4, 18, 18], "h", 2)
  isoLine(c, P, [22, 18, 2], [22, 18, 18], "i", 2)
  isoLine(c, P, [4, 4, 2], [4, 4, 22], "h", 2)
  isoLine(c, P, [22, 4, 2], [22, 4, 22], "i", 2)
  // Striped Awning Canopy
  isoPoly(c, P, [[4, 4, 22], [22, 4, 22], [22, 18, 18], [4, 18, 18]], "B")
  // White stripes
  isoPoly(c, P, [[8, 4, 22], [12, 4, 22], [12, 18, 18], [8, 18, 18]], "G")
  isoPoly(c, P, [[16, 4, 22], [20, 4, 22], [20, 18, 18], [16, 18, 18]], "G")
  
  // Counter & Goods (Stall 1)
  isoBox(c, P, 4, 14, 2, 18, 4, 6, "j", "j", "h")
  // Apples & Cheese
  isoPx(c, P, [8, 16, 8], "B")
  isoPx(c, P, [10, 16, 8], "B")
  const cp = P(16, 16, 8)
  c.ellipse(Math.round(cp[0]), Math.round(cp[1]), 3, 2, "8") // cheese wheel
  
  // 3. STALL 2 (Right): Royal Blue & White Striped Canvas Awning
  isoLine(c, P, [26, 18, 2], [26, 18, 18], "h", 2)
  isoLine(c, P, [44, 18, 2], [44, 18, 18], "j", 2)
  isoLine(c, P, [26, 4, 2], [26, 4, 22], "h", 2)
  isoLine(c, P, [44, 4, 2], [44, 4, 22], "j", 2)
  isoPoly(c, P, [[26, 4, 22], [44, 4, 22], [44, 18, 18], [26, 18, 18]], "D")
  // White stripes
  isoPoly(c, P, [[30, 4, 22], [34, 4, 22], [34, 18, 18], [30, 18, 18]], "G")
  isoPoly(c, P, [[38, 4, 22], [42, 4, 22], [42, 18, 18], [38, 18, 18]], "G")
  
  // Counter & Goods (Stall 2)
  isoBox(c, P, 26, 14, 2, 18, 4, 6, "j", "j", "h")
  isoLine(c, P, [30, 16, 8], [34, 16, 8], "5", 1) // fresh fish
  isoPx(c, P, [38, 16, 8], "8") // bread
  isoPx(c, P, [41, 16, 8], "8")
  
  // 4. Trade Crates, Sacks & Barrels in Foreground
  isoCrate(c, P, 8, D - 6, 2, 6)
  isoSacks(c, P, 18, D - 4, 2)
  isoBarrel(c, P, 30, D - 6, 2)
})

sprite("b_iso_market_scaffold", { w: 80, h: 70, outline: "a" }, (c) => {
  const N = 3, M = 2, H = 30
  const P = makeISO(80, 70, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
})


// =========================================================================
// 16. GREAT HALL / CATHEDRAL WONDER (b_iso_monument: 112x120, 4x3 footprint)
// =========================================================================
sprite("b_iso_monument", { w: 112, h: 120, outline: "a" }, (c) => {
  const N = 4, M = 3, H = 64
  const P = makeISO(112, 120, N, M)
  const W = N * 16, D = M * 16 // 64x48
  
  // 1. Granite Cathedral Nave & Transept Walls (z = 0..38)
  isoStonePlinth(c, P, 2, 2, 0, W - 4, D - 4, 6)
  isoBox(c, P, 4, 4, 6, W - 8, D - 8, 32, "n", "o", "m")
  // Stone ashlar courses
  for (let z = 10; z <= 38; z += 4) {
    isoLine(c, P, [4, D - 4, z], [W - 4, D - 4, z], "l", 1)
    isoLine(c, P, [W - 4, 4, z], [W - 4, D - 4, z], "l", 1)
  }
  
  // 2. Flying Buttresses on SE Flank
  const buttressY = [12, 24, 36]
  for (const by of buttressY) {
    isoBox(c, P, W - 2, by, 0, 4, 4, 26, "p", "o", "m")
    // Flying arch spanning down to pier
    isoLine(c, P, [W - 6, by + 2, 32], [W - 2, by + 2, 26], "o", 2)
    // Pinnacle atop pier
    isoPoly(c, P, [[W, by + 2, 30], [W - 2, by, 26], [W + 2, by + 4, 26]], "p")
  }
  
  // 3. Grand Arched Stone Portal (Main Facade on SW face)
  isoDoorSW(c, P, D - 4, 24, 6, 16, 20)
  // Concentric Carved Stone Arch
  const ap = P(32, D - 4, 27)
  c.circ(Math.round(ap[0]), Math.round(ap[1]), 8, "p")
  c.circ(Math.round(ap[0]), Math.round(ap[1]), 6, "m")
  
  // 4. Stained Glass Rose Window (Circular Window above portal)
  const rp = P(32, D - 4, 38)
  c.circ(Math.round(rp[0]), Math.round(rp[1]), 8, "l")
  c.circ(Math.round(rp[0]), Math.round(rp[1]), 7, "D") // blue stained glass
  c.circ(Math.round(rp[0]), Math.round(rp[1]), 5, "A") // red stained glass
  c.circ(Math.round(rp[0]), Math.round(rp[1]), 2, "8") // golden center
  c.px(Math.round(rp[0]), Math.round(rp[1]), "9")
  
  // 5. Tall Arched Lancet Windows on SE flank
  isoBox(c, P, W - 4, 16, 16, 0, 4, 12, null, null, "D")
  isoPx(c, P, [W - 4, 18, 22], "8")
  isoBox(c, P, W - 4, 28, 16, 0, 4, 12, null, null, "D")
  isoPx(c, P, [W - 4, 30, 22], "8")
  
  // 6. High Vaulted Deep Slate Roof with Golden Fleur-de-lis Ridge
  isoGableRoof(c, P, 0, 0, W, D, 37, 54, "4", "3", "5", "o")
  // Golden Ridge Cresting
  for (let rx = 4; rx < W - 4; rx += 6) {
    isoPx(c, P, [rx, 24, 55], "8")
    isoPx(c, P, [rx, 24, 56], "9")
  }
  
  // 7. Towering Bell Belfry Spire (Rising high above crossing)
  isoBox(c, P, 24, 16, 50, 16, 16, 18, "n", "o", "m")
  // Belfry louvres
  isoBox(c, P, 28, 32, 54, 8, 0, 8, null, "l", null)
  isoPx(c, P, [32, 32, 58], "8") // bronze bell highlight!
  // Soaring Octagonal Slate Spire
  isoConicalRoof(c, P, 32, 24, 10, 68, 92, "4", "3", "5")
  // Gilded Imperial Cross atop spire
  isoLine(c, P, [32, 24, 92], [32, 24, 100], "8", 1)
  isoLine(c, P, [30, 24, 97], [34, 24, 97], "8", 1)
  isoPx(c, P, [32, 24, 100], "9")
})

sprite("b_iso_monument_scaffold", { w: 112, h: 120, outline: "a" }, (c) => {
  const N = 4, M = 3, H = 64
  const P = makeISO(112, 120, N, M)
  const W = N * 16, D = M * 16
  drawScaffold3D(c, P, W, D, H)
  isoBox(c, P, 4, 4, 6, W - 8, D - 8, 22, "n", "o", "m")
})
