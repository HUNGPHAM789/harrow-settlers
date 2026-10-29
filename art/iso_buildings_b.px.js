// ISOMETRIC BUILDINGS B - Authentic Settlers II Medieval Pixel Art
// Buildings: b_iso_mill (80x88), b_iso_bakery (64x62), b_iso_mine (64x60), b_iso_smelter (64x66),
// b_iso_smith (80x72), b_iso_tower (64x88), b_iso_market (80x70), b_iso_monument (112x120)
// Plus authentic under-construction scaffolds for all 8 buildings.

pal({
  // Outline & Deep Shadows
  a: "#16111e", // deep ink outline
  b: "#251c2d", // deep shadow
  
  // Plaster & Mortar (Warm Cream)
  c: "#786d58", // shadow plaster
  d: "#a89b80", // mid plaster
  e: "#d6cca8", // lit warm plaster
  f: "#f5edd2", // bright cream plaster
  
  // Oak Timber Framing & Planks
  g: "#24130a", // deep timber shadow
  h: "#45220f", // dark oak timber
  i: "#6c3818", // mid oak timber
  j: "#944f22", // lit oak timber
  k: "#be6d34", // bright oak edge / pine plank
  
  // Granite & Stone Masonry
  l: "#20232d", // stone deep mortar
  m: "#383c4c", // dark stone block
  n: "#585d73", // mid stone block
  o: "#7d85a0", // lit stone face
  p: "#a7b0cd", // bright stone edge / quoin
  
  // Terracotta & Brick
  q: "#3d130e", // brick shadow
  r: "#6b1f15", // dark tile / brick
  s: "#993020", // mid tile / brick
  t: "#c74930", // lit tile / brick
  u: "#ea6e4b", // bright ridge / firebrick
  
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
  
  // Accents (Canvas, Sails, Banners, Trade Goods)
  A: "#a31d24", // royal banner crimson
  B: "#d63638", // bright red awning / banner
  C: "#f26d6d", // red highlight
  D: "#1e3f66", // royal blue awning
  E: "#3870b2", // blue mid
  F: "#6ba5e7", // blue highlight
  G: "#ffffff", // white canvas / steam / sail cloth
  H: "#d1c4b2", // sack canvas / rope
  I: "#9e866b", // sack shadow / basket
  J: "#467d36"  // green wreath / hops
})

ramps("ab", "cdef", "ghijk", "lmnop", "qrstu", "12345", "6789", "ABC", "DEF", "HGI")

// Scaffold helper for group B
function drawScaffold(c, w, h) {
  const cx = Math.floor(w / 2), cy = h - 4
  c.poly([cx, cy, 8, cy - Math.floor(cx * 0.45), cx, cy - Math.floor(cx * 0.8), w - 8, cy - Math.floor(cx * 0.45)], "m")
  c.poly([cx, cy, 8, cy - Math.floor(cx * 0.45), 8, cy - Math.floor(cx * 0.45) - 6, cx, cy - 6], "l")
  c.poly([cx, cy, w - 8, cy - Math.floor(cx * 0.45), w - 8, cy - Math.floor(cx * 0.45) - 6, cx, cy - 6], "m")
  
  const poles = [14, Math.floor(w * 0.35), cx, Math.floor(w * 0.65), w - 14]
  for (const px of poles) {
    const pyBase = cy - Math.floor(Math.abs(px - cx) * 0.45)
    c.line(px, pyBase, px, 12, "h", 1)
    c.px(px, 11, "k")
  }
  const yDecks = [cy - 16, cy - 30, cy - 44]
  for (const yd of yDecks) {
    if (yd > 16) {
      c.line(12, yd + 6, w - 12, yd - 6, "j", 1)
      c.line(10, yd + 7, w - 10, yd - 5, "i", 1)
      c.rect(cx - 10, yd - 2, 20, 2, "k")
    }
  }
  c.line(14, cy - 10, Math.floor(w * 0.35), cy - 30, "i", 1)
  c.line(Math.floor(w * 0.35), cy - 10, 14, cy - 30, "i", 1)
  c.line(cx, cy - 15, Math.floor(w * 0.65), cy - 35, "i", 1)
  c.line(Math.floor(w * 0.65), cy - 15, cx, cy - 35, "i", 1)
  
  c.line(cx - 8, cy, cx - 4, cy - 26, "h", 1)
  c.line(cx - 3, cy, cx + 1, cy - 26, "h", 1)
  for (let ly = cy - 3; ly > cy - 24; ly -= 4) {
    c.hline(cx - 7 + Math.floor((cy - ly) * 0.16), ly, 4, "k")
  }
  c.line(cx + 8, 12, cx + 18, 16, "j", 1)
  c.line(cx + 18, 16, cx + 18, cy - 20, "H", 1)
  c.rect(cx + 15, cy - 20, 7, 6, "j")
  c.box(cx + 15, cy - 20, 7, 6, "h")
}


// =========================================================================
// 9. WINDMILL (b_iso_mill: 80x88, 2x3 footprint)
// =========================================================================
sprite("b_iso_mill", { w: 80, h: 88, outline: "a" }, (c) => {
  // Dutch/German Windmill with round tapering stone tower, wooden cap and flour sacks!
  // Footprint 2x3. Base center bottom: (40, 86).
  
  // 1. Tapering Stone Masonry Mill Tower Base
  // Octagonal base tapering from 44px wide at bottom to 26px wide at cap
  c.poly([40, 84, 18, 73, 26, 38, 40, 42], "m") // SW wall (shadow)
  c.poly([40, 84, 62, 73, 54, 38, 40, 42], "o") // SE wall (lit)
  
  // Horizontal stone courses & ashlar mortar lines
  for (let y = 44; y <= 80; y += 6) {
    const wTop = 26 + Math.floor((y - 40) * 0.4)
    c.line(40, y, 40 - Math.floor(wTop / 2), y - 10, "l", 1)
    c.line(40, y, 40 + Math.floor(wTop / 2), y - 10, "n", 1)
    // Mortar tick marks
    c.px(40 - Math.floor(wTop / 4), y - 5, "l")
    c.px(40 + Math.floor(wTop / 4), y - 5, "p")
  }
  
  // 2. Arched Wooden Mill Doorway & Flour Sacks
  c.poly([36, 82, 44, 82, 44, 68, 36, 68], "g")
  c.rect(37, 70, 6, 12, "h")
  c.line(36, 68, 44, 68, "p", 1) // stone door arch
  // Sacks of white milled flour outside door
  c.ellipse(28, 76, 4, 5, "G")
  c.ellipse(28, 76, 3, 4, "H")
  c.px(28, 72, "I") // tied sack neck
  c.ellipse(33, 78, 3, 4, "H")
  c.px(33, 75, "I")
  
  // 3. Small Windows on tower shaft
  c.rect(46, 52, 3, 5, "6")
  c.px(47, 54, "8")
  
  // 4. Rotating Wooden Cap Housing (at top of tower)
  c.poly([40, 42, 24, 34, 24, 24, 40, 28], "h")
  c.poly([40, 42, 56, 34, 56, 24, 40, 28], "j")
  // Conical thatched / shingle cap roof
  c.poly([40, 10, 22, 25, 58, 25], "r")
  c.poly([40, 10, 40, 25, 58, 25], "t")
  c.line(40, 10, 40, 25, "u", 1)
  
  // 5. Central Hub Axle for Windmill Sails
  // Windmill sails are rendered dynamically in renderer.js (_drawWindmillSails),
  // but we draw the heavy central axle boss and anchor hub!
  c.circ(40, 26, 4, "g")
  c.circ(40, 26, 3, "2")
  c.circ(40, 26, 1, "5")
})

sprite("b_iso_mill_scaffold", { w: 80, h: 88, outline: "a" }, (c) => {
  drawScaffold(c, 80, 88)
  c.poly([40, 80, 22, 70, 22, 54, 40, 60], "m")
  c.poly([40, 80, 58, 70, 58, 54, 40, 60], "o")
})


// =========================================================================
// 10. BAKERY (b_iso_bakery: 64x62, 2x2 footprint)
// =========================================================================
sprite("b_iso_bakery", { w: 64, h: 62, outline: "a" }, (c) => {
  // Cozy Village Bakery with outdoor brick dome oven, bread paddle, and fresh bread baskets!
  // Base center: (32, 60).
  
  // 1. Half-timbered Bakery House Walls
  c.poly([32, 59, 2, 44, 2, 26, 32, 41], "d")
  c.poly([32, 59, 62, 44, 62, 26, 32, 41], "e")
  // Dark oak timber framing
  c.line(2, 44, 32, 59, "h", 1)
  c.line(32, 59, 62, 44, "i", 1)
  c.line(2, 26, 32, 41, "h", 1)
  c.line(32, 41, 62, 26, "i", 1)
  c.line(2, 44, 2, 26, "h", 1)
  c.line(32, 59, 32, 41, "h", 1)
  c.line(62, 44, 62, 26, "i", 1)
  c.line(16, 51, 16, 33, "h", 1)
  
  // 2. Door with Stone Step
  c.poly([8, 44, 14, 47, 14, 34, 8, 31], "g")
  c.line(9, 32, 9, 45, "h", 1)
  c.px(13, 40, "5")
  
  // 3. Warm Glowing Leaded Window
  c.poly([44, 48, 52, 44, 52, 36, 44, 40], "6")
  c.poly([45, 47, 51, 44, 51, 37, 45, 40], "8")
  c.px(48, 41, "9")
  c.line(44, 44, 52, 40, "6", 1)
  
  // 4. Clay Tile Gable Roof
  c.poly([32, 13, 0, 27, 32, 43], "r")
  c.poly([32, 13, 64, 27, 32, 43], "t")
  for (let r = 0; r < 7; r++) {
    const yStart = 15 + r * 4
    c.line(32, yStart, 64, yStart + 13 - r * 2, "s", 1)
    c.line(32, yStart, 0, yStart + 13 - r * 2, "q", 1)
  }
  c.line(32, 13, 32, 43, "u", 1)
  
  // 5. Outdoor Brick Bread Oven with glowing fire hearth (Front Left)
  c.poly([16, 56, 28, 62, 28, 52, 16, 46], "r")
  c.poly([28, 62, 36, 58, 36, 48, 28, 52], "t")
  c.ellipse(26, 48, 6, 4, "s") // domed brick oven top
  // Arched Oven Opening glowing with fire!
  c.poly([20, 56, 26, 59, 26, 53, 20, 50], "l")
  c.poly([21, 56, 25, 58, 25, 54, 21, 52], "7") // glowing coal bed
  c.px(23, 55, "9") // yellow flame glint!
  // Oven Chimney puffing smoke
  c.rect(26, 38, 3, 8, "r")
  c.px(27, 36, "G")
  c.px(28, 34, "G")
  
  // 6. Baker's Wooden Peel (paddle) resting by oven
  c.line(32, 57, 35, 46, "k", 1) // handle
  c.poly([34, 47, 37, 45, 39, 47, 36, 49], "j") // flat wooden peel blade
  
  // 7. Wicker Baskets of Fresh Golden Bread (Front Right)
  c.ellipse(40, 56, 4, 3, "I")
  c.px(39, 55, "8") // golden round loaf
  c.px(41, 55, "k")
  c.ellipse(46, 53, 4, 3, "I")
  c.px(45, 52, "8")
  c.px(47, 52, "8")
})

sprite("b_iso_bakery_scaffold", { w: 64, h: 62, outline: "a" }, (c) => {
  drawScaffold(c, 64, 62)
  c.line(8, 44, 32, 56, "h", 2)
  c.line(32, 56, 56, 44, "i", 2)
})


// =========================================================================
// 11. MINE (b_iso_mine: 64x60, 2x2 footprint)
// =========================================================================
sprite("b_iso_mine", { w: 64, h: 60, outline: "a" }, (c) => {
  // Heavy timber mine portal driven into rocky mountain hillside with ore cart & tracks!
  // Base center: (32, 58).
  
  // 1. Rocky Mountain Hillside Face behind the portal
  c.poly([32, 38, 2, 26, 8, 8, 32, 14], "m")
  c.poly([32, 38, 62, 26, 56, 8, 32, 14], "o")
  // Fractured rock planes
  c.line(2, 26, 32, 38, "l", 1)
  c.line(32, 38, 62, 26, "n", 1)
  c.line(8, 8, 32, 14, "p", 1)
  c.line(32, 14, 56, 8, "p", 1)
  
  // 2. Dark Mine Shaft Portal Opening
  c.poly([20, 50, 44, 50, 44, 28, 20, 28], "1")
  c.rect(22, 30, 20, 18, "a") // pitch dark abyss inside mine
  
  // 3. Massive Notched Timber Shoring Portal Frame
  // Heavy Left Timber Post
  c.rect(18, 26, 4, 26, "g")
  c.line(19, 26, 19, 52, "h", 1)
  // Heavy Right Timber Post
  c.rect(42, 26, 4, 26, "h")
  c.line(43, 26, 43, 52, "j", 1)
  // Heavy Horizontal Lintel Beam across top
  c.rect(16, 24, 32, 5, "i")
  c.box(16, 24, 32, 5, "g")
  c.hline(17, 25, 30, "k")
  // Diagonal knee-braces in portal corners
  c.line(22, 34, 27, 29, "g", 2)
  c.line(42, 34, 37, 29, "j", 2)
  // Iron reinforcing brackets with bolts
  c.px(19, 26, "5")
  c.px(43, 26, "5")
  
  // 4. Narrow-Gauge Wooden Minecart Rail Tracks
  c.line(26, 46, 26, 58, "h", 1)
  c.line(36, 46, 36, 58, "i", 1)
  // Wooden cross ties (sleepers)
  c.hline(24, 48, 14, "g")
  c.hline(24, 52, 14, "g")
  c.hline(24, 56, 14, "g")
  
  // 5. Wooden Ore Minecart on the Rails
  c.poly([26, 48, 38, 48, 38, 40, 26, 40], "h")
  c.poly([38, 48, 43, 45, 43, 37, 38, 40], "j")
  // Iron banded corners on cart
  c.box(26, 40, 12, 8, "2")
  // Iron wheels on rails
  c.circ(28, 49, 2, "2")
  c.px(28, 49, "5")
  c.circ(36, 49, 2, "2")
  c.px(36, 49, "5")
  // Sparkling raw Iron Ore chunks & Coal in cart
  c.ellipse(33, 39, 5, 3, "2") // coal
  c.px(31, 38, "5") // shiny silver iron ore glint!
  c.px(34, 38, "p")
  c.px(35, 39, "5")
  
  // 6. Mine Lantern hanging from lintel
  c.line(24, 29, 24, 33, "5", 1)
  c.px(24, 34, "8")
  c.px(24, 35, "7")
  
  // 7. Iron Pickaxe leaning on wall
  c.line(48, 52, 53, 40, "j", 1)
  c.poly([51, 39, 55, 38, 56, 41], "5") // curved pickaxe head
})

sprite("b_iso_mine_scaffold", { w: 64, h: 60, outline: "a" }, (c) => {
  drawScaffold(c, 64, 60)
  c.line(20, 28, 44, 28, "i", 2)
})


// =========================================================================
// 12. SMELTER (b_iso_smelter: 64x66, 2x2 footprint)
// =========================================================================
sprite("b_iso_smelter", { w: 64, h: 66, outline: "a" }, (c) => {
  // Industrial Iron Smelting Blast Furnace with molten hearth glow, chimney & slag piles!
  // Base center: (32, 64).
  
  // 1. Heavy Stone & Firebrick Blast Furnace Body
  c.poly([32, 62, 4, 48, 4, 28, 32, 42], "m")
  c.poly([32, 62, 60, 48, 60, 28, 32, 42], "n")
  // Heavy stone masonry courses
  for (let y = 34; y <= 58; y += 6) {
    c.line(4, y - 14, 32, y, "l", 1)
    c.line(32, y, 60, y - 14, "m", 1)
  }
  
  // 2. High Square Blast Furnace Chimney Stack
  c.poly([24, 40, 14, 35, 14, 10, 24, 15], "m")
  c.poly([24, 40, 34, 35, 34, 10, 24, 15], "o")
  c.poly([24, 15, 14, 10, 24, 5, 34, 10], "p") // chimney rim
  c.line(24, 5, 24, 40, "p", 1)
  // Billowing thick smoke puff from chimney
  c.circ(24, 3, 3, "n")
  c.circ(23, 1, 2, "o")
  c.px(22, 0, "G")
  
  // 3. Arched Blast Hearth with Intense Molten Yellow/Orange Glow!
  c.poly([36, 60, 48, 54, 48, 40, 36, 46], "l")
  c.poly([38, 58, 46, 54, 46, 42, 38, 46], "7") // glowing charcoal hearth
  c.poly([39, 56, 45, 53, 45, 45, 39, 48], "8") // fiery yellow flame
  c.px(42, 50, "9") // white-hot molten core!
  // Iron tapping chute running molten iron down into sand molds
  c.line(42, 58, 52, 63, "8", 1)
  c.px(50, 62, "9")
  
  // 4. Raw Material Piles: Coal (Black) and Iron Ore (Rust Red)
  // Coal pile (Front Left)
  c.ellipse(12, 54, 6, 4, "1")
  c.px(11, 53, "3")
  c.px(13, 55, "2")
  // Raw Iron Ore pile
  c.ellipse(22, 58, 5, 3, "r")
  c.px(21, 57, "t")
  c.px(23, 58, "s")
  
  // 5. Stack of Finished Cast Iron Bars (Ingots)
  c.poly([52, 56, 58, 53, 58, 50, 52, 53], "3")
  c.poly([58, 53, 62, 55, 62, 52, 58, 50], "4")
  c.poly([52, 53, 58, 50, 62, 52, 56, 55], "5")
})

sprite("b_iso_smelter_scaffold", { w: 64, h: 66, outline: "a" }, (c) => {
  drawScaffold(c, 64, 66)
  c.rect(20, 36, 16, 20, "m")
})


// =========================================================================
// 13. SMITHY / FORGE (b_iso_smith: 80x72, 3x2 footprint)
// =========================================================================
sprite("b_iso_smith", { w: 80, h: 72, outline: "a" }, (c) => {
  // Village Blacksmith with glowing forge hearth, anvil on stump, quench tub & tools!
  // Footprint 3x2. Base center bottom: (48, 70).
  
  // 1. Open-Sided Stone Forge Structure
  // Rear & left stone walls
  c.poly([48, 54, 8, 34, 8, 18, 48, 38], "m")
  c.poly([48, 54, 76, 40, 76, 24, 48, 38], "n")
  // Heavy timber corner posts supporting roof
  c.line(16, 52, 16, 26, "g", 2)
  c.line(34, 61, 34, 34, "h", 2)
  c.line(48, 68, 48, 38, "i", 2)
  c.line(64, 60, 64, 32, "i", 2)
  c.line(74, 55, 74, 27, "j", 2)
  
  // 2. Slate Tile Roof with Stone Forge Chimney
  c.poly([48, 10, 4, 26, 48, 42], "3")
  c.poly([48, 10, 78, 26, 48, 42], "4")
  c.line(48, 10, 48, 42, "5", 1)
  // Stone Forge Chimney above hearth
  c.poly([24, 30, 16, 26, 16, 6, 24, 10], "m")
  c.poly([24, 30, 30, 27, 30, 7, 24, 10], "o")
  c.px(24, 4, "G") // smoke
  
  // 3. Glowing Forge Hearth with Charcoal Bed & Hood
  c.poly([20, 50, 32, 56, 32, 46, 20, 40], "l")
  c.poly([32, 56, 40, 52, 40, 42, 32, 46], "m")
  // Glowing charcoal fire
  c.poly([24, 48, 32, 52, 32, 46, 24, 42], "7")
  c.px(28, 48, "8")
  c.px(28, 47, "9")
  
  // 4. Steel Anvil mounted on Massive Tree Stump (Center Stage)
  // Tree stump
  c.poly([44, 58, 52, 62, 52, 54, 44, 50], "h")
  c.poly([52, 62, 58, 59, 58, 51, 52, 54], "j")
  c.ellipse(51, 52, 4, 2, "k")
  // Heavy Steel Anvil
  c.poly([46, 50, 54, 54, 54, 46, 46, 42], "2")
  c.poly([54, 54, 58, 52, 58, 44, 54, 46], "4")
  c.poly([46, 42, 54, 46, 58, 44, 50, 40], "5") // top face of anvil
  c.line(44, 46, 46, 47, "5", 1) // anvil horn point!
  
  // 5. Wooden Water Quench Trough with Steam
  c.poly([60, 64, 70, 59, 70, 53, 60, 58], "h")
  c.poly([70, 59, 76, 62, 76, 56, 70, 53], "j")
  c.ellipse(68, 55, 5, 2, "3") // water
  c.px(68, 52, "G") // rising steam wisp
  
  // 6. Blacksmith Workbench with Steel Tools & Ingots
  c.poly([16, 56, 28, 62, 28, 58, 16, 52], "h")
  // Sledgehammer and tongs
  c.line(20, 53, 26, 56, "5", 1)
  c.px(20, 52, "2") // hammer head
})

sprite("b_iso_smith_scaffold", { w: 80, h: 72, outline: "a" }, (c) => {
  drawScaffold(c, 80, 72)
  c.line(16, 48, 48, 64, "h", 2)
  c.line(48, 64, 72, 52, "i", 2)
})


// =========================================================================
// 14. WATCHTOWER (b_iso_tower: 64x88, 2x2 footprint)
// =========================================================================
sprite("b_iso_tower", { w: 64, h: 88, outline: "a" }, (c) => {
  // Fortified Medieval Watchtower with stone base, overhanging timber guard gallery, and royal pennant!
  // Base center bottom: (32, 86).
  
  // 1. Stone Lower Tower Body (levels 1 & 2)
  c.poly([32, 84, 12, 74, 12, 38, 32, 48], "m")
  c.poly([32, 84, 52, 74, 52, 38, 32, 48], "o")
  // Stone ashlar courses
  for (let y = 48; y <= 80; y += 8) {
    c.line(12, y - 10, 32, y, "l", 1)
    c.line(32, y, 52, y - 10, "n", 1)
  }
  // Narrow vertical arrow slits
  c.rect(20, 56, 2, 8, "l")
  c.rect(42, 56, 2, 8, "m")
  
  // 2. Overhanging Timber Guard Gallery on Heavy Corbels
  // Heavy timber corbel brackets supporting the overhang
  for (let bx = 12; bx <= 52; bx += 8) {
    const by = 48 - Math.floor(Math.abs(bx - 32) * 0.5)
    c.line(bx, by, bx, by - 4, "h", 2)
  }
  // Gallery wooden walls
  c.poly([32, 44, 6, 31, 6, 20, 32, 33], "h")
  c.poly([32, 44, 58, 31, 58, 20, 32, 33], "j")
  // Lookout window openings
  c.rect(14, 23, 6, 5, "a")
  c.rect(42, 23, 6, 5, "a")
  c.px(17, 25, "8") // guard lantern light inside!
  
  // 3. Steep Conical Slate Tile Roof
  c.poly([32, 2, 4, 21, 32, 35], "3")
  c.poly([32, 2, 60, 21, 32, 35], "4")
  c.line(32, 2, 32, 35, "5", 1)
  
  // 4. Tall Wooden Flagpole & Royal Crimson Pennant
  c.line(32, 2, 32, -4, "5", 1)
  c.poly([32, -4, 46, -1, 40, 2, 32, 4], "A")
  c.poly([32, -3, 44, -1, 38, 1, 32, 2], "B")
  c.line(32, -4, 46, -1, "C", 1)
  
  // 5. Watchman's Lantern hanging from gallery
  c.line(54, 33, 54, 38, "1", 1)
  c.px(54, 39, "8")
  c.px(54, 40, "7")
})

sprite("b_iso_tower_scaffold", { w: 64, h: 88, outline: "a" }, (c) => {
  drawScaffold(c, 64, 88)
  c.line(16, 70, 32, 78, "h", 2)
  c.line(32, 78, 48, 70, "i", 2)
})


// =========================================================================
// 15. MARKET (b_iso_market: 80x70, 3x2 footprint)
// =========================================================================
sprite("b_iso_market", { w: 80, h: 70, outline: "a" }, (c) => {
  // Bustling Medieval Market with striped canvas awnings, food stalls, crates and barrels!
  // Footprint 3x2. Base center bottom: (48, 68).
  
  // 1. Cobblestone Paved Market Square Floor
  c.poly([48, 66, 8, 46, 48, 26, 76, 40], "m")
  c.poly([48, 66, 8, 46, 8, 42, 48, 62], "l")
  c.poly([48, 66, 76, 40, 76, 36, 48, 62], "n")
  // Cobblestone pavement grid
  for (let py = 32; py < 62; py += 5) {
    c.line(14, py - 6, 48, py + 4, "l", 1)
    c.line(48, py + 4, 72, py - 4, "n", 1)
  }
  
  // 2. STALL 1 (Left): Red & White Striped Canvas Awning
  // Wooden support posts
  c.line(14, 46, 14, 22, "h", 2)
  c.line(36, 57, 36, 33, "i", 2)
  // Striped Awning canopy
  c.poly([36, 32, 14, 21, 14, 15, 36, 26], "B")
  c.poly([36, 32, 48, 26, 48, 20, 36, 26], "B")
  // Alternating White Stripes
  c.poly([20, 24, 25, 27, 25, 21, 20, 18], "G")
  c.poly([30, 29, 35, 32, 35, 26, 30, 23], "G")
  c.poly([40, 30, 45, 27, 45, 21, 40, 24], "G")
  // Scalloped awning valance edge
  for (let x = 14; x < 36; x += 3) c.px(x, 21 + Math.floor((x - 14) * 0.5), "B")
  
  // Wooden Market Counter (Stall 1)
  c.poly([16, 44, 34, 53, 34, 47, 16, 38], "h")
  c.poly([34, 53, 44, 48, 44, 42, 34, 47], "j")
  // Goods on counter: Red apples & golden cheese wheels!
  c.px(22, 44, "B")
  c.px(24, 45, "B")
  c.ellipse(30, 48, 3, 2, "8") // golden round cheese
  c.px(30, 47, "9")
  
  // 3. STALL 2 (Right): Royal Blue & White Striped Canvas Awning
  c.line(44, 46, 44, 22, "h", 2)
  c.line(68, 34, 68, 10, "j", 2)
  c.poly([44, 22, 68, 10, 68, 6, 44, 18], "D")
  // White stripes on stall 2
  c.poly([50, 19, 56, 16, 56, 12, 50, 15], "G")
  c.poly([62, 13, 67, 10, 67, 7, 62, 10], "G")
  
  // Counter & Goods (Stall 2)
  c.poly([46, 42, 66, 32, 66, 26, 46, 36], "j")
  // Fresh Fish & Bread loaves on counter
  c.line(50, 37, 54, 35, "5", 1) // fish
  c.px(58, 33, "8") // bread
  c.px(62, 31, "8")
  
  // 4. Trade Crates, Sacks & Barrels in Foreground
  c.rect(38, 54, 7, 7, "h")
  c.box(38, 54, 7, 7, "g")
  c.line(38, 54, 44, 60, "i", 1) // cross batten on crate
  c.ellipse(48, 60, 4, 3, "H") // sack of grain
  c.rect(54, 52, 6, 8, "i")    // wine barrel
  c.box(54, 52, 6, 8, "h")
})

sprite("b_iso_market_scaffold", { w: 80, h: 70, outline: "a" }, (c) => {
  drawScaffold(c, 80, 70)
  c.line(16, 46, 48, 62, "h", 2)
  c.line(48, 62, 70, 51, "i", 2)
})


// =========================================================================
// 16. GREAT HALL / CATHEDRAL WONDER (b_iso_monument: 112x120, 4x3 footprint)
// =========================================================================
sprite("b_iso_monument", { w: 112, h: 120, outline: "a" }, (c) => {
  // Majestic High Gothic Medieval Cathedral with flying buttresses, stained glass rose window, and bell spire!
  // Footprint 4x3. Base center bottom: (64, 116).
  
  // 1. High Cathedral Nave & Aisle Granite Walls
  // Left facade (SW, shadow side)
  c.poly([64, 112, 12, 86, 12, 48, 64, 74], "m")
  // Right flank (SE, lit side)
  c.poly([64, 112, 104, 92, 104, 54, 64, 74], "o")
  
  // Stone courses & ashlar masonry
  for (let y = 60; y <= 108; y += 8) {
    c.line(12, y - 26, 64, y, "l", 1)
    c.line(64, y, 104, y - 20, "n", 1)
  }
  
  // 2. Flying Buttresses on SE Flank
  const buttresses = [72, 84, 96]
  for (let bx of buttresses) {
    const by = 74 + Math.floor((bx - 64) * 0.45)
    // Pier buttress
    c.rect(bx, by, 4, 24, "n")
    c.line(bx, by, bx, by + 24, "p", 1)
    // Flying arch spanning from high clerestory down to pier
    c.line(bx - 6, by - 14, bx, by, "o", 2)
    // Pinnacle on top of pier buttress
    c.poly([bx + 2, by - 6, bx, by, bx + 4, by], "p")
  }
  
  // 3. Grand Arched Stone Portal (Main Facade)
  c.poly([32, 94, 48, 102, 48, 76, 32, 68], "l")
  c.rect(34, 80, 12, 20, "g")
  // Arched wooden double doors with iron strapwork
  c.line(40, 80, 40, 100, "1", 1) // door split
  c.hline(34, 85, 12, "2")
  c.hline(34, 94, 12, "2")
  // Concentric Carved Stone Portal Arch
  c.poly([30, 78, 40, 72, 50, 77, 48, 80, 40, 75, 32, 81], "p")
  
  // 4. Stained Glass Rose Window (Circular Window above portal)
  c.circ(40, 60, 9, "l")
  c.circ(40, 60, 8, "D") // blue stained glass
  c.circ(40, 60, 6, "A") // red stained glass
  c.circ(40, 60, 3, "8") // golden center glow
  c.px(40, 60, "9")
  // Stone tracery spokes
  c.line(32, 60, 48, 60, "p", 1)
  c.line(40, 52, 40, 68, "p", 1)
  
  // 5. Tall Arched Lancet Windows with Stained Glass (Side clerestory)
  c.rect(74, 58, 4, 14, "D")
  c.px(75, 64, "8")
  c.rect(86, 64, 4, 14, "D")
  c.px(87, 70, "8")
  
  // 6. High Vaulted Deep Slate Roof with Golden Ridge Cresting
  c.poly([64, 28, 8, 56, 64, 84], "3")
  c.poly([64, 28, 108, 50, 64, 84], "4")
  // Roof slate seams
  for (let r = 0; r < 9; r++) {
    const yStart = 32 + r * 5
    c.line(64, yStart, 108, yStart + 22 - r * 2, "3", 1)
    c.line(64, yStart, 8, yStart + 28 - r * 2, "1", 1)
  }
  // Golden Fleur-de-lis Ridge Cresting
  c.line(64, 28, 64, 84, "8", 1)
  for (let ry = 34; ry < 80; ry += 6) {
    c.px(64, ry, "9")
    c.px(63, ry - 1, "8")
    c.px(65, ry - 1, "8")
  }
  
  // 7. Towering Bell Belfry Spire (Rising high above crossing)
  c.poly([64, 42, 54, 37, 54, 18, 64, 23], "m")
  c.poly([64, 42, 74, 37, 74, 18, 64, 23], "o")
  // Belfry louvres (bell chamber)
  c.rect(58, 25, 4, 8, "l")
  c.px(60, 28, "8") // bell bronze highlight
  c.rect(66, 27, 4, 8, "m")
  // Soaring Octagonal Slate Spire
  c.poly([64, -2, 52, 19, 76, 19], "3")
  c.poly([64, -2, 64, 19, 76, 19], "4")
  c.line(64, -2, 64, 19, "5", 1)
  // Gilded Imperial Finial / Cross atop spire
  c.line(64, -2, 64, -8, "8", 1)
  c.line(62, -6, 66, -6, "8", 1)
  c.px(64, -8, "9")
})

sprite("b_iso_monument_scaffold", { w: 112, h: 120, outline: "a" }, (c) => {
  drawScaffold(c, 112, 120)
  c.poly([64, 108, 20, 86, 20, 60, 64, 82], "m")
  c.poly([64, 108, 98, 91, 98, 65, 64, 82], "o")
})
