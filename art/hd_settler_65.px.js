// 65px Modern HD Settler Prototype for Harrow Settlers
// Height: 65px (nominal 1.80m adult, 36 px/metre)
// Realistic 1:7.2 proportions, shaded 3D volumetric anatomy, selective outline

pal({
  // Outline & Deep Crevices
  a: "#16111e", // ink outline
  b: "#251c2d", // deep shadow
  
  // Skin & Face
  c: "#7a4328", // skin shadow
  d: "#b87049", // skin mid
  e: "#e09c75", // skin lit
  f: "#f7c7a8", // skin highlight / nose bridge
  
  // Hair & Medieval Beard
  g: "#2a170d", // dark beard
  h: "#4a2c19", // mid brown hair
  i: "#754929", // lit hair
  
  // Baker's White Linen Apron & Toque
  j: "#6c6875", // linen crease shadow
  k: "#9c96a6", // linen mid
  l: "#cfc9d9", // lit linen
  m: "#f5f0fa", // bright white linen
  
  // Woolen Tunic & Trousers (Warm Ochre / Brown)
  n: "#30241b", // wool deep fold
  o: "#574232", // dark wool
  p: "#80634c", // mid wool
  q: "#ad8869", // lit wool
  r: "#d1ab88", // bright wool highlight
  
  // Heavy Leather Boots & Belt
  s: "#1a120c", // boot shadow
  t: "#362214", // dark leather
  u: "#5e3a20", // mid leather
  v: "#8a5730", // lit leather
  w: "#b57945", // brass belt buckle / boot highlight
  
  // Tools & Goods (Golden Bread & Wood Peel)
  x: "#7a4e1d", // dark baked crust
  y: "#ba7e32", // mid golden crust
  z: "#e6ab53", // bright crust
  1: "#fae093", // flour dusted slash
  2: "#2d6330", // forester green
  3: "#4b9c50"  // bright leaf green
})

ramps("ab", "cdef", "ghi", "jklm", "nopqr", "stuvw", "xyz1")

// -------------------------------------------------------------------------
// 1. 65px BAKER (Master Baker Hans in White Apron & Toque holding bread)
// -------------------------------------------------------------------------
sprite("settler_baker_65", { w: 32, h: 68, outline: "a" }, (c) => {
  const ox = 16, oy = 66 // feet anchor at bottom center
  
  // Soft Ground Contact Shadow (Ellipse under boots)
  c.ellipse(ox, oy - 2, 10, 4, "b")
  c.ellipse(ox, oy - 2, 7, 2, "a")
  
  // 1. Leather Boots (h: 0 -> 9 px)
  // Left boot
  c.rect(ox - 6, oy - 9, 5, 8, "t")
  c.rect(ox - 6, oy - 9, 5, 2, "v") // leather turnover cuff
  c.rect(ox - 7, oy - 3, 6, 3, "s") // sole & toe
  c.hline(ox - 6, oy - 9, 4, "w")
  
  // Right boot
  c.rect(ox + 1, oy - 8, 5, 7, "t")
  c.rect(ox + 1, oy - 8, 5, 2, "v") // turnover cuff
  c.rect(ox, oy - 2, 6, 2, "s") // sole
  
  // 2. Woolen Trousers (h: 9 -> 25 px)
  c.rect(ox - 6, oy - 25, 5, 17, "p")
  c.rect(ox + 1, oy - 25, 5, 18, "o") // shadow side leg
  c.vline(ox - 2, oy - 25, 16, "n") // inseam shadow
  c.vline(ox - 5, oy - 23, 12, "q") // crease highlight
  
  // 3. Baker's Long Linen Apron & Wool Tunic (h: 24 -> 46 px)
  c.rect(ox - 7, oy - 43, 14, 19, "l")
  c.rect(ox - 7, oy - 43, 5, 19, "j") // shaded left side
  c.rect(ox + 3, oy - 43, 4, 19, "k")
  c.rect(ox - 2, oy - 43, 5, 19, "m") // lit center bib
  // Belt with leather pouch
  c.hline(ox - 7, oy - 36, 14, "t")
  c.rect(ox + 4, oy - 35, 3, 4, "u") // side pouch
  c.px(ox - 1, oy - 36, "w") // brass buckle
  
  // 4. Arms & Hands holding fresh golden bread loaf
  // Left arm
  c.rect(ox - 9, oy - 44, 3, 11, "p")
  c.ellipse(ox - 5, oy - 33, 2, 2, "e") // left hand
  // Right arm
  c.rect(ox + 6, oy - 44, 3, 11, "o")
  c.ellipse(ox + 3, oy - 33, 2, 2, "e") // right hand
  
  // Freshly baked crusty bread loaf held in both hands!
  c.ellipse(ox - 1, oy - 34, 5, 3, "y")
  c.ellipse(ox - 1, oy - 35, 4, 2, "z")
  c.px(ox - 2, oy - 35, "1") // flour dusted score
  c.px(ox + 1, oy - 35, "1")
  
  // 5. Neck & Face (h: 46 -> 57 px)
  c.rect(ox - 2, oy - 48, 5, 3, "d") // neck
  // Head & Jaw
  c.ellipse(ox, oy - 52, 4, 5, "e")
  // Trimmed brown beard & mustache
  c.rect(ox - 3, oy - 50, 7, 3, "h")
  c.px(ox - 1, oy - 48, "g")
  c.px(ox, oy - 48, "g")
  // Eyes, nose & cheek
  c.px(ox - 2, oy - 53, "a") // left eye
  c.px(ox + 2, oy - 53, "a") // right eye
  c.px(ox, oy - 52, "f") // nose bridge highlight
  c.px(ox - 3, oy - 51, "d") // cheek shadow
  
  // 6. Baker's Pleated White Toque Hat (h: 56 -> 65 px)
  c.rect(ox - 4, oy - 57, 9, 3, "l") // hat band
  c.ellipse(ox, oy - 60, 6, 4, "m") // pleated puffy crown
  c.ellipse(ox - 1, oy - 61, 5, 3, "m")
  c.vline(ox - 3, oy - 62, 4, "k") // pleat creases
  c.vline(ox + 2, oy - 62, 4, "k")
  c.px(ox, oy - 63, "m") // tip top peak (exact 65 px height!)
})

// -------------------------------------------------------------------------
// 2. 65px WOODCUTTER (Lumberjack with Double-Bit Axe over Shoulder)
// -------------------------------------------------------------------------
sprite("settler_lumberjack_65", { w: 34, h: 68, outline: "a" }, (c) => {
  const ox = 16, oy = 66
  
  // Soft ground contact
  c.ellipse(ox, oy - 2, 10, 4, "b")
  c.ellipse(ox, oy - 2, 7, 2, "a")
  
  // Heavy Boots
  c.rect(ox - 6, oy - 9, 5, 8, "s")
  c.rect(ox - 7, oy - 3, 6, 3, "s")
  c.rect(ox + 1, oy - 8, 5, 7, "t")
  c.rect(ox, oy - 2, 6, 2, "s")
  
  // Tough Trousers
  c.rect(ox - 6, oy - 25, 5, 17, "o")
  c.rect(ox + 1, oy - 25, 5, 18, "n")
  c.vline(ox - 5, oy - 22, 12, "p")
  
  // Forester Green Tunica & Leather Braces (h: 24 -> 46 px)
  c.rect(ox - 7, oy - 44, 14, 20, "2")
  c.rect(ox - 7, oy - 44, 4, 20, "a") // shadow
  c.rect(ox - 1, oy - 44, 6, 20, "3") // lit face
  // Leather belt & suspender braces
  c.hline(ox - 7, oy - 28, 14, "t")
  c.vline(ox - 4, oy - 44, 16, "u")
  c.vline(ox + 3, oy - 44, 16, "u")
  c.px(ox, oy - 28, "w")
  
  // Double-Bit Steel Woodcutter Axe slung over shoulder!
  // Wooden haft
  c.line(ox + 8, oy - 20, ox - 2, oy - 56, "u", 2)
  c.line(ox + 8, oy - 20, ox - 2, oy - 56, "v", 1)
  // Steel double blade head
  c.rect(ox - 7, oy - 56, 10, 5, "j")
  c.rect(ox - 6, oy - 55, 8, 3, "m")
  c.px(ox - 7, oy - 56, "f"); c.px(ox + 3, oy - 56, "f") // sharpened bit edges!
  
  // Arms
  c.rect(ox - 8, oy - 43, 3, 12, "2")
  c.ellipse(ox + 4, oy - 36, 2, 2, "e") // hand gripping haft
  
  // Head, Rugged Beard & Wool Knit Cap
  c.ellipse(ox - 1, oy - 52, 4, 5, "e")
  c.rect(ox - 4, oy - 50, 7, 4, "g") // bushy lumberjack beard
  c.px(ox - 2, oy - 53, "a"); c.px(ox + 1, oy - 53, "a")
  c.px(ox, oy - 52, "f")
  
  // Red/Brown knitted wool toque
  c.rect(ox - 5, oy - 57, 9, 3, "o")
  c.ellipse(ox - 1, oy - 60, 5, 4, "p")
  c.px(ox - 1, oy - 63, "r") // top pompom at 65px!
})
