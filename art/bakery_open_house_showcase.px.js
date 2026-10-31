// Open-front bakery atelier and profession reel for customer-facing presentation.
// The broad covered bay is intentionally left open so props and the baker remain visible.
include("bakery_living_props_3q.px.js")

const B = {
  ink: "#241724", deep: "#38252b", oakD: "#542b18", oak: "#89502b", oakM: "#b8733d", oakL: "#e0a05b", oakHi: "#f1c47b",
  stoneD: "#4d5264", stone: "#747c91", stoneL: "#aab0bd", stoneHi: "#d5cfbd",
  wallD: "#8a7052", wall: "#c4aa79", wallL: "#ead39d", wallHi: "#fff0c6",
  roofD: "#7d241c", roof: "#b33b27", roofL: "#e15a37", roofHi: "#ff9670",
  greenD: "#344c39", green: "#4d6b45", greenL: "#81975d", sky: "#7f9ba0", cyan: "#78bbb0", glass: "#4f7b82",
  gold: "#f5c44e", red: "#bc4537", flour: "#f1dfb2", ironD: "#313646", iron: "#565e70", ironL: "#8990a1", ironHi: "#c2c3bb",
}

// Wide half-timber bakery house with a real open work bay beneath a projecting awning.
sprite("bakery_open_house_stage", { w: 420, h: 240 }, c => {
  // morning sky, distant orchard and a broad 3/4 ground plane
  c.rect(0,0,420,240,"#9bb8ac")
  c.rect(0,84,420,92,B.sky)
  c.poly([0,103,48,77,116,99,169,70,229,99,296,73,354,99,420,76,420,154,0,154],"#63805a")
  c.poly([20,150,206,77,401,150,210,225],B.ink)
  c.poly([20,147,206,75,401,147,210,219],B.green)
  c.poly([20,147,210,219,210,227,20,155],B.greenD)
  c.poly([210,219,401,147,401,155,210,227],"#293b34")
  c.line(31,148,210,215,B.greenL); c.line(216,215,387,150,"#5f7d4c")
  // Hard-baked stone apron under the awning: an actual open floor, not a raised counter.
  c.poly([57,151,207,93,361,151,209,210],"#515761")
  c.poly([57,151,209,210,209,216,57,157],B.stoneD)
  c.poly([209,210,361,151,361,157,209,216],B.ironD)
  for(let i=0;i<6;i++){
    const y=137+i*11, x=81+i*2
    c.line(x,y,x+94,y+36,B.iron)
    c.line(x+104,y+38,x+197,y+2,B.stone)
  }
  for(const [x,y] of [[92,155],[142,174],[220,184],[292,157],[327,146]]){c.px(x,y,B.stoneL);c.px(x+1,y,B.ironD)}
  // rear bakery wall and right-side return; the front remains absent to reveal the workroom
  c.poly([66,80,207,35,348,82,348,146,207,198,66,146],B.ink)
  c.poly([72,82,207,40,342,84,342,141,207,191,72,141],B.wallD)
  c.poly([72,82,207,40,207,121,72,164],B.wallL)
  c.poly([207,40,342,84,342,141,207,121],B.wall)
  // Remove the entire front wall below the counter line: this is the cutaway opening
  // where guests can see the artisan and all five props inside the covered bay.
  // half-timber construction, set back so the open front reads as an inviting room
  c.line(81,84,205,47,B.oakD,8); c.line(211,48,333,87,B.oakD,8)
  c.line(82,158,205,118,B.oakD,7); c.line(211,120,333,139,B.oakD,7)
  c.line(109,73,109,155,B.oak,7); c.line(186,48,186,124,B.oakD,7)
  c.line(236,49,236,128,B.oak,7); c.line(315,76,315,148,B.oakD,7)
  c.line(110,114,185,90,B.oak,5); c.line(237,88,314,113,B.oakD,5)
  c.line(118,76,174,59,B.wallHi); c.line(246,59,299,77,B.wallHi)
  // leaded bakery windows glow behind the open bay
  c.poly([121,78,155,67,155,101,121,112],B.ink)
  c.poly([125,79,152,70,152,98,125,107],B.glass)
  c.line(138,75,138,103,B.ironHi,2); c.line(126,92,151,84,B.ironHi,2)
  c.px(130,83,B.wallHi); c.px(146,78,B.cyan); c.px(130,100,B.cyan)
  c.poly([258,74,293,85,293,116,258,105],B.ink)
  c.poly([262,76,290,85,290,111,262,102],B.glass)
  c.line(276,80,276,106,B.ironHi,2); c.line(263,90,289,98,B.ironHi,2)
  c.px(267,82,B.wallHi); c.px(284,105,B.cyan)
  // roof overhang and gable: offset tile rows trace the two roof planes
  c.poly([41,74,199,18,365,72,206,131],B.ink)
  c.poly([47,71,199,22,205,32,63,79],B.roofD)
  c.poly([199,22,359,71,350,82,205,39],B.roof)
  c.line(53,69,197,25,B.roofHi,3); c.line(208,29,354,72,B.roofHi,3)
  for(let i=0;i<7;i++){
    const y=38+i*5
    c.line(57+i*2,y,191-i*19,y+42,B.roofD)
    c.line(207+i*19,39+i*5,347-i*2,78+i*2,B.roofD)
  }
  c.poly([187,24,199,18,211,23,199,29],B.roofHi)
  c.line(196,24,199,22,B.wallHi); c.line(199,22,202,24,B.gold)
  // covered porch / open display bay. The canopy projects toward the viewer.
  c.poly([44,102,204,54,372,105,209,164],B.ink)
  c.poly([51,99,204,57,365,106,209,158],B.oakD)
  c.poly([51,99,204,57,209,68,59,111],B.roofL)
  c.poly([204,57,365,106,355,118,209,68],B.roofD)
  c.line(57,101,204,61,B.roofHi,3); c.line(214,64,356,108,B.roofL,3)
  // striped canvas valance and brass hooks
  c.poly([54,108,207,68,211,81,59,124],B.roofD)
  for(let i=0;i<10;i++){
    const x=61+i*15, y=107-i*4
    c.poly([x,y,x+7,y-2,x+9,y+10,x+2,y+12],i%2?B.wallHi:B.red)
  }
  // side posts and forged diagonal brackets create a real usable covered area
  c.poly([59,119,68,122,68,178,59,175],B.oakD); c.line(61,123,61,170,B.oakL,2)
  c.poly([347,120,356,117,356,161,347,165],B.oakD); c.line(350,121,350,159,B.oakL,2)
  c.line(64,130,91,116,B.iron,3); c.line(350,130,326,117,B.iron,3)
  c.px(63,124,B.ironHi); c.px(351,122,B.ironHi)
  // left service wall ends early so customers can see the open atelier
  c.poly([68,115,94,107,94,165,68,174],B.wallD)
  c.line(72,122,72,166,B.oakD,5); c.line(90,116,90,160,B.oak,4)
  c.poly([74,130,87,126,87,146,74,151],B.ink); c.poly([76,131,85,128,85,143,76,146],B.glass)
  c.line(80,130,80,145,B.ironHi); c.px(77,133,B.wallHi); c.px(83,141,B.cyan)
  // shallow back-wall ingredient shelves leave a customer-visible working floor
  c.poly([124,116,169,102,211,115,166,130],B.ink)
  c.poly([128,115,169,103,207,115,166,127],B.oakL)
  c.poly([128,115,166,127,166,131,128,119],B.oak)
  c.poly([166,127,207,115,207,119,166,131],B.oakD)
  c.line(134,114,165,124,B.oakHi); c.line(172,125,201,116,B.oak)
  c.poly([228,115,270,102,310,114,269,128],B.ink)
  c.poly([232,114,270,103,306,114,269,125],B.oakL)
  c.poly([232,114,269,125,269,129,232,118],B.oak)
  c.poly([269,125,306,114,306,118,269,129],B.oakD)
  // lidded flour tins and a chalk recipe board live above the shelves
  c.poly([143,106,151,103,159,106,151,109],B.ironHi); c.rect(143,106,16,6,B.ironD); c.poly([143,106,151,109,159,106,159,104,151,101,143,104],B.ironL)
  c.poly([276,106,283,103,290,106,283,109],B.gold); c.rect(276,106,14,6,B.oakD)
  c.poly([176,87,211,76,242,86,207,98],B.ink)
  c.poly([180,87,211,78,238,86,207,95],"#31534a")
  c.line(188,87,202,83,B.wallHi); c.line(205,86,219,82,B.gold); c.line(197,91,215,86,B.wallL)
  c.px(184,88,B.wallHi); c.px(224,85,B.wallHi)
  // flower box at outer edge, climbing thyme and warm welcome lamp
  c.poly([72,164,92,158,99,162,78,170],B.ink); c.poly([76,163,92,158,96,161,79,166],B.oakL)
  c.line(81,160,79,152,B.green); c.line(86,159,88,150,B.greenL); c.line(92,158,95,151,B.green)
  c.px(78,151,B.gold); c.px(89,148,B.red); c.px(96,150,B.wallHi)
  c.rect(346,106,4,10,B.ironD); c.ellipse(348,106,4,4,B.gold); c.px(348,105,B.wallHi)
  // guild sign on the gable
  c.line(205,31,205,43,B.ironD,2); c.poly([193,40,205,35,218,40,205,46],B.ink)
  c.poly([195,40,205,37,215,40,205,44],B.red)
  c.ellipse(205,40,4,3,B.gold); c.px(204,39,B.wallHi); c.px(207,41,B.oakD)
})

// The stage itself: bakery props are laid out under the awning around a clear animation lane.
scene("bakery_open_house_review", { w: 420, h: 240, bg: "#9bb8ac" },
  layer("stage", stamp("bakery_open_house_stage",0,0)),
  layer("props",
    stamp("prop_bakery_flour_barrel_3q",38,124),
    stamp("prop_bakery_hearth_3q",70,107),
    stamp("prop_bakery_dough_table_3q",128,126),
    stamp("prop_bakery_peel_rack_3q",186,85),
    stamp("prop_bakery_cooling_rack_3q",232,108),
    stamp("prop_bakery_bread_basket_3q",290,147),
    stamp("prop_bakery_pretzel_sign_3q",345,82),
    stamp("prop_bakery_sparrow_3q",259,178),
    stamp("settler_baker_chibi",205,121)
  ),
  layer("title", c => {
    c.rect(0,0,420,31,"#241724"); c.text(12,7,"HARROW BAKERY · LIVING WORKSHOP STAGE","#fff0c6",{scale:2,gap:1})
    c.text(12,21,"PURPOSEFUL ARCHITECTURE · INTERACTIVE PROPS · CONTINUOUS WORKING LOOP","#c9d0bd",{scale:1,gap:0})
  })
)

// Master 12-Beat Guest-Facing Reel: Continuous Loop Chain of Working (12 distinct animations)
anim("bakery_open_house_profession_reel", { w: 420, h: 240, frames: 96, fps: 8 }, c => {
  c.stamp("bakery_open_house_stage",0,0)
  c.stamp("prop_bakery_flour_barrel_3q",38,124)
  c.stamp("prop_bakery_hearth_3q",70,107)
  c.stamp("prop_bakery_dough_table_3q",128,126)
  c.stamp("prop_bakery_peel_rack_3q",186,85)
  c.stamp("prop_bakery_cooling_rack_3q",232,108)
  c.stamp("prop_bakery_bread_basket_3q",290,147)
  c.stamp("prop_bakery_pretzel_sign_3q",345,82)
  c.stamp("prop_bakery_sparrow_3q",259,178,{frame:0})
  
  // 12 distinct sequential animation beats around and inside the bakery house
  const beats = [
    ["anim_chibi_baker_scoop",8,46,96,"01  SCOOP PURE WHEAT FLOUR"],
    ["anim_chibi_baker_pour",8,136,94,"02  POUR SPRING WATER & MIX"],
    ["anim_chibi_baker_knead",12,136,94,"03  KNEAD THE DOUGH (2-HANDED)"],
    ["anim_chibi_baker_shape",8,136,94,"04  SHAPE & SCORE ARTISAN LOAVES"],
    ["anim_chibi_baker_oven",8,84,94,"05  PEEL STICK: LOAD INTO HEARTH"],
    ["anim_chibi_baker_sneeze",10,136,94,"06  FLOUR-CLOUD SNEEZE (ACHOO!)"],
    ["anim_chibi_baker_peel_retrieve",8,84,94,"07  PEEL STICK: RETRIEVE HOT BREAD"],
    ["anim_chibi_baker_aroma",8,218,94,"08  BREATHE IN FRESH BREAD AROMA"],
    ["anim_chibi_baker_carry",8,238,106,"09  CARRY BASKET TO STOREFRONT"],
    ["anim_chibi_baker_serve",8,272,112,"10  SERVE AT COUNTER & RING BELL"],
    ["anim_chibi_baker_walk",8,156,94,"11  RETURN TO WORKSHOP LANE"],
    ["anim_chibi_baker_idle",8,136,94,"12  READY FOR THE NEXT BATCH"]
  ]
  
  const framesPerBeat = 8
  const beat = Math.min(beats.length - 1, Math.floor(c.frame / framesPerBeat))
  const [name, count, x, y, label] = beats[beat]
  const local = c.frame % framesPerBeat
  const f = Math.min(count - 1, Math.floor(local * count / framesPerBeat))
  c.stamp(name, x, y, { frame: f })
  
  // Living hearth glow pulse
  const flick = (c.frame % 4) < 2
  c.ellipse(82, 166, 4, 2, flick ? "#ffb438" : "#ed681f")
  
  // Header title
  c.rect(0, 0, 420, 24, "#241724")
  c.text(12, 6, "HARROW BAKERY · 12-ANIMATION WORK LOOP", "#fff0c6", { scale: 2, gap: 1 })
  
  // Bottom status ticker with step number and action description
  c.rect(10, 209, 400, 23, "#241724")
  const isSpecial = (beat === 5 || beat === 4 || beat === 6 || beat === 9)
  c.text(20, 216, label, isSpecial ? "#f5c44e" : "#fff0c6", { scale: 2, gap: 1 })
})
