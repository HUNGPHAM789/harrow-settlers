// 128px Ultra HD Settler Prototype for Harrow Settlers
// Height: 128px (nominal 1.80m adult, 71 px/metre)
// Realistic anatomy (1:7.2 proportion: head 18px, torso 40px, legs/boots 50px)

pal({
  a: "#110b17", // deep ink contour
  b: "#1f1526", // deep ambient occlusion
  
  // Skin & Facial Tones (Warm 5-tone ramp)
  c: "#5e321e", // deepest skin crease
  d: "#8f4e2f", // skin shadow
  e: "#c27548", // mid skin
  f: "#e69e73", // lit skin
  g: "#fad1b6", // highlight nose bridge & cheek
  
  // Facial Features & Beard
  h: "#24130b", // dark pupil & beard base
  i: "#422415", // dark chestnut beard
  j: "#6e3e23", // mid beard hair
  k: "#9e5c33", // lit beard hair strands
  
  // Baker's White Linen Apron & Clothes (Fabric weave)
  l: "#4d4857", // deep fabric fold
  m: "#736d80", // shadow linen
  n: "#a69fb3", // mid linen
  o: "#d4cee0", // lit linen
  p: "#f8f5fc", // crisp white highlight
  
  // Woolen Tunic & Trousers (Warm Medieval Russet)
  q: "#2b1c14", // wool shadow
  r: "#4a3224", // dark wool
  s: "#734e38", // mid wool
  t: "#9e6d4f", // lit wool
  u: "#c79371", // highlight wool fold
  
  // Medieval Leather Boots, Belt & Scabbard
  v: "#170f0a", // boot sole shadow
  w: "#2e1b10", // dark leather
  x: "#4f301d", // mid leather
  y: "#784b2e", // lit leather
  z: "#a86d44", // leather highlight & strap
  1: "#d49a65", // brass buckle / rivets
  
  // Fresh Baked Bread Loaf (Golden baguette)
  2: "#6b3d12", // dark crust
  3: "#a66321", // golden crust
  4: "#d98d36", // bright golden crust
  5: "#f5be64", // scored cut highlight
  6: "#fae8b6"  // flour dusting
})

ramps("ab", "cdefg", "hijk", "lmnop", "qrstu", "vwxyz1", "23456")

sprite("settler_baker_128", { w: 56, h: 136, outline: "a" }, (c) => {
  const ox = 28, oy = 132 // base anchor
  
  // 1. Soft Ground Ambient Occlusion Ellipse
  c.ellipse(ox, oy - 2, 20, 6, "b")
  c.ellipse(ox, oy - 2, 14, 4, "a")
  
  // 2. Heavy Medieval Leather Boots (h: 0 -> 20 px)
  // Left boot (front)
  c.rect(ox - 12, oy - 20, 10, 18, "w")
  c.rect(ox - 12, oy - 20, 10, 4, "y") // turnover cuff
  c.hline(ox - 12, oy - 16, 10, "z")
  c.rect(ox - 14, oy - 6, 12, 6, "v") // sole & toe box
  c.rect(ox - 13, oy - 4, 10, 3, "w")
  c.px(ox - 11, oy - 18, "1") // brass boot buckle
  
  // Right boot (receding)
  c.rect(ox + 2, oy - 18, 9, 16, "w")
  c.rect(ox + 2, oy - 18, 9, 4, "x")
  c.rect(ox + 1, oy - 5, 11, 5, "v")
  
  // 3. Wool Trousers (h: 20 -> 52 px)
  c.rect(ox - 11, oy - 52, 10, 34, "s")
  c.rect(ox + 2, oy - 52, 9, 36, "r") // shaded right leg
  c.vline(ox - 2, oy - 52, 32, "q") // deep inseam shadow
  c.vline(ox - 9, oy - 48, 24, "t") // lit crease on left leg
  c.vline(ox - 8, oy - 46, 20, "u")
  
  // 4. Baker's Long Linen Apron & Wool Tunic (h: 50 -> 92 px)
  c.rect(ox - 13, oy - 88, 26, 40, "n")
  // Folds and lighting across apron
  c.rect(ox - 13, oy - 88, 9, 40, "l") // deep shadow on left side
  c.rect(ox - 4, oy - 88, 12, 40, "o") // lit center bib
  c.rect(ox - 2, oy - 86, 7, 36, "p") // bright white center highlights
  c.rect(ox + 8, oy - 88, 5, 40, "m") // right rim shadow
  // Realistic cloth drapery creases at bottom hem
  for (let fx = ox - 12; fx < ox + 11; fx += 4) {
    c.line(fx, oy - 54, fx + 1, oy - 48, "l", 1)
    c.line(fx + 2, oy - 54, fx + 2, oy - 48, "p", 1)
  }
  
  // Heavy Tooled Leather Tool Belt (h: 70 -> 76 px)
  c.rect(ox - 13, oy - 74, 26, 4, "w")
  c.hline(ox - 13, oy - 74, 26, "y")
  c.rect(ox - 2, oy - 75, 5, 6, "1") // polished brass buckle
  c.rect(ox - 1, oy - 74, 3, 4, "a") // buckle inner prong
  // Leather side pouch hanging from belt
  c.rect(ox + 8, oy - 73, 6, 8, "x")
  c.hline(ox + 8, oy - 70, 6, "y")
  c.px(ox + 11, oy - 69, "1") // pouch button
  
  // 5. Arms, Sleeves & Hands holding Golden Bread Loaf
  // Rolled-up linen sleeves
  c.rect(ox - 16, oy - 90, 5, 20, "o")
  c.rect(ox - 16, oy - 90, 2, 20, "m")
  c.rect(ox - 16, oy - 72, 6, 4, "p") // rolled linen cuff
  // Left forearm & hand
  c.rect(ox - 14, oy - 70, 4, 10, "e")
  c.ellipse(ox - 9, oy - 62, 4, 4, "f") // left hand fingers
  
  // Right arm
  c.rect(ox + 11, oy - 90, 5, 20, "n")
  c.rect(ox + 11, oy - 72, 5, 4, "o") // rolled cuff
  c.rect(ox + 10, oy - 70, 4, 10, "d")
  c.ellipse(ox + 6, oy - 62, 4, 4, "f") // right hand fingers
  
  // Freshly Baked Crusty Bread Loaf (held in front)
  c.ellipse(ox - 1, oy - 64, 11, 7, "3")
  c.ellipse(ox - 1, oy - 65, 9, 5, "4")
  // Diagonal score marks dusted with white flour!
  c.line(ox - 7, oy - 67, ox - 4, oy - 62, "6", 1)
  c.line(ox - 2, oy - 67, ox + 1, oy - 62, "6", 1)
  c.line(ox + 3, oy - 67, ox + 6, oy - 62, "6", 1)
  c.line(ox - 6, oy - 66, ox - 3, oy - 63, "5", 1)
  c.line(ox - 1, oy - 66, ox + 2, oy - 63, "5", 1)
  
  // 6. Neck, Face & Medieval Grooming (h: 90 -> 112 px)
  c.rect(ox - 4, oy - 96, 8, 6, "d") // muscular neck
  c.vline(ox - 2, oy - 96, 6, "c")
  
  // Head & Jaw (Anatomy)
  c.ellipse(ox, oy - 104, 8, 10, "e")
  c.ellipse(ox, oy - 105, 7, 8, "f")
  
  // Full Bushy Baker's Beard & Handlebar Mustache
  c.rect(ox - 6, oy - 102, 13, 8, "i")
  c.ellipse(ox, oy - 98, 6, 4, "h")
  // Individual hair strands on beard
  for (let hx = ox - 5; hx <= ox + 5; hx += 2) {
    c.line(hx, oy - 101, hx, oy - 96, "j", 1)
  }
  // Mustache tips curling slightly
  c.line(ox - 7, oy - 102, ox - 1, oy - 101, "k", 1)
  c.line(ox + 1, oy - 101, ox + 7, oy - 102, "k", 1)
  
  // Eyes, Brows, Nose Bridge & Cheek
  c.px(ox - 4, oy - 107, "a"); c.px(ox - 3, oy - 107, "h") // left eye & pupil
  c.px(ox + 3, oy - 107, "a"); c.px(ox + 4, oy - 107, "h") // right eye & pupil
  c.hline(ox - 5, oy - 109, 3, "h") // left brow
  c.hline(ox + 3, oy - 109, 3, "h") // right brow
  // Chiseled Nose
  c.rect(ox - 1, oy - 108, 2, 5, "f")
  c.px(ox - 1, oy - 105, "g") // nose tip specular
  c.px(ox - 5, oy - 105, "d") // cheek shadow
  c.px(ox + 5, oy - 105, "d")
  
  // 7. Baker's Traditional Pleated Linen Toque (h: 110 -> 128 px)
  c.rect(ox - 8, oy - 114, 16, 5, "o") // hat band
  c.hline(ox - 8, oy - 115, 16, "p") // band upper highlight
  c.hline(ox - 8, oy - 110, 16, "l") // band lower crease
  // Pleated puffy crown billowing up
  c.ellipse(ox, oy - 120, 12, 8, "p")
  c.ellipse(ox - 1, oy - 121, 10, 6, "p")
  // Vertical fabric pleats
  for (let px = ox - 7; px <= ox + 7; px += 3) {
    c.line(px, oy - 125, px, oy - 115, "n", 1)
    c.line(px + 1, oy - 125, px + 1, oy - 115, "p", 1)
  }
  // Exact 128px crest!
  c.px(ox, oy - 127, "p")
  c.px(ox - 1, oy - 128, "p")
})
