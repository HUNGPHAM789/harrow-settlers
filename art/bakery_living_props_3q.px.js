// Bakery living diorama props v2 — authored for the approved Chibi Baker character standard.
// Every object is drawn in a consistent 3/4 isometric view with visible top, front and right faces.
include("settler_rig.px.js")

const P = {
  ink: "#241724", shadow: "#3a2930", stoneD: "#4d5264", stone: "#747c91", stoneL: "#aab0bd", stoneHi: "#d5cfbd",
  oakD: "#542b18", oak: "#89502b", oakM: "#b8733d", oakL: "#e0a05b", oakHi: "#f1c47b",
  ironD: "#313646", iron: "#565e70", ironL: "#8990a1", ironHi: "#c2c3bb",
  flourD: "#967b51", flour: "#d2b984", flourL: "#f1dfb2", cream: "#fff1ce",
  emberD: "#aa3518", ember: "#ed681f", emberL: "#ffb438", emberHi: "#fff18a",
  leafD: "#315d39", leaf: "#4f8a4b", leafL: "#8bbb62", red: "#bc4537", gold: "#f5c44e",
}

// 1. Walk-in stone hearth. The top cap and right return make the 3/4 orientation unambiguous.
sprite("prop_bakery_hearth_3q", { w: 70, h: 72 }, c => {
  // grounding shadow and stone plinth, top plane, front plane, shaded right return
  c.ellipse(35, 65, 31, 6, P.ink)
  c.poly([8,46, 37,37, 63,46, 34,56], P.ink)
  c.poly([8,46, 34,56, 34,67, 8,57], P.stoneD)
  c.poly([34,56, 63,46, 63,57, 34,67], P.shadow)
  c.poly([8,44, 36,34, 64,44, 35,55], P.stoneL)
  c.poly([8,44, 35,55, 35,59, 8,49], P.stone)
  c.poly([35,55, 64,44, 64,49, 35,59], P.stoneD)
  // individually keyed ashlar blocks follow the perspective edges
  c.line(11,47,33,55,P.stoneHi); c.line(39,54,61,46,P.ironL)
  c.line(8,52,34,62,P.ironD); c.line(36,62,63,52,P.ink)
  c.line(20,49,20,55,P.stoneD); c.line(48,50,48,57,P.shadow)
  c.px(13,48,P.stoneHi); c.px(30,55,P.ironL); c.px(59,48,P.ironHi)
  // deep arched mouth with layered voussoirs and firebox depth
  c.ellipse(35,42,17,15,P.ink); c.rect(18,42,34,16,P.ink)
  c.ellipse(35,43,13,12,P.ironD); c.rect(22,43,26,13,P.ironD)
  c.ellipse(35,48,9,8,P.emberD); c.rect(26,48,18,8,P.emberD)
  c.ellipse(35,51,7,5,P.ember); c.rect(28,51,14,5,P.ember)
  c.poly([30,53,35,46,39,53,37,57,32,57],P.emberL); c.px(35,51,P.emberHi)
  c.ellipse(35,42,17,15,P.iron); c.rect(18,42,34,3,P.iron)
  c.ellipse(35,43,13,11,P.ink); c.rect(22,43,26,11,P.ink)
  // wedge stone blocks around the arch, placed in the same light direction
  c.line(20,34,24,31,P.stoneHi); c.line(23,37,28,33,P.stoneL); c.line(29,30,32,29,P.stoneHi)
  c.line(41,29,45,31,P.stoneL); c.line(46,32,50,36,P.stone); c.line(49,39,52,42,P.ironL)
  c.line(19,47,23,48,P.stoneHi); c.line(48,47,52,46,P.stoneL)
  // oven hood/dome with layered curved silhouette, soot edge and top highlight
  c.poly([13,37, 14,27, 20,20, 28,16, 39,15, 49,20, 56,28, 57,38, 49,43, 22,43],P.ink)
  c.poly([15,35, 16,28, 22,21, 30,18, 39,18, 48,22, 54,29, 55,37, 48,41, 23,41],P.oakD)
  c.poly([17,33, 18,27, 24,22, 31,20, 39,20, 47,24, 52,30, 53,36, 47,39, 24,39],P.oakM)
  c.line(20,29,24,24,P.oakL); c.line(25,23,31,21,P.oakHi); c.line(34,20,41,21,P.oakL)
  c.line(45,24,49,28,P.oak); c.line(49,31,51,35,P.oakD)
  // brick courses, mortar joints, soot streaks, iron damper and rivets
  c.line(21,31,31,27,P.oakD); c.line(33,26,45,29,P.oakD); c.line(19,35,30,32,P.oakL); c.line(34,32,50,35,P.oakD)
  c.rect(30,23,12,4,P.ironD); c.rect(32,24,8,2,P.ironL); c.px(32,25,P.gold); c.px(39,25,P.ink)
  c.line(26,36,28,38,P.ironD); c.line(43,36,45,38,P.ironD)
  // Front arch is drawn last so it reads clearly over the curved oven hood.
  c.ellipse(35,42,17,15,P.stoneD); c.rect(18,42,34,15,P.stoneD)
  c.ellipse(35,42,14,12,P.stoneL); c.rect(21,42,28,13,P.stoneL)
  c.line(20,42,22,38,P.stoneHi); c.line(24,36,27,34,P.cream); c.line(43,35,47,38,P.stoneHi)
  c.ellipse(35,43,11,10,P.ink); c.rect(24,43,22,12,P.ink)
  c.ellipse(35,50,8,6,P.emberD); c.rect(27,50,16,5,P.emberD)
  c.poly([30,53,35,46,40,53,38,57,32,57],P.emberL); c.px(35,50,P.emberHi)
  c.line(19,48,22,49,P.ironHi); c.line(48,49,51,47,P.ironL)
  c.line(22,56,32,59,P.stoneHi); c.line(38,59,49,55,P.stone)
  c.px(25,45,P.gold); c.px(45,45,P.ironHi)
  // compact chimney with angled cap
  c.poly([45,13,54,10,61,13,52,17],P.ink); c.poly([45,5,54,2,61,5,52,9],P.ironL)
  c.poly([45,5,52,9,52,17,45,13],P.ironD); c.poly([52,9,61,5,61,13,52,17],P.iron)
  c.line(47,7,53,10,P.ironHi); c.line(55,10,59,8,P.ironL)
  c.rect(48,17,6,3,P.ironD); c.px(50,18,P.ironHi)
  // shaped smoke wisps read as a living effect, not a flat gray blob
  c.ellipse(54,4,3,2,"#c7c5c1"); c.ellipse(60,7,2,1,"#858a9a"); c.px(58,9,"#ddd6c5")
})

// 2. Dough table: broad rhombus top, two visible apron planes, pegged legs and bakery tools.
sprite("prop_bakery_dough_table_3q", { w: 78, h: 58 }, c => {
  c.ellipse(39,52,34,5,P.ink)
  c.poly([8,33, 39,21, 70,32, 39,44],P.ink)
  c.poly([10,31, 39,20, 68,31, 39,42],P.oakL)
  c.poly([10,31, 39,42, 39,47, 10,36],P.oak)
  c.poly([39,42, 68,31, 68,36, 39,47],P.oakD)
  // plank seams and rounded, worn leading edge
  c.line(17,30,45,40,P.oakHi); c.line(28,26,57,36,P.oakM); c.line(39,23,64,32,P.oakHi)
  c.line(13,34,37,43,P.oakHi); c.line(43,42,63,34,P.oak)
  c.px(18,33,P.ironD); c.px(58,34,P.ironD); c.px(35,41,P.ironD)
  // drawer and iron pull on the front plane
  c.poly([19,34, 37,41, 37,45, 19,38],P.oakD); c.line(22,36,34,41,P.oakM)
  c.line(28,39,33,41,P.ironHi,2); c.px(29,39,P.ironD)
  // splayed near/far legs and cross brace; front legs slightly brighter
  c.poly([13,36,19,38,18,52,12,50],P.oakD); c.line(14,39,17,40,P.oakL)
  c.poly([34,45,40,47,40,56,34,54],P.oakD); c.line(35,48,38,49,P.oakL)
  c.poly([61,37,66,35,66,49,61,51],P.shadow); c.line(62,39,64,38,P.oakM)
  c.line(17,48,37,53,P.oak); c.line(37,53,63,46,P.oakD)
  // flour sack, dough, scoring and a turned wood rolling pin
  c.poly([18,20, 22,17, 29,18, 32,22, 30,28, 21,29, 17,25],P.ink)
  c.poly([19,21, 23,18, 28,19, 30,22, 29,27, 22,28, 18,25],P.flour)
  c.line(21,22,28,22,P.flourL); c.line(20,25,27,26,P.flourD); c.line(22,19,25,19,P.cream)
  c.ellipse(49,27,8,4,P.ink); c.ellipse(49,26,7,3,P.cream); c.line(45,26,50,25,P.flour)
  c.ellipse(55,23,4,3,P.oakD); c.rect(43,21,15,3,P.oakL); c.ellipse(43,22,2,2,P.oakHi); c.ellipse(58,22,2,2,P.oak)
  c.px(37,29,P.flourL); c.px(39,28,P.flour); c.px(41,30,P.cream)
})

// 3. Hand-woven basket shown from above and from two sides; each loaf has its own silhouette.
sprite("prop_bakery_bread_basket_3q", { w: 50, h: 42 }, c => {
  c.ellipse(25,37,21,4,P.ink)
  c.poly([5,19,25,10,45,19,25,29],P.ink)
  c.poly([6,19,25,28,25,38,6,28],P.oakD)
  c.poly([25,28,45,19,45,29,25,38],P.shadow)
  c.poly([7,17,25,9,43,17,25,26],P.oakL)
  c.poly([7,17,25,26,25,29,7,20],P.oak)
  c.poly([25,26,43,17,43,20,25,29],P.oakD)
  // over-under wicker weave bends around the visible corners
  for(let y=22;y<35;y+=4){c.line(9,y,23,y+7,P.oakL);c.line(27,y+7,42,y,P.oakM)}
  for(let x=11;x<24;x+=5)c.line(x,22,x,32,P.oakHi)
  for(let x=29;x<42;x+=5)c.line(x,22,x,32,P.oak)
  c.line(7,18,25,27,P.oakHi); c.line(25,27,43,18,P.oakL); c.line(8,21,24,29,P.oakD)
  // folded rim, wicker handle arches behind bread
  c.line(6,17,25,8,P.oakD,3); c.line(25,8,44,17,P.oakD,3)
  c.line(7,16,25,7,P.oakHi); c.line(25,7,43,16,P.oakL)
  // three warm loaves, with shaded undersides, scored crust and sesame flecks
  c.ellipse(17,14,7,5,P.ink); c.ellipse(17,13,6,4,P.oakD); c.ellipse(17,12,5,3,P.oakL)
  c.line(14,11,16,10,P.cream); c.line(17,12,19,11,P.flourL); c.px(15,13,P.oakD)
  c.ellipse(27,11,8,6,P.ink); c.ellipse(27,10,7,5,P.oakD); c.ellipse(27,9,6,4,P.oakL)
  c.line(23,8,25,7,P.cream); c.line(27,9,29,8,P.flourL); c.line(31,10,33,9,P.oakM)
  c.ellipse(36,15,6,5,P.ink); c.ellipse(36,14,5,4,P.oakD); c.ellipse(36,13,4,3,P.oakL)
  c.line(34,12,35,11,P.cream); c.px(38,13,P.flourL)
})

// 4. Projecting wrought-iron bracket and carved trade sign, with thickness on the return edge.
sprite("prop_bakery_pretzel_sign_3q", { w: 48, h: 62 }, c => {
  c.ellipse(25,57,18,3,P.ink)
  // wall post, cantilever arm and diagonal brace
  c.poly([7,5,12,3,14,5,14,32,10,34,7,31],P.ironD); c.line(9,8,9,29,P.ironL)
  c.poly([11,8,30,4,33,7,15,12],P.iron); c.line(14,8,29,5,P.ironHi)
  c.line(13,12,26,6,P.ironD,2); c.px(11,7,P.gold); c.px(11,29,P.ironHi)
  // two chains recede with perspective; sign face has bevel and dark return
  c.line(22,9,23,17,P.ironD,2); c.line(29,8,30,16,P.ironD,2)
  c.px(22,12,P.ironHi); c.px(29,11,P.ironL)
  c.poly([15,16,30,14,39,18,39,45,31,52,16,48],P.ink)
  c.poly([15,16,31,18,31,50,16,46],P.red)
  // side return and beveled gilt border
  c.poly([31,18,39,16,39,44,31,50],P.oakD)
  c.line(17,19,29,21,P.gold); c.line(17,19,17,44,P.gold); c.line(18,45,29,48,P.oakHi)
  c.line(33,21,37,20,P.oakL); c.line(37,20,37,42,P.oakD)
  // 3/4 pretzel emblem: looped baked dough with a real dark cutout
  c.ellipse(24,32,9,8,P.oakD); c.ellipse(24,31,7,6,P.oakL)
  c.ellipse(21,30,2,3,P.cream); c.ellipse(27,30,2,3,P.cream)
  c.line(19,34,23,31,P.oak); c.line(29,34,25,31,P.oak); c.line(21,35,27,35,P.oakHi,2)
  c.ellipse(24,32,3,2,P.red); c.px(20,27,P.gold); c.px(28,27,P.gold)
  c.px(19,40,P.oakD); c.px(29,41,P.oakD)
  c.px(20,28,P.cream); c.px(27,33,P.flourL); c.px(22,37,P.cream); c.px(29,35,P.flourL)
  // Carved maker's marks, gilt pin heads and salt crystals break up the broad enamel face.
  c.px(20,22,P.cream); c.px(27,23,P.oakHi); c.px(21,42,P.gold); c.px(28,44,P.cream)
  c.line(21,25,23,24,P.oakL); c.line(26,25,28,26,P.red); c.line(20,39,23,40,P.oakHi)
  c.px(18,20,P.gold); c.px(29,21,P.gold); c.px(18,45,P.oakHi); c.px(29,47,P.gold)
  c.line(33,24,35,25,P.oakL); c.line(33,38,35,39,P.oakD)
  // Four hand-set corner studs plus a tiny hanging bell give the shop sign a built, usable rig.
  c.px(18,23,P.cream); c.px(28,24,P.gold); c.px(19,43,P.gold); c.px(28,45,P.cream)
  c.line(35,45,37,48,P.ironD); c.ellipse(38,50,3,3,P.ironD); c.ellipse(38,49,2,2,P.gold); c.px(38,52,P.ironHi)
  c.px(35,23,P.oakHi); c.px(35,41,P.cream); c.px(20,46,P.oakD)
  // A line of separate iron-bound pegs on the thick wooden return edge.
  for(const [x,y] of [[34,24],[36,27],[34,30],[36,33],[34,36],[36,39],[34,42],[36,45]]){
    c.px(x,y,P.gold); c.px(x+1,y,P.oakD)
  }
  c.px(14,12,P.gold); c.px(22,13,P.ironHi); c.px(23,14,P.ink); c.px(29,12,P.ironHi); c.px(30,13,P.ink)
  // The upper and lower corners use a deliberate four-point baker's guild rosette.
  c.px(21,20,P.gold); c.px(22,19,P.cream); c.px(23,20,P.gold); c.px(22,21,P.oakHi)
  c.px(24,46,P.gold); c.px(25,45,P.cream); c.px(26,46,P.gold); c.px(25,47,P.oakHi)
  // Rivet heads tie the painted plate to the projecting wood backing.
  c.px(32,22,P.ironHi); c.px(37,23,P.ironHi); c.px(32,47,P.ironHi); c.px(37,43,P.ironHi)
  // Tiny punch marks follow the sign's bevel rather than being scattered texture.
  c.px(19,26,P.red); c.px(28,28,P.oakHi); c.px(19,37,P.oakHi); c.px(28,39,P.red)
  // small brass finial and forged mounting bolts
  c.poly([21,15,25,12,29,15,25,17],P.gold); c.px(25,14,P.cream); c.px(24,15,P.oakL)
  c.px(10,11,P.gold); c.px(10,27,P.gold); c.px(12,9,P.ironHi); c.px(13,10,P.ink)
  c.px(28,6,P.ironHi); c.px(30,7,P.ironD); c.line(33,10,36,9,P.ironL)
})

// 5. Sparrow at 3/4, head turned toward a crumb; wing, tail and feet are separate forms.
sprite("prop_bakery_sparrow_3q", { w: 34, h: 28 }, c => {
  c.ellipse(17,24,13,3,P.ink)
  // tail points away in depth, body has lit upper plane and shaded belly
  c.poly([7,16,2,12,3,20,10,20],P.oakD); c.line(4,15,9,19,P.oakL)
  c.ellipse(16,17,11,7,P.ink); c.ellipse(16,16,10,6,P.oak)
  c.poly([8,17,15,14,23,16,22,20,14,22,8,20],P.oakD)
  c.poly([10,15,15,12,22,15,18,19,12,19],P.oakL)
  // wing with feather groups, turned head, cheek and alert eye
  c.ellipse(13,16,6,4,P.oakD); c.ellipse(13,15,5,3,P.oakM)
  c.line(10,15,14,17,P.oakHi); c.line(11,14,15,16,P.oakL); c.px(13,16,P.oakD)
  c.line(10,17,13,19,P.flour); c.line(13,14,16,16,P.oakD); c.px(12,14,P.cream); c.px(15,17,P.oakHi)
  c.ellipse(22,12,5,5,P.ink); c.ellipse(22,11,4,4,P.oakL); c.ellipse(23,11,2,2,P.flourL)
  c.px(24,10,P.ink); c.px(25,11,P.cream); c.px(22,9,P.cream); c.px(20,12,P.oakHi)
  c.poly([26,12,32,14,26,15],P.gold); c.px(30,14,P.oakD); c.px(29,13,P.cream)
  // tiny nape feathers and chest bib clarify the turned, forward-looking pose
  c.line(20,16,23,18,P.cream); c.px(21,18,P.flourL); c.px(24,17,P.oakD)
  c.px(7,17,P.oakHi); c.px(6,18,P.oak); c.px(5,19,P.oakD)
  c.px(17,19,P.flour); c.px(19,19,P.cream); c.px(21,20,P.oakL)
  c.line(15,21,14,24,P.ironD); c.line(20,21,21,24,P.ironD)
  c.line(12,24,17,24,P.oakD); c.line(19,24,24,24,P.oakD)
  c.line(13,25,17,25,P.ironL); c.line(20,25,24,25,P.ironL)
  c.px(7,22,P.flourL); c.px(5,23,P.oakHi); c.px(9,24,P.cream); c.px(11,22,P.gold)
})

// A scale-aware product shot: props share the Chibi Baker's ground plane and lighting direction.
scene("bakery_living_props_3q_review", { w: 432, h: 232, bg: "#18202d" },
  layer("floor", c => {
    c.rect(0,0,432,232,"#18202d")
    c.poly([18,188,215,105,414,188,216,226],"#4d6843")
    c.poly([18,188,216,226,216,232,18,195],"#344a39")
    c.poly([216,226,414,188,414,195,216,232],"#283c33")
    c.line(33,189,215,224,"#799466"); c.line(218,224,398,190,"#526d48")
    c.text(10,8,"BAKERY / LIVING PROPS V2 · 3/4 VIEW","#f2dcad",{scale:2,gap:1})
    c.text(10,29,"TOP + FRONT + SHADED RETURN · SAME WARM KEY LIGHT AS THE BAKER","#b9c4b0",{scale:1,gap:0})
  }),
  layer("props",
    stamp("prop_bakery_hearth_3q",24,96),
    stamp("prop_bakery_dough_table_3q",128,116),
    stamp("prop_bakery_bread_basket_3q",268,143),
    stamp("prop_bakery_pretzel_sign_3q",351,77),
    stamp("prop_bakery_sparrow_3q",243,177),
    stamp("settler_baker_chibi",197,126)
  ),
  layer("labels", c => {
    c.text(25,207,"HEARTH","#f0dcb9",{scale:1}); c.text(133,207,"WORKBENCH","#f0dcb9",{scale:1})
    c.text(277,207,"BREAD","#f0dcb9",{scale:1}); c.text(352,207,"GUILD SIGN","#f0dcb9",{scale:1})
  })
)
