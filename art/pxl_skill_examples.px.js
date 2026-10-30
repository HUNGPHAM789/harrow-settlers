// Visual examples for the PXL skill guide: transformations, reuse, scenes, light and animation.
const C={ink:"#171d2b",deep:"#263247",steel:"#526378",steelL:"#a9bdc4",cream:"#f3e4be",gold:"#f6bd4b",red:"#d75143",redD:"#782f3b",wood:"#8b593b",woodL:"#d39a58",leaf:"#4b8a59",leafL:"#9aca69",blue:"#6da8c9",flame:"#ed6b36",flameL:"#ffd25a",glass:"#79bfc4"}
pal({l:C.leaf,g:C.flameL})

// Mirror + outline: draw only one half, then let PXL complete the asset.
sprite("pxl_demo_symmetry",{w:40,h:36,mx:true,outline:C.ink},c=>{
  c.poly([5,20,10,8,20,3,20,31,10,28],C.redD)
  c.poly([10,20,14,10,20,7,20,27,13,25],C.red)
  c.line(12,18,18,12,C.gold,2); c.px(15,20,C.cream); c.px(17,17,C.gold)
  c.rect(14,22,5,3,C.steelL); c.px(17,23,C.ink)
})

// Reusable base + palette swap.
sprite("pxl_demo_crate",{w:38,h:32,outline:C.ink},c=>{
  c.poly([4,10,19,4,34,10,19,17],C.woodL)
  c.poly([4,10,19,17,19,29,4,22],C.wood)
  c.poly([19,17,34,10,34,22,19,29],C.redD)
  c.line(6,12,18,18,C.gold); c.line(21,17,32,12,C.woodL)
  c.line(8,17,8,22,C.woodL); c.line(15,20,15,27,C.woodL)
  c.px(5,11,C.steelL); c.px(17,17,C.steelL); c.px(32,11,C.steelL)
})
sprite("pxl_demo_crate_berry",{base:"pxl_demo_crate",swap:{[C.wood]:"#52426e",[C.woodL]:"#9279c5",[C.redD]:"#35284f",[C.gold]:"#b5e2ea"}})

// Tiny reusable part + repeated stamps; organic scatter is constrained to foliage.
sprite("_pxl_demo_leaf",{w:7,h:5},c=>{
  c.poly([0,3,2,0,6,1,4,4,1,4],C.leaf); c.line(1,3,5,1,C.leafL)
})
sprite("pxl_demo_tree",{w:44,h:54},c=>{
  c.ellipse(22,48,16,4,C.ink); c.rect(19,26,7,23,C.wood)
  c.ellipse(22,19,17,18,C.ink); c.ellipse(20,18,15,16,C.leaf)
  c.ellipse(17,14,9,10,C.leafL); c.stamp("_pxl_demo_leaf",8,12); c.stamp("_pxl_demo_leaf",25,18,{flip:"x"})
  c.scatter("_pxl_demo_leaf",8,5,28,30,9,{on:"l",clip:true,seed:17})
})

// A torch carries a lamp with it; its glow stays local to the flame key.
sprite("pxl_demo_torch",{w:22,h:36},c=>{
  c.line(11,17,11,34,C.wood,4); c.line(11,18,11,32,C.woodL)
  c.poly([7,19,9,10,11,5,14,11,16,19,12,22],C.flame)
  c.poly([9,18,11,10,14,18,12,21],C.flameL); c.px(12,16,"g")
  c.lamp(12,12,{r:42,color:"#ffb454",power:1.1,z:5})
},glow("g",{r:6,strength:.5}))

// Procedural loop reads c.phase so the flame returns smoothly to frame zero.
anim("pxl_demo_fire",{w:32,h:38,frames:8,fps:10},c=>{
  const a=c.phase*Math.PI*2, sway=Math.round(Math.sin(a)*2), pulse=Math.round(Math.cos(a*2)*2)
  c.ellipse(16,34,10,3,C.ink)
  c.poly([9,32,11+sway,21,15+sway,7+pulse,19+sway,20,24,32],C.flame)
  c.poly([12,31,14+sway,21,16+sway,14+pulse,20+sway,30],C.flameL)
  c.px(16+sway,25,C.cream)
})

// Warm room demonstrates separate unlit sky, light-blocking surfaces, a wall and lamp propagation.
scene("pxl_demo_lighting",{w:180,h:116,bg:"#121826"},
  layer("sky",{unlit:true},c=>{
    c.rect(0,0,180,116,"#182235"); c.px(18,18,C.steelL); c.px(31,11,C.cream); c.px(150,18,C.blue)
  }),
  layer("ground",{solid:true},c=>{
    c.rect(0,86,180,30,"#303849"); c.line(0,86,180,86,C.steelL)
    for(let x=10;x<180;x+=22)c.line(x,101,x+12,101,C.steel)
  }),
  layer("backwall",{wall:true},c=>{
    c.rect(0,27,180,59,"#625342"); c.rect(8,34,164,45,"#806c53")
    c.line(12,40,168,40,C.woodL); c.line(12,75,168,75,C.wood)
    c.rect(115,41,35,35,C.ink); c.rect(119,45,27,27,C.glass); c.line(132,45,132,72,C.steelL)
  }),
  layer("walls",{solid:true},c=>{
    c.rect(0,24,7,65,C.ink); c.rect(173,24,7,65,C.ink); c.rect(0,83,180,5,C.ink)
  }),
  layer("props",c=>{
    c.stamp("pxl_demo_torch",33,44); c.stamp("pxl_demo_crate",81,62)
    c.rect(124,73,24,4,C.woodL); c.px(137,67,C.gold)
  }),
  lighting({cell:2,sky:.08,skyColor:"#7898c8",ambient:.34,ambientColor:"#8da6c8",emit:"g",block:.34}),
  glow("g",{r:10,strength:.45})
)

sprite("pxl_demo_grass_tile",{w:24,h:24},c=>{
  c.rect(0,0,24,24,"#83a66c"); c.line(3,8,8,8,"#96b477"); c.px(18,15,"#75945f"); c.px(6,20,"#75945f")
})
sprite("pxl_demo_stone_tile",{w:24,h:24},c=>{
  c.rect(0,0,24,24,"#69747c"); c.line(0,11,24,11,"#899397"); c.line(12,0,12,11,"#505c68"); c.line(5,12,5,24,"#505c68"); c.px(19,17,"#a9b2a8")
})

// Tilemap + repeated props + a cast-shadow layer, all visible in one compact plate.
scene("pxl_demo_scene",{w:200,h:126,bg:"#b7d0c0"},
  layer("ground",c=>{
    c.rect(0,0,200,126,"#9fbb91")
    c.tilemap("gggsg\ngggsg\nggggg\nssggg",{size:24,map:{g:"pxl_demo_grass_tile",s:"pxl_demo_stone_tile"},x:4,y:18})
  }),
  layer("tree",c=>{
    c.stamp("pxl_demo_tree",23,23); c.stamp("pxl_demo_tree",130,20,{flip:"x"})
    c.stamp("pxl_demo_crate",78,74)
  }),
  layer("shadow",c=>c.poly([18,70,63,73,74,81,20,78],C.ink)),
  layer("caption",c=>{
    c.rect(0,0,200,16,C.ink); c.text(5,5,"LAYERS · TILEMAP · STAMPS","#fff0c6",{scale:1,gap:0})
  })
)

scene("pxl_demo_feature_board",{w:420,h:300,bg:"#101725"},
  layer("background",c=>{
    c.rect(0,0,420,300,"#101725"); c.rect(0,0,420,27,"#202c40")
    c.text(10,8,"PXL TOOLKIT / PIXEL ART AS CODE","#fff0c6",{scale:2,gap:1})
    for(let i=0;i<6;i++){const x=8+(i%3)*136,y=36+Math.floor(i/3)*101,h=i<3?92:155;c.rect(x,y,128,h,"#1b2739");c.rect(x,y,128,1,"#42546b")}
    c.text(15,42,"MIRROR + OUTLINE","#d7e2ef",{scale:1});c.text(151,42,"BASE + SWAP","#d7e2ef",{scale:1});c.text(287,42,"PARTS + SCATTER","#d7e2ef",{scale:1})
    c.text(15,143,"LAYERS + TILEMAP","#d7e2ef",{scale:1});c.text(151,143,"LAMP + GLOW","#d7e2ef",{scale:1});c.text(287,143,"PROCEDURAL LOOP","#d7e2ef",{scale:1})
  }),
  layer("examples",c=>{
    c.stamp("pxl_demo_symmetry",44,60); c.stamp("pxl_demo_crate",166,59); c.stamp("pxl_demo_crate_berry",202,59)
    c.stamp("pxl_demo_tree",315,51); c.stamp("pxl_demo_scene",16,158); c.stamp("pxl_demo_torch",184,168)
    c.stamp("pxl_demo_fire",321,165,{frame:3})
  })
)

sheet("pxl_skill_examples",["pxl_demo_*"],{cols:4,pad:2})
