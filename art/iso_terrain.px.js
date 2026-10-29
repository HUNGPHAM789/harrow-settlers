// Isometric terrain tiles and props - Authentic Settlers II Medieval Pixel Art
// 32x16 2:1 dimetric tiles, top-left lighting, lush organic foliage, textured surfaces.

pal({
  // Deep Ocean & Water Palette
  A: "#0a1322", // deep ocean abyss
  B: "#142540", // ocean deep base
  C: "#23496d", // water dark shadow
  D: "#37719c", // water mid blue
  E: "#57a0cc", // water lit cerulean
  F: "#8cd5f5", // water foam crest
  G: "#e8fbff", // sparkling foam white
  
  // Sand & Shoreline Palette
  H: "#7a5028", // damp sand shadow
  I: "#a8773d", // sand mid dark
  J: "#cf9f57", // sand base warm gold
  K: "#edd087", // sand lit highlight
  L: "#fff4be", // sunlit dry sand glint
  
  // Lush Meadow Grass & Forest Floor Palette
  M: "#1b2d10", // deep under-blade shadow
  N: "#2b4b18", // dark grass base
  O: "#477823", // mid meadow green
  P: "#6ba832", // lit grass blade
  Q: "#95d145", // bright grass highlight / sunlit tuft
  R: "#c2ed6d", // golden lime blade glint
  S: "#18200d", // deep forest humus dark
  T: "#324019", // forest litter mid
  
  // Rock & Mountain Palette
  U: "#1c1e28", // rock deep shadow
  V: "#34384a", // dark stone plane
  W: "#535970", // mid stone plane
  X: "#7a829e", // lit stone facet
  Y: "#a5aecd", // bright rock ridge highlight
  Z: "#d8e0f5", // snow-dusted stone
  
  // Snow Palette
  1: "#7ba5c7", // snow shadow icy blue
  2: "#aed4ea", // snow mid
  3: "#e0f2fe", // snow lit
  4: "#ffffff", // pure snow crest
  
  // Tree Trunks & Bark
  5: "#1f1008", // trunk shadow
  6: "#3d1e0d", // dark bark
  7: "#633518", // mid bark
  8: "#8c5025", // lit bark
  9: "#b5723a", // birch / oak highlight
  
  // Autumn Foliage & Accents
  a: "#7a1a15", // autumn crimson deep
  b: "#b02a1c", // autumn red
  c: "#dc5222", // autumn orange
  d: "#f58827", // golden autumn
  e: "#f7c736", // bright autumn yellow / buttercup
  
  // Wildflower Blooms & Berries
  f: "#e63946", // poppy red
  g: "#ffffff", // daisy white
  h: "#3a86ff", // bluebell blue
  i: "#9d4edd", // violet purple
  j: "#2d6a4f"  // pine deep evergreen
})

ramps("AB", "CDEF", "HIJK", "MNOPQR", "UVWXY", "1234", "56789", "abcde")

const ISO_W = 32
const ISO_H = 16

// Helper to draw textured iso diamond clipped to 32x16 diamond
function drawIsoDiamond(c, baseCol, leftCol, rightCol, topCol, detailFn) {
  c.rect(0, 0, ISO_W, ISO_H, "_")
  c.clip([16, 0, 32, 8, 16, 16, 0, 8], () => {
    c.poly([16, 0, 32, 8, 16, 16, 0, 8], baseCol)
    c.poly([16, 0, 16, 16, 0, 8], leftCol)
    c.poly([16, 0, 32, 8, 16, 16], rightCol)
    c.dither(0, 0, 32, 16, leftCol, topCol, 0.35)
    if (detailFn) detailFn(c)
  })
}

// -------------------------------------------------------------------------
// WATER TILES (Ocean abyss & animated coastal waves)
// -------------------------------------------------------------------------
// 1. iso_tile_deep (Deep ocean abyss with gentle wave swell)
sprite("iso_tile_deep", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "A", "B", "A", "B", (c) => {
    c.line(10, 6, 18, 10, "C", 1)
    c.line(14, 4, 22, 8, "C", 1)
    c.px(14, 5, "D")
    c.px(18, 7, "D")
  })
})

// 2. iso_tile_water (Clear coastal blue water with wave ripples)
sprite("iso_tile_water", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "C", "D", "C", "E", (c) => {
    c.line(8, 7, 16, 11, "D", 1)
    c.line(12, 5, 24, 11, "E", 1)
    c.line(16, 3, 22, 6, "F", 1)
    c.px(19, 5, "G") // wave glint
    c.px(10, 8, "F")
  })
})

// 3. iso_tile_water_1 (Wave cycle frame 1)
sprite("iso_tile_water_1", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "C", "D", "C", "E", (c) => {
    c.line(10, 4, 20, 9, "E", 1)
    c.line(14, 3, 18, 5, "F", 1)
    c.px(16, 4, "G")
    c.line(6, 8, 14, 12, "E", 1)
    c.px(10, 10, "F")
    c.line(18, 8, 26, 12, "D", 1)
  })
})

// 4. iso_tile_water_2 (Wave cycle frame 2)
sprite("iso_tile_water_2", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "C", "D", "C", "E", (c) => {
    c.line(12, 5, 22, 10, "F", 1)
    c.px(17, 7, "G")
    c.px(18, 7, "G")
    c.line(8, 6, 16, 10, "E", 1)
    c.line(16, 8, 24, 12, "E", 1)
    c.px(20, 10, "F")
  })
})

// 5. iso_tile_water_3 (Wave cycle frame 3)
sprite("iso_tile_water_3", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "C", "D", "C", "E", (c) => {
    c.line(14, 6, 24, 11, "E", 1)
    c.px(19, 8, "F")
    c.line(10, 5, 18, 9, "F", 1)
    c.px(14, 7, "G")
    c.line(6, 9, 14, 13, "D", 1)
  })
})

// -------------------------------------------------------------------------
// SAND TILES (Warm golden beach with pebble accents)
// -------------------------------------------------------------------------
// 6. iso_tile_sand
sprite("iso_tile_sand", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "I", "J", "I", "K", (c) => {
    c.line(10, 6, 22, 12, "K", 1)
    c.px(14, 8, "L")
    c.px(18, 10, "L")
    c.px(8, 8, "H") // tiny beach pebble
    c.px(24, 8, "H")
  })
})

// -------------------------------------------------------------------------
// LUSH MEADOW GRASS TILES (Vibrant blades & Wildflower variants)
// -------------------------------------------------------------------------
// 7. iso_tile_grass (Base rich lush meadow grass with blade tufts)
sprite("iso_tile_grass", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    // Grass blade clumps
    c.line(10, 5, 12, 4, "Q", 1)
    c.px(12, 3, "R")
    c.line(18, 7, 20, 6, "Q", 1)
    c.px(20, 5, "R")
    c.line(14, 10, 16, 9, "Q", 1)
    c.px(16, 8, "R")
    c.px(8, 8, "M") // blade shadow
    c.px(22, 10, "M")
  })
})

// 8. iso_tile_grass_1 (Meadow with bright yellow buttercups)
sprite("iso_tile_grass_1", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    c.line(12, 5, 14, 4, "Q", 1)
    c.px(14, 3, "R")
    // Buttercup flowers
    c.px(10, 6, "e")
    c.px(11, 6, "e")
    c.px(10, 7, "d")
    c.px(22, 8, "e")
    c.px(22, 9, "d")
  })
})

// 9. iso_tile_grass_2 (Meadow with white daisies)
sprite("iso_tile_grass_2", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    c.line(16, 6, 18, 5, "Q", 1)
    c.px(18, 4, "R")
    // Daisies with gold centers
    c.px(12, 7, "g")
    c.px(13, 7, "e")
    c.px(14, 7, "g")
    c.px(20, 10, "g")
    c.px(21, 10, "e")
  })
})

// 10. iso_tile_grass_3 (Meadow with scarlet poppies)
sprite("iso_tile_grass_3", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    c.line(10, 7, 12, 6, "Q", 1)
    c.px(12, 5, "R")
    // Scarlet poppies
    c.px(16, 6, "f")
    c.px(17, 6, "b")
    c.px(16, 7, "a")
    c.px(24, 9, "f")
  })
})

// 11. iso_tile_grass_4 (Meadow with bluebell blossoms)
sprite("iso_tile_grass_4", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    c.line(14, 8, 16, 7, "Q", 1)
    c.px(16, 6, "R")
    // Bluebells
    c.px(11, 5, "h")
    c.px(11, 6, "i")
    c.px(21, 7, "h")
  })
})

// 12. iso_tile_grass_5 (Meadow with four-leaf clover patches)
sprite("iso_tile_grass_5", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    // Clover clump
    c.px(15, 6, "R")
    c.px(16, 6, "Q")
    c.px(15, 7, "Q")
    c.px(16, 7, "R")
    c.px(9, 8, "Q")
    c.px(23, 9, "Q")
  })
})

// 13. iso_tile_grass_6 (Meadow with flat stepping pebble)
sprite("iso_tile_grass_6", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "N", "O", "N", "P", (c) => {
    c.line(10, 5, 12, 4, "Q", 1)
    // Small flat stepping stone
    c.ellipse(17, 8, 3, 2, "W")
    c.px(17, 7, "X")
    c.px(17, 9, "V")
  })
})

// -------------------------------------------------------------------------
// FOREST, ROCK, MOUNTAIN & SNOW TILES
// -------------------------------------------------------------------------
// 14. iso_tile_forest (Deep mossy forest floor with pine needle litter)
sprite("iso_tile_forest", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "S", "T", "S", "N", (c) => {
    c.line(10, 6, 22, 12, "T", 1)
    c.px(14, 5, "O")
    c.px(18, 8, "O")
    c.px(12, 9, "5") // pine twig
    c.px(13, 9, "6")
    c.px(20, 10, "S")
  })
})

// 15. iso_tile_rock (Chiseled granite rock slab)
sprite("iso_tile_rock", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "V", "W", "V", "X", (c) => {
    c.poly([16, 3, 24, 7, 16, 11, 8, 7], "W")
    c.line(8, 7, 16, 3, "Y", 1)
    c.line(16, 3, 24, 7, "X", 1)
    c.line(8, 7, 16, 11, "V", 1)
    c.line(16, 11, 24, 7, "U", 1)
    c.px(16, 4, "Y")
  })
})

// 16. iso_tile_mountain (Faceted craggy alpine peak with snow dusting)
sprite("iso_tile_mountain", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "U", "V", "U", "W", (c) => {
    c.poly([16, 2, 26, 7, 16, 12, 6, 7], "V")
    c.poly([16, 3, 22, 6, 16, 9, 10, 6], "W")
    // Crisp ridge lines
    c.line(6, 7, 16, 2, "Z", 1)
    c.line(16, 2, 26, 7, "Y", 1)
    c.line(16, 2, 16, 12, "Z", 1)
    c.px(16, 2, "4") // pure snow peak!
  })
})

// 17. iso_tile_snow (Soft sparkling snow drift with blue shadows)
sprite("iso_tile_snow", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "1", "2", "1", "3", (c) => {
    c.line(10, 5, 22, 11, "3", 1)
    c.line(14, 4, 18, 6, "4", 1)
    c.px(16, 5, "4")
    c.px(11, 8, "2")
    c.px(21, 9, "2")
  })
})

// 18. iso_tile_road (Worn dirt road with cart wheel ruts)
sprite("iso_tile_road", { w: ISO_W, h: ISO_H }, (c) => {
  drawIsoDiamond(c, "5", "6", "5", "7", (c) => {
    // Dirt path ribbon
    c.poly([16, 2, 28, 8, 16, 14, 4, 8], "7")
    c.line(8, 8, 24, 8, "8", 1)
    // Cart wheel ruts
    c.line(10, 6, 22, 12, "6", 1)
    c.line(10, 10, 22, 4, "6", 1)
  })
})

// 19. iso_edge_grass_sand
sprite("iso_edge_grass_sand", { w: ISO_W, h: ISO_H }, (c) => {
  c.rect(0, 0, ISO_W, ISO_H, "_")
  c.clip([16, 8, 32, 8, 16, 16, 0, 8], () => {
    c.poly([16, 8, 32, 8, 16, 16, 0, 8], "J")
    c.line(10, 11, 22, 11, "K", 1)
  })
})

// 20. iso_edge_grass_water
sprite("iso_edge_grass_water", { w: ISO_W, h: ISO_H }, (c) => {
  c.rect(0, 0, ISO_W, ISO_H, "_")
  c.clip([16, 8, 32, 8, 16, 16, 0, 8], () => {
    c.poly([16, 8, 32, 8, 16, 16, 0, 8], "D")
    c.line(8, 12, 24, 12, "E", 1)
    c.px(16, 12, "G") // shoreline foam
  })
})


// -------------------------------------------------------------------------
// PROPS & TREES (Volumetric leafy canopies, sturdy trunks, authentic pixel art)
// -------------------------------------------------------------------------

// 21. iso_tree_1 (Grand Bavarian Oak: 24x32 base, outline 26x34)
sprite("iso_tree_1", { w: 24, h: 32, outline: "5" }, (c) => {
  // Gnarled Oak Trunk with root flare
  c.rect(10, 20, 5, 10, "6")
  c.line(10, 20, 10, 30, "5", 1)
  c.line(14, 20, 14, 30, "7", 1)
  c.px(9, 29, "5")  // left root flare
  c.px(15, 29, "7") // right root flare
  
  // Broad Volumetric Leafy Canopy
  // Layer 1: Underside ambient occlusion / deep shadow
  c.ellipse(12, 16, 10, 7, "M")
  // Layer 2: Mid green foliage volumes
  c.ellipse(12, 14, 9, 7, "N")
  c.ellipse(9, 13, 6, 5, "O")
  c.ellipse(15, 13, 6, 5, "O")
  // Layer 3: Lit leaf clusters catching sunlight
  c.ellipse(11, 10, 7, 5, "P")
  c.ellipse(8, 9, 4, 3, "Q")
  c.ellipse(14, 8, 5, 4, "Q")
  // Sunlit leafy crown highlights
  c.px(8, 8, "R")
  c.px(13, 6, "R")
  c.px(14, 7, "R")
})

// 22. iso_tree_2 (Noble Black Forest Pine: 24x36 base, outline 26x38)
sprite("iso_tree_2", { w: 24, h: 36, outline: "5" }, (c) => {
  // Tall Straight Pine Trunk
  c.rect(11, 24, 3, 10, "6")
  c.line(13, 24, 13, 34, "7", 1)
  
  // Tiered Drooping Needle Boughs
  // Bottom Tier
  c.poly([12, 16, 22, 28, 2, 28], "j")
  c.poly([12, 16, 18, 26, 6, 26], "N")
  c.line(12, 16, 12, 28, "O", 1)
  // Middle Tier
  c.poly([12, 8, 20, 19, 4, 19], "j")
  c.poly([12, 8, 17, 18, 7, 18], "N")
  c.line(12, 8, 12, 19, "P", 1)
  // Top Spire Tier
  c.poly([12, 2, 17, 11, 7, 11], "N")
  c.poly([12, 2, 15, 10, 9, 10], "P")
  c.px(12, 2, "Q") // top needle spire!
})

// 23. iso_tree_3 (Golden Autumn Birch/Maple: 24x32 base, outline 5)
sprite("iso_tree_3", { w: 24, h: 32, outline: "5" }, (c) => {
  // White Birch Bark Trunk with dark horizontal lenticels
  c.rect(11, 20, 3, 10, "G")
  c.line(11, 20, 11, 30, "9", 1)
  c.px(12, 22, "5")
  c.px(13, 25, "5")
  c.px(12, 28, "5")
  
  // Vibrant Glowing Autumn Canopy (Crimson, Orange, Gold)
  c.ellipse(12, 16, 10, 7, "a") // deep crimson shadow
  c.ellipse(12, 14, 9, 7, "b")
  c.ellipse(9, 13, 6, 5, "c")
  c.ellipse(15, 13, 6, 5, "c")
  c.ellipse(11, 10, 7, 5, "d") // golden orange
  c.ellipse(8, 9, 4, 3, "e")  // bright buttercup yellow
  c.ellipse(14, 8, 5, 4, "e")
  c.px(8, 8, "e")
  c.px(13, 6, "e")
})

// 24. iso_sapling (12x14 base, outline 14x16)
sprite("iso_sapling", { w: 12, h: 14, outline: "5" }, (c) => {
  c.line(6, 6, 6, 12, "7", 1) // wooden stake
  c.px(5, 5, "P") // little green sprout leaves
  c.px(7, 5, "P")
  c.px(6, 4, "Q")
  c.px(6, 3, "R")
})

// 25. iso_rock_1 (Granite Boulder: 20x16 base, outline 22x18)
sprite("iso_rock_1", { w: 20, h: 16, outline: "U" }, (c) => {
  c.poly([4, 14, 10, 4, 16, 6, 18, 14], "V")
  c.poly([8, 8, 12, 5, 16, 6, 14, 12, 6, 12], "W")
  c.line(10, 4, 16, 6, "Y", 1)
  c.line(8, 8, 12, 5, "Y", 1)
  c.px(11, 5, "Z") // sunlit facet highlight
  // Moss patch on rock base
  c.px(6, 13, "N")
  c.px(7, 13, "O")
})

// 26. iso_rock_2 (Smaller Stone: 16x12 base, outline 18x14)
sprite("iso_rock_2", { w: 16, h: 12, outline: "U" }, (c) => {
  c.poly([3, 10, 8, 3, 13, 5, 14, 10], "V")
  c.poly([6, 6, 10, 4, 12, 6, 6, 9], "W")
  c.line(8, 3, 13, 5, "X", 1)
  c.px(9, 4, "Y")
})

// 27. iso_bush (Berry Bush: 14x10 base, outline 16x12)
sprite("iso_bush", { w: 14, h: 10, outline: "M" }, (c) => {
  c.ellipse(7, 6, 5, 4, "N")
  c.ellipse(6, 5, 4, 3, "P")
  c.px(6, 4, "Q")
  // Sweet red berries
  c.px(4, 5, "f")
  c.px(8, 6, "f")
  c.px(6, 7, "f")
})

// 28. iso_flowers (Wildflower Bouquet: 14x8 base, outline 16x10)
sprite("iso_flowers", { w: 14, h: 8, outline: "M" }, (c) => {
  c.ellipse(7, 5, 5, 3, "O")
  c.px(4, 4, "f") // scarlet poppy
  c.px(7, 3, "e") // golden buttercup
  c.px(10, 4, "g") // white daisy
  c.px(6, 5, "h") // bluebell
})

sheet("iso_terrain", [
  "iso_tile_deep",
  "iso_tile_water",
  "iso_tile_sand",
  "iso_tile_grass",
  "iso_tile_forest",
  "iso_tile_rock",
  "iso_tile_mountain",
  "iso_tile_snow",
  "iso_tile_grass_1",
  "iso_tile_grass_2",
  "iso_tile_grass_3",
  "iso_tile_grass_4",
  "iso_tile_grass_5",
  "iso_tile_grass_6",
  "iso_tile_water_1",
  "iso_tile_water_2",
  "iso_tile_water_3",
  "iso_tile_road",
  "iso_edge_grass_sand",
  "iso_edge_grass_water",
  "iso_tree_1",
  "iso_tree_2",
  "iso_tree_3",
  "iso_sapling",
  "iso_rock_1",
  "iso_rock_2",
  "iso_bush",
  "iso_flowers"
], { pad: 1 })
