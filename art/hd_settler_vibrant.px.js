// Vibrant Modern HD Settler Baker (75px, Authentic Settlers II Warm Harmony)
// Fits naturally in the 85px doorway of b_hd_bakery_vibrant

pal({
  a: "#16111e", // contour
  b: "#22192b", // shadow
  
  // Sunny European Skin
  c: "#6e3b20", // skin shadow
  d: "#a65e36", // skin mid
  e: "#d98d5f", // skin lit
  f: "#f7bfa1", // skin highlight / nose
  
  // Chestnut Hair & Beard
  g: "#2e190d", // dark beard
  h: "#543018", // mid brown
  i: "#824e29", // lit hair strands
  
  // Clean Baker's White Linen Apron & Toque
  j: "#5c5666", // linen crease
  k: "#878094", // linen shadow
  l: "#bcb5cc", // mid linen
  m: "#e6e0f2", // lit white linen
  n: "#ffffff", // bright white highlight
  
  // Honey Wool Tunic & Trousers
  o: "#2e1b10", // wool shadow
  p: "#573520", // dark wool
  q: "#8a5734", // mid wool
  r: "#ba794a", // lit honey wool
  s: "#e09f6e", // highlight
  
  // Sturdy Leather Boots & Belt
  t: "#1c1109", // sole
  u: "#3b2313", // dark leather
  v: "#633c20", // mid leather
  w: "#915b31", // lit leather
  x: "#be7c46", // cuff highlight
  y: "#f5b838", // brass buckle
  
  // Fresh Golden Baguette Loaf
  z: "#8a501a", // dark crust
  1: "#c47a27", // golden crust
  2: "#f5aa42", // bright crust
  3: "#fae091"  // flour dusting
})

ramps("ab", "cdef", "ghi", "jklmn", "opqrs", "tuvwxy", "z123")

sprite("settler_baker_75", { w: 38, h: 78, outline: "a" }, (c) => {
  const ox = 19, oy = 76
  
  // Soft Ground Contact Shadow
  c.ellipse(ox, oy - 2, 12, 5, "b")
  c.ellipse(ox, oy - 2, 9, 3, "a")
  
  // 1. Leather Boots (h: 0 -> 12 px)
  // Left boot
  c.rect(ox - 7, oy - 12, 6, 11, "u")
  c.rect(ox - 7, oy - 12, 6, 3, "w") // turnover cuff
  c.rect(ox - 8, oy - 4, 7, 4, "t") // sole
  c.px(ox - 6, oy - 11, "y") // brass buckle
  
  // Right boot
  c.rect(ox + 1, oy - 11, 6, 10, "u")
  c.rect(ox + 1, oy - 11, 6, 3, "v")
  c.rect(ox + 1, oy - 3, 7, 3, "t")
  
  // 2. Honey Wool Trousers (h: 12 -> 30 px)
  c.rect(ox - 7, oy - 30, 6, 19, "q")
  c.rect(ox + 1, oy - 30, 6, 20, "p") // shadow side
  c.vline(ox - 1, oy - 30, 18, "o") // inseam shadow
  c.vline(ox - 5, oy - 28, 14, "r") // lit crease
  
  // 3. Baker's Crisp White Linen Apron & Tunic (h: 28 -> 54 px)
  c.rect(ox - 8, oy - 52, 16, 24, "l")
  c.rect(ox - 8, oy - 52, 5, 24, "j") // left shadow
  c.rect(ox - 3, oy - 52, 8, 24, "m") // lit center
  c.rect(ox - 1, oy - 50, 4, 20, "n") // bright white highlight
  
  // Leather belt with brass buckle
  c.hline(ox - 8, oy - 43, 16, "u")
  c.rect(ox - 2, oy - 44, 4, 4, "y")
  c.px(ox - 1, oy - 43, "a")
  
  // 4. Arms & Hands holding fresh golden bread loaf
  c.rect(ox - 10, oy - 53, 3, 13, "q")
  c.ellipse(ox - 6, oy - 40, 2, 2, "d") // left hand
  c.rect(ox + 7, oy - 53, 3, 13, "p")
  c.ellipse(ox + 4, oy - 40, 2, 2, "d") // right hand
  
  // Golden crust baguette loaf!
  c.ellipse(ox - 1, oy - 41, 6, 4, "1")
  c.ellipse(ox - 1, oy - 42, 5, 3, "2")
  c.px(ox - 2, oy - 42, "3") // flour dusted score
  c.px(ox + 1, oy - 42, "3")
  
  // 5. Neck & Face (h: 54 -> 66 px)
  c.rect(ox - 2, oy - 56, 5, 3, "c")
  c.ellipse(ox, oy - 61, 5, 6, "d")
  c.ellipse(ox, oy - 62, 4, 5, "e")
  
  // Trimmed chestnut beard & mustache
  c.rect(ox - 4, oy - 59, 8, 4, "h")
  c.px(ox - 1, oy - 56, "g")
  c.px(ox, oy - 56, "g")
  // Eyes, nose & cheek
  c.px(ox - 2, oy - 63, "a"); c.px(ox + 2, oy - 63, "a")
  c.px(ox, oy - 62, "f") // nose bridge
  
  // 6. Baker's Traditional Pleated Linen Toque (h: 66 -> 75 px)
  c.rect(ox - 5, oy - 67, 10, 3, "m") // hat band
  c.ellipse(ox, oy - 71, 7, 5, "n") // puffy crown
  c.ellipse(ox - 1, oy - 72, 6, 4, "n")
  c.vline(ox - 3, oy - 73, 4, "l") // pleats
  c.vline(ox + 2, oy - 73, 4, "l")
  c.px(ox, oy - 74, "n") // 75px peak!
})
