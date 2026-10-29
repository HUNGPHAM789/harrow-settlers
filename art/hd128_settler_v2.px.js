// 128px Ultra HD Settler Baker (v2: Stocky, Volumetric & Ultra-Detailed)
// Height: 128px (71 px/m)
// Bavarian Master Baker "Hans" with heavy volumetric build, broad barrel chest,
// rolled-up sleeves, baker's peel, leather tool belt, flour dust smudges, and expressive face.

pal({
  a: "#110b17", // deep ink contour
  b: "#1f1526", // ambient occlusion shadow
  
  // Skin & Facial Tones (Warm European 5-tone ramp)
  c: "#542c19", // deepest skin crease
  d: "#854528", // skin shadow
  e: "#b86a3d", // mid warm skin
  f: "#e09367", // lit healthy sunlit skin
  g: "#fac29d", // bright highlight nose/cheek
  
  // Facial Features, Eyes & Beard
  h: "#211107", // dark pupil & deep beard shadow
  i: "#3d1f0d", // dark chestnut beard
  j: "#693819", // mid chestnut hair/beard
  k: "#9c572a", // lit hair/beard strands
  l: "#c77c48", // sunlit hair highlight
  w: "#ffffff", // crisp white eye sclera & specular catchlight
  
  // Baker's White Linen Cap, Apron & Undershirt (Rich Fabric Weave)
  m: "#3f3b4d", // deepest cloth fold
  n: "#615c73", // shadow linen
  o: "#8c869e", // mid shadow linen
  p: "#bbb5cc", // mid lit linen
  q: "#ded9eb", // lit white linen
  r: "#f8f5fc", // sunlit crisp white highlight
  
  // Baker's Woolen Trousers (Warm Medieval Russet / Bavarian Wool)
  s: "#241710", // wool shadow seam
  t: "#3d271c", // dark wool
  u: "#613f2d", // mid russet wool
  v: "#8c5c43", // lit wool
  x: "#b87e5e", // sunlit wool fold
  
  // Heavy Leather Work Boots, Tool Belt & Straps
  y: "#140c07", // boot sole & deep leather shadow
  z: "#29170e", // dark oiled leather
  1: "#472819", // mid leather
  2: "#6e412a", // lit leather
  3: "#9c603e", // leather edge highlight
  4: "#c78659", // worn leather crease
  5: "#f5b838", // polished brass buckle & rivets
  6: "#fff28a", // brass specular shine
  
  // Carved Ash Baker's Peel (Wooden Paddle)
  7: "#422813", // wood shadow
  8: "#704825", // dark wood
  9: "#a36e3c", // mid pine/ash wood
  A: "#d49959", // lit wood plank
  B: "#f7c788", // wood edge highlight
  
  // Fresh Baked Artisanal Sourdough Loaf
  C: "#542b08", // dark caramelized crust
  D: "#8c4d14", // golden-brown crust
  E: "#bf7326", // rich golden crust
  F: "#e89e3a", // bright crust scoring
  G: "#fae09d", // white flour scored dusting
  
  // Chalky White Flour Smudges (On Apron & Cheeks)
  H: "#ece8f7"
})

ramps("ab", "cdefg", "hijkl", "mnopqr", "stuvx", "yz1234", "56", "789AB", "CDEFG")

sprite("settler_baker_128_v2", { w: 72, h: 136, outline: "a" }, (c) => {
  const ox = 36, oy = 132 // base anchor
  
  // =========================================================================
  // 1. GROUND AMBIENT OCCLUSION SHADOW (Multi-Layer Depth)
  // =========================================================================
  c.ellipse(ox, oy - 2, 28, 8, "b")
  c.ellipse(ox, oy - 2, 22, 6, "a")
  c.ellipse(ox - 6, oy - 2, 14, 4, "a")
  
  // =========================================================================
  // 2. HEAVY MEDIEVAL LEATHER WORK BOOTS (h: 0 -> 24 px)
  // Robust, thick wooden/leather soles, wide toe boxes, folded cuffs with buckles
  // =========================================================================
  // LEFT BOOT (Forward Stance, w: 18px, h: 22px)
  // Thick sole & heel
  c.rect(ox - 22, oy - 4, 18, 4, "y")
  c.rect(ox - 21, oy - 3, 16, 2, "z")
  // Boot upper & instep
  c.rect(ox - 21, oy - 18, 16, 15, "1")
  c.rect(ox - 20, oy - 17, 7, 13, "z") // left shadow side
  c.rect(ox - 13, oy - 17, 7, 13, "2") // lit instep
  c.vline(ox - 10, oy - 15, 10, "3")  // bright leather crease
  // Turned-over leather cuff
  c.rect(ox - 22, oy - 22, 18, 6, "2")
  c.hline(ox - 22, oy - 22, 18, "3")
  c.hline(ox - 22, oy - 17, 18, "z")
  // Brass side buckle & strap
  c.rect(ox - 22, oy - 20, 4, 4, "5")
  c.px(ox - 21, oy - 19, "6")
  // Flour dust on toe box
  c.px(ox - 19, oy - 6, "H")
  c.px(ox - 18, oy - 5, "H")
  
  // RIGHT BOOT (Receding Stance, w: 16px, h: 20px)
  // Sole & heel
  c.rect(ox + 4, oy - 4, 16, 4, "y")
  c.rect(ox + 5, oy - 3, 14, 2, "z")
  // Boot upper
  c.rect(ox + 4, oy - 17, 15, 14, "z")
  c.rect(ox + 8, oy - 17, 9, 13, "1")
  // Cuff
  c.rect(ox + 3, oy - 21, 16, 5, "1")
  c.hline(ox + 3, oy - 21, 16, "2")
  c.hline(ox + 3, oy - 17, 16, "y")
  c.px(ox + 6, oy - 19, "5")
  
  // =========================================================================
  // 3. WOOLEN RUSSET TROUSERS (h: 20 -> 60 px)
  // Thick medieval woolen breeches, sturdy legs (each leg 16px wide!)
  // =========================================================================
  // Left leg (forward, broad)
  c.rect(ox - 20, oy - 58, 16, 38, "u")
  c.rect(ox - 20, oy - 58, 6, 38, "t")  // outer shadow side
  c.rect(ox - 14, oy - 58, 8, 38, "v")  // lit front thigh
  c.vline(ox - 10, oy - 54, 28, "x")   // bright highlight crease down thigh
  // Knee bend folds
  c.line(ox - 18, oy - 34, ox - 12, oy - 32, "t", 2)
  c.line(ox - 18, oy - 30, ox - 12, oy - 28, "s", 1)
  c.line(ox - 11, oy - 33, ox - 8, oy - 31, "x", 1)
  
  // Inseam deep shadow
  c.rect(ox - 4, oy - 58, 7, 36, "s")
  
  // Right leg (receding)
  c.rect(ox + 3, oy - 56, 15, 36, "t")
  c.rect(ox + 7, oy - 56, 9, 36, "u")
  c.vline(ox + 11, oy - 52, 24, "v")
  c.line(ox + 4, oy - 34, ox + 10, oy - 32, "s", 2)
  
  // =========================================================================
  // 4. BAKER'S LINEN APRON & TUNIC (h: 56 -> 100 px)
  // Broad barrel chest (width 44px!), heavy linen drapery with natural folds
  // =========================================================================
  // Base apron canvas (width 38px at waist, 42px across hips)
  c.rect(ox - 19, oy - 94, 38, 40, "p")
  
  // 3D Lighting across apron:
  // Deep left shadow fold
  c.rect(ox - 19, oy - 94, 10, 40, "n")
  c.vline(ox - 18, oy - 92, 36, "m")
  // Midtone body
  c.rect(ox - 9, oy - 94, 18, 40, "q")
  // Bright center highlights
  c.rect(ox - 5, oy - 92, 10, 36, "r")
  // Right rim shadow
  c.rect(ox + 9, oy - 94, 10, 40, "o")
  
  // Drapery folds at apron bottom hem
  for (let hx = ox - 17; hx <= ox + 15; hx += 5) {
    c.line(hx, oy - 58, hx + 1, oy - 54, "n", 2)
    c.line(hx + 2, oy - 58, hx + 2, oy - 54, "r", 1)
  }
  
  // Large Kangaroo Front Pocket (for bakery tools)
  c.rect(ox - 14, oy - 80, 28, 14, "o")
  c.rect(ox - 13, oy - 79, 26, 12, "p")
  c.hline(ox - 13, oy - 80, 26, "n") // pocket hem seam
  c.hline(ox - 13, oy - 79, 26, "r")
  // Sticking out of pocket: Wooden Scoring Lame (bread knife handle)
  c.line(ox - 10, oy - 84, ox - 7, oy - 79, "A", 2)
  c.line(ox - 9, oy - 85, ox - 8, oy - 84, "B", 1)
  // Wooden rolling pin handle
  c.rect(ox + 6, oy - 86, 4, 8, "9")
  c.rect(ox + 7, oy - 86, 2, 8, "A")
  c.px(ox + 8, oy - 87, "B")
  
  // AUTHENTIC WHITE FLOUR SMUDGES on Apron!
  c.ellipse(ox - 4, oy - 70, 7, 5, "H")
  c.ellipse(ox - 4, oy - 70, 4, 3, "r")
  c.ellipse(ox + 8, oy - 64, 5, 4, "H")
  c.px(ox - 12, oy - 66, "H")
  c.px(ox - 11, oy - 65, "H")
  c.px(ox + 12, oy - 72, "H")
  
  // Leather Shoulder Straps holding Apron (Cross-chest)
  c.line(ox - 15, oy - 98, ox - 12, oy - 84, "1", 2)
  c.line(ox - 14, oy - 98, ox - 11, oy - 84, "2", 1)
  c.px(ox - 12, oy - 84, "5") // brass rivet
  c.line(ox + 14, oy - 98, ox + 11, oy - 84, "z", 2)
  c.px(ox + 11, oy - 84, "5")
  
  // =========================================================================
  // 5. HEAVY TOOLED LEATHER TOOL BELT (h: 76 -> 82 px)
  // 6px thick oiled leather, large brass buckle, brass key ring with 3 keys
  // =========================================================================
  c.rect(ox - 20, oy - 82, 40, 6, "z")
  c.hline(ox - 20, oy - 82, 40, "2")
  c.hline(ox - 20, oy - 77, 40, "y")
  // Heavy Polished Brass Buckle (Center)
  c.rect(ox - 4, oy - 83, 8, 8, "5")
  c.rect(ox - 2, oy - 82, 4, 6, "a") // buckle inner hole
  c.rect(ox - 3, oy - 83, 2, 2, "6") // buckle glint
  c.vline(ox, oy - 82, 6, "5")       // buckle tongue/prong
  
  // Leather side utility pouch (Left side)
  c.rect(ox - 21, oy - 81, 7, 10, "1")
  c.rect(ox - 20, oy - 80, 5, 8, "2")
  c.hline(ox - 21, oy - 77, 7, "z")  // pouch flap
  c.px(ox - 18, oy - 76, "5")        // brass button
  
  // Wrought Iron Skeleton Keys hanging on ring (Right side)
  c.px(ox + 14, oy - 76, "5") // brass ring
  c.line(ox + 13, oy - 75, ox + 13, oy - 70, "a", 1) // key 1
  c.px(ox + 14, oy - 71, "a")
  c.line(ox + 15, oy - 75, ox + 15, oy - 68, "y", 1) // key 2
  c.px(ox + 16, oy - 69, "y")
  
  // =========================================================================
  // 6. SHOULDERS, MUSCULAR ARMS & SLEEVES (Width: 62px across!)
  // =========================================================================
  // Rolled-up linen sleeves over muscular arms
  // Left shoulder & sleeve (Broad, powerful)
  c.rect(ox - 28, oy - 100, 12, 14, "n")
  c.rect(ox - 26, oy - 100, 8, 13, "q")
  c.rect(ox - 24, oy - 98, 5, 10, "r")
  // Rolled-up sleeve cuff (thick fabric donut)
  c.rect(ox - 29, oy - 88, 12, 5, "q")
  c.hline(ox - 29, oy - 88, 12, "r")
  c.hline(ox - 29, oy - 84, 12, "o")
  
  // Left Muscular Forearm (10px wide!)
  c.rect(ox - 27, oy - 83, 9, 14, "d")
  c.rect(ox - 25, oy - 83, 6, 14, "e")
  c.vline(ox - 23, oy - 82, 12, "f") // bicep/forearm muscle lit ridge
  
  // Left Hand (Strong grip on baker's peel handle)
  c.rect(ox - 27, oy - 70, 9, 7, "d")
  c.rect(ox - 26, oy - 69, 7, 5, "e")
  c.px(ox - 24, oy - 68, "f") // knuckle highlights
  c.px(ox - 22, oy - 68, "f")
  c.px(ox - 20, oy - 68, "f")
  
  // Right shoulder & sleeve
  c.rect(ox + 16, oy - 100, 12, 14, "n")
  c.rect(ox + 17, oy - 100, 9, 13, "p")
  c.rect(ox + 19, oy - 98, 6, 10, "q")
  // Rolled-up sleeve cuff
  c.rect(ox + 17, oy - 88, 12, 5, "p")
  c.hline(ox + 17, oy - 88, 12, "q")
  c.hline(ox + 17, oy - 84, 12, "m")
  
  // Right Forearm & Hand (Carrying freshly baked loaf or resting on waist)
  c.rect(ox + 18, oy - 83, 9, 14, "d")
  c.rect(ox + 19, oy - 83, 6, 14, "e")
  c.rect(ox + 17, oy - 70, 8, 7, "d")
  c.rect(ox + 18, oy - 69, 6, 5, "e")
  c.px(ox + 19, oy - 68, "f")
  c.px(ox + 21, oy - 68, "f")
  
  // =========================================================================
  // 7. CARVED WOODEN BAKER'S PEEL & FRESH SOURDOUGH LOAF
  // Long ash wood handle extending down to ground, angled paddle holding a bread loaf!
  // =========================================================================
  // Peel Handle (Long wooden staff passing through left hand)
  c.line(ox - 23, oy - 98, ox - 23, oy - 10, "8", 2)
  c.line(ox - 22, oy - 98, ox - 22, oy - 10, "A", 1)
  c.line(ox - 24, oy - 98, ox - 24, oy - 10, "7", 1)
  
  // Flat Wooden Paddle Blade (at top / chest level)
  c.rect(ox - 33, oy - 110, 16, 14, "8")
  c.rect(ox - 32, oy - 109, 14, 12, "9")
  c.rect(ox - 31, oy - 108, 12, 10, "A")
  c.hline(ox - 32, oy - 110, 14, "B")
  
  // Fresh Crusty Golden Sourdough Loaf on the paddle!
  c.ellipse(ox - 25, oy - 106, 8, 6, "D")
  c.ellipse(ox - 25, oy - 107, 7, 5, "E")
  // Artisanal scored wheat pattern dusted with flour
  c.line(ox - 28, oy - 107, ox - 23, oy - 104, "G", 1)
  c.line(ox - 26, oy - 109, ox - 22, oy - 106, "G", 1)
  c.px(ox - 25, oy - 108, "F")
  c.px(ox - 24, oy - 106, "F")
  
  // =========================================================================
  // 8. MUSCULAR NECK, HEAD & REALISTIC EXPRESSIVE FACE (h: 96 -> 120 px)
  // Broad neck (12px), defined chin, bushy mustache, white sclera & catchlight eyes
  // =========================================================================
  // Thick neck
  c.rect(ox - 6, oy - 104, 12, 8, "d")
  c.rect(ox - 3, oy - 104, 8, 8, "e")
  c.vline(ox, oy - 104, 6, "f") // windpipe highlight
  
  // Head & Facial Structure (w: 20px, h: 18px)
  c.ellipse(ox, oy - 112, 10, 9, "e")
  c.ellipse(ox + 1, oy - 113, 9, 8, "f")
  
  // Warm ruddy cheeks
  c.ellipse(ox - 4, oy - 111, 3, 2, "e")
  c.ellipse(ox + 5, oy - 111, 3, 2, "e")
  // Flour smudge on left cheek!
  c.px(ox - 5, oy - 111, "H")
  c.px(ox - 4, oy - 111, "H")
  
  // Full Bushy Baker's Beard & Handlebar Mustache
  c.rect(ox - 7, oy - 110, 15, 8, "i")
  c.ellipse(ox + 1, oy - 106, 7, 4, "h")
  // Multi-tone hair strands on chin beard
  for (let bx = ox - 6; bx <= ox + 6; bx += 2) {
    c.line(bx, oy - 108, bx, oy - 104, "j", 1)
    c.px(bx + 1, oy - 106, "k")
  }
  // Curled Handlebar Mustache
  c.line(ox - 8, oy - 110, ox, oy - 109, "k", 2)
  c.line(ox, oy - 109, ox + 8, oy - 110, "k", 2)
  c.px(ox - 9, oy - 111, "l") // curled tip left
  c.px(ox + 9, oy - 111, "l") // curled tip right
  
  // Realistic Eyes (White sclera, brown iris, catchlight!)
  // Left eye
  c.rect(ox - 6, oy - 115, 4, 2, "w") // white sclera
  c.px(ox - 5, oy - 115, "h")         // brown iris & pupil
  c.px(ox - 6, oy - 116, "w")         // specular catchlight
  c.hline(ox - 7, oy - 116, 5, "i")   // upper lash & shadow
  c.hline(ox - 7, oy - 117, 5, "j")   // bushy eyebrow
  
  // Right eye
  c.rect(ox + 2, oy - 115, 4, 2, "w")
  c.px(ox + 3, oy - 115, "h")
  c.px(ox + 2, oy - 116, "w")
  c.hline(ox + 1, oy - 116, 5, "i")
  c.hline(ox + 1, oy - 117, 5, "j")
  
  // Well-modeled nose bridge
  c.vline(ox - 1, oy - 114, 5, "f")
  c.vline(ox, oy - 114, 5, "g") // lit bridge
  c.px(ox - 2, oy - 110, "d")   // left nostril shadow
  c.px(ox + 1, oy - 110, "d")   // right nostril shadow
  
  // =========================================================================
  // 9. BAKER'S WHITE LINEN TOQUE / FLOATING FLOPPY BERET (h: 116 -> 132 px)
  // Traditional baker's bonnet (w: 32px, h: 16px!), puffed out with soft cloth folds!
  // =========================================================================
  // Headband band around forehead
  c.rect(ox - 9, oy - 120, 19, 4, "o")
  c.hline(ox - 9, oy - 120, 19, "r")
  c.hline(ox - 9, oy - 117, 19, "n")
  
  // Puffed Linen Crown (Billowing out to the left and top)
  c.ellipse(ox - 1, oy - 126, 16, 8, "p")
  c.ellipse(ox - 1, oy - 127, 14, 7, "q")
  c.ellipse(ox, oy - 128, 12, 6, "r")
  
  // Deep sculptural cloth gathers & seams on cap
  c.line(ox - 12, oy - 123, ox - 6, oy - 129, "n", 2)
  c.line(ox - 5, oy - 123, ox, oy - 130, "o", 1)
  c.line(ox + 3, oy - 123, ox + 6, oy - 129, "n", 2)
  c.line(ox - 10, oy - 124, ox - 4, oy - 130, "r", 1)
  c.line(ox - 2, oy - 125, ox + 3, oy - 131, "r", 1)
  
  // Sunlit rim highlight on top of cap
  c.hline(ox - 6, oy - 132, 12, "r")
})
