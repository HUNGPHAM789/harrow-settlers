// Original visual gallery for the PXL report: native-size hero specs, a procedural part rig,
// game-ready motion loops, and props. All visuals in this file are code-drawn with PXL.
const P={ink:"#17202e",ink2:"#273448",hair:"#342631",hairL:"#815342",hairHi:"#b07256",hairHi2:"#c28b67",skin:"#d89b72",skinL:"#f0c49a",skinS:"#a86657",skinD:"#874e49",skinRose:"#c47b67",coat:"#31536a",coatL:"#668fa0",coatHi:"#9dbcc0",coatHi2:"#b4d0ce",coatMid:"#466d80",coatD:"#20394e",coatD2:"#263f54",shirt:"#dfc68f",strap:"#8b5435",strapL:"#d39958",pants:"#425568",pantsL:"#718696",pantsHi:"#a1adb0",pantsHi2:"#bec5bb",pantsD:"#2e3d4e",boot:"#242d3b",bootL:"#647582",gold:"#f0bd54",red:"#b95543",redL:"#ed8963",stone:"#566171",stoneL:"#a4acaa",wood:"#765039",woodL:"#bc8150",leaf:"#537b58",leafL:"#a4be71",flame:"#ed633d",flameL:"#ffd65c",glow:"#ffe29b",blue:"#77d3df"}
pal({k:P.ink,f:P.flameL,g:P.glow})

const tau=Math.PI*2
const px=(c,x,y,col)=>c.px(Math.round(x),Math.round(y),col)
const ln=(c,a,b,w,col)=>c.line(Math.round(a.x),Math.round(a.y),Math.round(b.x),Math.round(b.y),col,Math.max(1,Math.round(w)))
function ik2(a,b,l1,l2,bend=1){
  let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1
  let q=Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d)))
  let h=Math.sqrt(Math.max(0,l1*l1-(q*d)*(q*d)))
  let ux=dx/d,uy=dy/d,along=q*d
  return {x:a.x+ux*along+bend*uy*h,y:a.y+uy*along-bend*ux*h}
}
function segment(c,a,b,w,color,hi){ln(c,a,b,w,color);if(hi)ln(c,{x:a.x-w*.16,y:a.y-w*.08},{x:b.x-w*.16,y:b.y-w*.08},Math.max(1,w*.23),hi)}
function paintRook(c,phase=0,action="idle",sx=1,sy=1,detail=2){
  let bodyShift=0
  const X=n=>Math.round(n*sx),Y=n=>Math.round((n+bodyShift)*sy), W=n=>Math.max(1,Math.round(n*(sx+sy)/2))
  const V=(x,y)=>({x,y}), M=p=>({x:X(p.x),y:Y(p.y)})
  const poly=(pts,col)=>c.poly(pts.map((v,i)=>i%2?Y(v):X(v)),col)
  const rect=(x,y,w,h,col)=>c.rect(X(x),Y(y),Math.max(1,X(w)),Math.max(1,Y(h)),col)
  const ell=(x,y,rx,ry,col)=>c.ellipse(X(x),Y(y),W(rx),W(ry),col)
  const line=(a,b,w,col)=>ln(c,M(a),M(b),W(w),col)
  const t=phase*tau
  let bob=action==="idle"?Math.sin(t)*.45:action==="walk"?Math.abs(Math.sin(t))*.7:action==="kneel"?Math.sin(t)*.7:0
  let lean=action==="walk"?1.4:action==="attack"?2:action==="kneel"?3.2:0
  let hip=V(24+lean,40+bob), shoulder=V(24+lean,24+bob)
  let farAnkle,nearAnkle
  if(action==="walk"){
    farAnkle=V(24+Math.sin(t+Math.PI)*5,55-Math.max(0,Math.cos(t+Math.PI))*2.5+bob)
    nearAnkle=V(24+Math.sin(t)*5,55-Math.max(0,Math.cos(t))*2.5+bob)
  } else if(action==="kneel"){
    farAnkle=V(16+Math.sin(t)*.5,58);nearAnkle=V(34,57)
    hip=V(25,44);shoulder=V(25,29)
  } else {
    farAnkle=V(21,56+bob);nearAnkle=V(27,56+bob)
  }
  const fK=action==="kneel"?V(20+Math.sin(t)*.5,53):ik2(hip,farAnkle,9.8,9.5,1)
  const nK=action==="kneel"?V(30+Math.sin(t)*1.1,55+Math.sin(t*2)*.6):ik2(hip,nearAnkle,10.2,9.8,1)
  // Far leg and boot
  segment(c,M(hip),M(fK),4.5,P.ink2);segment(c,M(fK),M(farAnkle),4,P.pants,P.pantsL)
  ell(fK.x*sx,fK.y*sy,W(2),W(2),P.ink2)
  poly([X(farAnkle.x-2),Y(farAnkle.y-1),X(farAnkle.x+4),Y(farAnkle.y-1),X(farAnkle.x+6),Y(farAnkle.y+2),X(farAnkle.x+1),Y(farAnkle.y+3),X(farAnkle.x-3),Y(farAnkle.y+2)],P.boot)
  line(V(farAnkle.x-1,farAnkle.y+1),V(farAnkle.x+3,farAnkle.y+1),1,P.bootL)
  // Near leg, knee, articulated ankle, foot
  segment(c,M(hip),M(nK),5.5,P.pants,P.pantsL); segment(c,M(nK),M(nearAnkle),4.7,P.pants,P.pantsL)
  ell(nK.x*sx,nK.y*sy,W(2),W(2),P.ink)
  ell(nK.x*sx,nK.y*sy,W(1),W(1),P.pantsL)
  poly([X(nearAnkle.x-2),Y(nearAnkle.y-1),X(nearAnkle.x+4),Y(nearAnkle.y-1),X(nearAnkle.x+7),Y(nearAnkle.y+2),X(nearAnkle.x+2),Y(nearAnkle.y+3),X(nearAnkle.x-3),Y(nearAnkle.y+2)],P.boot)
  line(V(nearAnkle.x-1,nearAnkle.y+1),V(nearAnkle.x+4,nearAnkle.y+1),1,P.bootL)
  bodyShift=action==="kneel"?6:0
  // Hip belt/waist, then jacket body
  poly([X(17+lean),Y(38+bob),X(31+lean),Y(38+bob),X(32+lean),Y(43+bob),X(17+lean),Y(43+bob)],P.strap)
  line(V(19+lean,40+bob),V(30+lean,40+bob),1,P.strapL)
  rect(24+lean,39+bob,3,3,P.gold)
  poly([X(17+lean),Y(23+bob),X(30+lean),Y(22+bob),X(34+lean),Y(28+bob),X(32+lean),Y(39+bob),X(29+lean),Y(42+bob),X(18+lean),Y(40+bob),X(14+lean),Y(29+bob)],P.coatD)
  poly([X(18+lean),Y(24+bob),X(29+lean),Y(24+bob),X(32+lean),Y(29+bob),X(30+lean),Y(38+bob),X(19+lean),Y(38+bob),X(16+lean),Y(29+bob)],P.coat)
  poly([X(18+lean),Y(24+bob),X(22+lean),Y(25+bob),X(20+lean),Y(36+bob),X(17+lean),Y(32+bob)],P.coatL)
  // Far arm, shoulder and elbow chain
  let farShoulder=V(17+lean,26+bob), farElbow=V(13+lean,33+bob), farHand=V(15+lean,39+bob)
  segment(c,M(farShoulder),M(farElbow),4.2,P.coatD,P.coatL);segment(c,M(farElbow),M(farHand),3.6,P.coat,P.coatL)
  ell(farHand.x*sx,farHand.y*sy,W(2),W(2),P.skinS);ell(farHand.x*sx,farHand.y*sy,W(1),W(1),P.skinL)
  // Near arm changes pose for hammer wind-up and swing; two joints make it visibly articulated.
  let armElbow,hand
  if(action==="attack"){
    let hit=(phase<.38)?phase/.38:(phase<.68)?1:(phase-.68)/.32
    let eased=phase<.38?hit*hit:phase<.68?1:1-(1-hit)*(1-hit)
    let start=V(34+lean,27+bob), end=V(35+lean,38+bob)
    armElbow=V(35+lean-eased*3,20+eased*14+bob);hand=V(34+lean-eased*4,13+eased*27+bob)
    if(phase>.68){hand=V(31+lean,37+bob)}
  } else if(action==="kneel"){
    armElbow=V(35+lean,38+bob+Math.sin(t)*.5);hand=V(39+lean+Math.sin(t)*1.5,44+bob+Math.cos(t)*1.2)
  } else {
    let swing=action==="walk"?Math.sin(t+Math.PI)*3:Math.sin(t)*.6
    armElbow=V(34+lean,31+bob+swing);hand=V(35+lean,37+bob+swing)
  }
  let nearShoulder=V(31+lean,25+bob)
  segment(c,M(nearShoulder),M(armElbow),4.8,P.coat,P.coatL);ell(armElbow.x*sx,armElbow.y*sy,W(2),W(2),P.coatD)
  segment(c,M(armElbow),M(hand),3.8,P.skin,P.skinL);ell(hand.x*sx,hand.y*sy,W(2),W(2),P.skin)
  line(V(hand.x-.5,hand.y),V(hand.x+1.5,hand.y-1),1,P.skinL)
  // Head, hair silhouette, profile and face.
  let headY=14+bob*.45-(action==="kneel"?1:0)
  ell(25+lean,headY,8,9,P.ink);ell(24+lean,headY-1,7,7,P.hair)
  poly([X(18+lean),Y(14+headY-14),X(20+lean),Y(headY-8),X(24+lean),Y(headY-10),X(29+lean),Y(headY-7),X(32+lean),Y(headY-3),X(29+lean),Y(headY+3),X(27+lean),Y(headY+7),X(22+lean),Y(headY+5),X(20+lean),Y(headY+1)],P.skin)
  // Side fringe and crown locks
  poly([X(17+lean),Y(headY-3),X(20+lean),Y(headY-11),X(26+lean),Y(headY-13),X(32+lean),Y(headY-9),X(31+lean),Y(headY-6),X(26+lean),Y(headY-7),X(22+lean),Y(headY-3),X(20+lean),Y(headY+1)],P.hair)
  line(V(21+lean,headY-9),V(26+lean,headY-11),1,P.hairL)
  line(V(24+lean,headY-7),V(29+lean,headY-8),1,P.hairL)
  // Profile: brow, eye, nose and chin pixels
  px(c,X(29+lean),Y(headY-1),P.ink);px(c,X(30+lean),Y(headY-1),P.skinL)
  px(c,X(32+lean),Y(headY+1),P.skinS);px(c,X(29+lean),Y(headY+4),P.skinS)
  if(detail>=2){
    px(c,X(28+lean),Y(headY-2),P.skinL);px(c,X(29+lean),Y(headY-2),P.ink)
    line(V(27+lean,headY-3),V(30+lean,headY-3),1,P.hair)
    px(c,X(33+lean),Y(headY+1),P.skinL);px(c,X(31+lean),Y(headY+4),P.ink)
  }
  // Scarf/collar and strap; detail increases with the native pixel spec.
  poly([X(21+lean),Y(22+bob),X(25+lean),Y(24+bob),X(29+lean),Y(22+bob),X(27+lean),Y(27+bob),X(23+lean),Y(27+bob)],P.shirt)
  line(V(18+lean,25+bob),V(29+lean,38+bob),2.2,P.strap)
  line(V(18+lean,25+bob),V(29+lean,38+bob),.8,P.strapL)
  rect(22+lean,30+bob,3,3,P.strapL);rect(23+lean,31+bob,1,1,P.ink)
  // Tool is a prop attached to the near hand during attack.
  if(action==="attack"){
    let hammerY=phase<.38?5+phase*7:phase<.68?8+(phase-.38)*45:21
    line(V(hand.x+1,hand.y-1),V(hand.x+3,hammerY+6),2.2,P.wood)
    rect(hand.x-1,hammerY,9,3,P.stone);rect(hand.x,hammerY-1,7,2,P.stoneL)
  }
  if(detail>=2){
    line(V(19+lean,29+bob),V(20+lean,36+bob),1,P.coatL)
    line(V(25+lean,28+bob),V(29+lean,30+bob),1,P.coatD)
    rect(27+lean,33+bob,3,3,P.coatD);px(c,X(28+lean),Y(34+bob),P.gold)
    line(V(19+lean,41+bob),V(22+lean,41+bob),1,P.strapL)
  }
  if(detail>=3){
    // Native-resolution hue shifts and form shading added for the 64px specification.
    poly([X(27+lean),Y(25+bob),X(31+lean),Y(27+bob),X(30+lean),Y(34+bob),X(28+lean),Y(36+bob)],P.coatMid)
    poly([X(17+lean),Y(29+bob),X(20+lean),Y(31+bob),X(19+lean),Y(36+bob),X(17+lean),Y(34+bob)],P.coatD)
    line(V(27+lean,28+bob),V(29+lean,35+bob),1,P.coatHi)
    line(V(29+lean,29+bob),V(30+lean,32+bob),1,P.coatHi2)
    line(V(24+lean,35+bob),V(27+lean,37+bob),1,P.coatD2)
    line(V(20+lean,27+bob),V(22+lean,29+bob),1,P.shirt)
    line(V(19+lean,35+bob),V(23+lean,37+bob),1,P.coatD)
    line(V(18+lean,45+bob),V(21+lean,48+bob),1,P.pantsD)
    line(V(27+lean,45+bob),V(29+lean,49+bob),1,P.pantsHi)
    line(V(28+lean,46+bob),V(29+lean,48+bob),1,P.pantsHi2)
    line(V(19+lean,53+bob),V(21+lean,55+bob),1,P.pantsHi)
    line(V(27+lean,53+bob),V(29+lean,55+bob),1,P.pantsD)
    line(V(20+lean,57+bob),V(23+lean,57+bob),1,P.bootL)
    poly([X(28+lean),Y(headY+1),X(31+lean),Y(headY+1),X(30+lean),Y(headY+4),X(28+lean),Y(headY+5)],P.skinS)
    px(c,X(27+lean),Y(headY+3),P.skinD);px(c,X(31+lean),Y(headY+2),P.skinL);px(c,X(30+lean),Y(headY+3),P.skinRose)
    line(V(21+lean,headY-9),V(24+lean,headY-11),1,P.hairHi)
    line(V(22+lean,headY-10),V(23+lean,headY-10),1,P.hairHi2)
    line(V(25+lean,headY-10),V(28+lean,headY-11),1,P.hairL)
    rect(27+lean,34+bob,1,1,P.skinL)
    px(c,X(hand.x+1),Y(hand.y+1),P.skinS);px(c,X(hand.x),Y(hand.y+2),P.skinL)
    line(V(20+lean,42+bob),V(22+lean,42+bob),1,P.gold)
  }
}

function staticSpec(c,spec){
  if(spec===32)paintRook(c,0,"idle",.5,.5,1)
  if(spec===48)paintRook(c,0,"idle",.75,.75,2)
  if(spec===64)paintRook(c,0,"idle",1,1,3)
}
sprite("rook_spec32",{w:24,h:32},c=>staticSpec(c,32))
sprite("rook_spec48",{w:36,h:48},c=>staticSpec(c,48))
sprite("rook_spec64",{w:48,h:64},c=>staticSpec(c,64))

// Exportable cutout samples for part-layer workflows; pivot origin is documented in the gallery.
sprite("rook_part_head",{w:20,h:23},c=>{
 c.ellipse(10,12,9,11,P.ink);c.ellipse(10,11,7,9,P.hair)
 c.poly([6,7,11,5,16,8,18,12,16,14,15,18,11,20,7,17,5,12],P.skin)
 c.poly([3,10,5,4,11,1,16,3,19,7,16,8,11,7,7,10,5,14],P.hair)
 c.line(13,9,16,8,P.hairL,1);c.px(16,11,P.ink);c.px(18,12,P.skinS);c.px(16,15,P.ink);c.px(14,15,P.skinL)
})
sprite("rook_part_torso",{w:24,h:25},c=>{
 c.poly([5,2,17,2,22,8,20,21,17,24,6,23,2,8],P.coatD)
 c.poly([6,3,16,3,19,8,18,20,7,21,4,8],P.coat)
 c.poly([6,4,9,4,8,18,5,15],P.coatL)
 c.line(5,4,17,19,P.strap,3);c.line(5,4,17,19,P.strapL,1);c.rect(10,10,3,3,P.gold)
 c.poly([9,1,12,3,16,1,15,6,11,7],P.shirt)
})
sprite("rook_part_arm_upper",{w:14,h:15},c=>{
 c.poly([2,2,9,1,13,5,10,12,6,14,1,9],P.coatD);c.poly([3,3,8,2,11,5,8,11,5,12,2,8],P.coat);c.line(3,4,6,8,P.coatL,1)
})
sprite("rook_part_forearm",{w:13,h:13},c=>{
 c.poly([3,1,9,2,12,7,9,12,4,11,1,6],P.skinS);c.poly([4,2,8,3,10,7,8,10,4,9,2,6],P.skin);c.line(5,3,8,4,P.skinL,1)
})
sprite("rook_part_hand",{w:9,h:8},c=>{
 c.poly([1,2,5,1,8,3,7,6,4,7,1,5],P.skinS);c.poly([2,2,5,2,7,3,6,5,3,6,1,4],P.skin);c.px(5,3,P.skinL);c.px(6,4,P.skinS)
})
sprite("rook_part_thigh",{w:13,h:17},c=>{
 c.poly([2,1,10,1,12,5,9,14,7,16,2,14,1,7],P.pantsD);c.poly([3,2,9,2,10,5,7,13,3,12,2,7],P.pants);c.line(4,4,7,6,P.pantsL,1)
})
sprite("rook_part_shin",{w:11,h:16},c=>{
 c.poly([3,1,9,1,9,10,7,15,2,14,1,9],P.pantsD);c.poly([4,2,8,2,7,9,6,13,3,12,2,8],P.pants);c.line(6,4,7,8,P.pantsL,1)
})
sprite("rook_part_boot",{w:15,h:9},c=>{
 c.poly([2,1,9,1,10,4,14,6,13,8,1,8,0,5],P.ink);c.poly([3,2,8,2,9,5,12,6,11,7,2,7],P.boot);c.line(3,6,10,6,P.bootL,1)
})

scene("rook_independent_parts_sheet",{w:300,h:136,bg:"#111a28"},
 layer("plate",c=>{c.rect(0,0,300,136,"#111a28");c.rect(0,0,300,17,"#24344b");c.text(7,5,"TRANSPARENT PART SPRITES / PIVOT ORIGINS","#f5e4bd",{scale:1});
  c.stamp("rook_part_head",22,24);c.stamp("rook_part_torso",87,23);c.stamp("rook_part_arm_upper",162,27);c.stamp("rook_part_forearm",232,27);
  c.stamp("rook_part_hand",27,76);c.stamp("rook_part_thigh",91,73);c.stamp("rook_part_shin",163,74);c.stamp("rook_part_boot",231,81);
  for(const [x,y] of [[32,37],[99,44],[164,33],[235,34],[28,79],[96,80],[166,79],[231,86]])c.ellipse(x,y,1,1,P.gold)
  c.text(21,54,"HEAD","#d7e4f1",{scale:1});c.text(87,54,"TORSO","#d7e4f1",{scale:1});c.text(156,54,"UPPER ARM","#d7e4f1",{scale:1});c.text(231,54,"FOREARM","#d7e4f1",{scale:1});
  c.text(27,108,"HAND","#d7e4f1",{scale:1});c.text(92,108,"THIGH","#d7e4f1",{scale:1});c.text(164,108,"SHIN","#d7e4f1",{scale:1});c.text(230,108,"BOOT","#d7e4f1",{scale:1});
  c.text(7,124,"GOLD DOTS = ATTACHMENT PIVOTS · PARTS ALSO EXPORT AS INDIVIDUAL PNGS","#9fb2c8",{scale:1})
 }))

// Contact sheet: three independently rendered native canvas sizes, at native pixel art resolution.
scene("rook_spec_contact_sheet",{w:220,h:118,bg:"#101827"},
 layer("plate",c=>{c.rect(0,0,220,118,"#101827");c.text(8,6,"ONE DESIGN / THREE NATIVE SPECS","#f4dfaa",{scale:1});
   c.rect(8,22,58,88,"#1b293d");c.rect(80,22,58,88,"#1b293d");c.rect(152,22,58,88,"#1b293d");
   c.text(19,27,"32 PX","#c9d5e3",{scale:1});c.text(91,27,"48 PX","#c9d5e3",{scale:1});c.text(163,27,"64 PX","#c9d5e3",{scale:1});
   c.stamp("rook_spec32",25,46);c.stamp("rook_spec48",91,40);c.stamp("rook_spec64",157,34)
   c.text(15,103,"SHAPE","#aabbd0",{scale:1});c.text(88,103,"SEAMS / BAG","#aabbd0",{scale:1});c.text(160,103,"FACE / FOLDS","#aabbd0",{scale:1})
 }))

// Parts sheet is also a visual rig map: each group corresponds to a joint/segment used by the painter.
scene("rook_rig_parts_board",{w:300,h:132,bg:"#111a28"},
 layer("plate",c=>{c.rect(0,0,300,132,"#111a28");c.rect(0,0,300,18,"#24344b");c.text(8,5,"ROOK PART RIG / ATTACHMENT MAP","#f5e4bd",{scale:1});
   // head
   c.ellipse(24,42,9,10,P.hair);c.ellipse(26,44,6,7,P.skin);c.poly([16,40,20,31,28,31,33,36,27,38,21,39],P.hair)
   // torso
   c.poly([62,34,83,33,89,41,86,71,78,78,62,73,57,44],P.coatD);c.poly([63,37,81,36,84,44,81,69,65,68,61,44],P.coat)
   c.line(63,41,79,69,P.strap,3);c.rect(71,51,5,5,P.strapL)
   // upper/lower arm segments with elbow joints
   c.line(112,38,121,54,P.coat,8);c.ellipse(122,55,4,4,P.ink);c.line(122,55,131,67,P.skin,6);c.ellipse(132,69,4,3,P.skin)
   c.line(153,39,163,52,P.coatD,8);c.ellipse(164,54,4,4,P.ink);c.line(164,54,173,65,P.skinS,6)
   // leg chains / boots
   c.line(203,71,198,89,P.pants,9);c.ellipse(198,90,4,4,P.gold);c.line(198,90,201,105,P.pantsL,7);c.poly([197,103,205,103,210,109,199,111],P.boot)
   c.line(237,71,247,87,P.pants,9);c.ellipse(248,88,4,4,P.gold);c.line(248,88,248,103,P.pants,7);c.poly([245,101,253,101,258,107,247,109],P.boot)
   c.text(13,91,"HEAD","#d7e4f1",{scale:1});c.text(61,91,"TORSO","#d7e4f1",{scale:1});c.text(111,91,"NEAR ARM","#d7e4f1",{scale:1});c.text(153,91,"FAR ARM","#d7e4f1",{scale:1});c.text(194,116,"NEAR IK","#d7e4f1",{scale:1});c.text(246,116,"FAR LEG","#d7e4f1",{scale:1})
 }))

// Static skeleton debug plate: the cyan bones are attachment paths; gold joints are pivots.
scene("rook_rig_debug",{w:160,h:112,bg:"#101827"},
 layer("ground",c=>{c.rect(0,0,160,112,"#101827");c.rect(0,0,160,14,"#24344b");c.line(8,99,152,99,"#364760",1);c.text(5,4,"2-BONE RIG / IK","#f0d99f",{scale:1})}),
 layer("actor",c=>c.stamp("rook_spec64",24,21)),
 layer("bones",c=>{
   const ox=24,oy=21,pts=[[24,24,18,27],[18,27,14,33],[14,33,15,39],[31,25,34,31],[34,31,35,37],[24,40,20,49],[20,49,21,56],[24,40,29,49],[29,49,27,56]]
   for(const [x1,y1,x2,y2] of pts){c.line(ox+x1,oy+y1,ox+x2,oy+y2,P.blue,1);c.ellipse(ox+x1,oy+y1,1,1,P.gold);c.ellipse(ox+x2,oy+y2,1,1,P.gold)}
   c.text(104,34,"PIVOT","#f4d47d",{scale:1});c.text(104,45,"JOINT","#8be2ee",{scale:1});c.line(99,37,ox+30,oy+25,P.gold,1)
 }))

// Continuous-phase animation loops share the same articulated painter. Limb targets go through 2-bone IK.
anim("rook_idle_12",{w:48,h:64,frames:12,fps:24},c=>paintRook(c,c.phase,"idle",1,1,3))
anim("rook_walk_16",{w:48,h:64,frames:16,fps:24},c=>paintRook(c,c.phase,"walk",1,1,3))
anim("rook_hammer_attack_12",{w:48,h:64,frames:12,fps:24},c=>paintRook(c,c.phase,"attack",1,1,3))
anim("rook_kneel_reach_12",{w:48,h:64,frames:12,fps:24},c=>paintRook(c,c.phase,"kneel",1,1,3))

// New props: a lockbox state change and a small forge with phase-driven flame/light.
sprite("prop_iron_lockbox",{w:40,h:30,outline:P.ink},c=>{
 c.poly([4,12,20,5,36,12,20,19],P.stoneL);c.poly([4,12,20,19,20,28,4,21],P.stone);c.poly([20,19,36,12,36,21,20,28],P.ink2)
 c.line(8,14,19,20,1,P.gold);c.rect(18,17,4,5,P.gold);c.px(19,18,P.ink)
})
anim("prop_lockbox_open_8",{w:40,h:34,frames:8,fps:12},c=>{
 const phase=c.phase, lift=Math.round(Math.sin(Math.min(phase*2,1)*Math.PI/2)*7)
 c.ellipse(20,30,17,3,P.ink);c.poly([4,15,20,22,36,15,36,26,20,32,4,25],P.stone);c.poly([4,15,20,22,20,32,4,25],P.stone);c.poly([20,22,36,15,36,26,20,32],P.ink2)
 c.poly([4,15,20,8-lift,36,15,20,22],P.stoneL);c.line(7,15,20,21,1,P.gold);c.rect(18,20,4,5,P.gold)
 if(phase>.15){c.px(20,12,P.glow);c.px(25,10,P.gold);c.px(15,11,P.gold)}
},glow("g",{r:6,strength:.25}))

anim("prop_mini_forge_ember_12",{w:36,h:42,frames:12,fps:12},c=>{
 c.ellipse(18,38,15,3,P.ink);c.poly([5,19,12,14,24,14,31,19,29,34,7,34],P.stone);c.poly([8,21,13,17,23,17,28,21,27,32,9,32],P.ink)
 c.rect(12,26,12,7,P.wood);c.rect(14,28,8,4,P.ink)
 const sway=Math.round(Math.sin(c.phase*tau)*2),rise=Math.round(Math.cos(c.phase*tau*2)*2)
 c.poly([13,30,14+sway,24,17+sway,19+rise,19,26,22-sway,30],P.flame);c.poly([15,30,17+sway,25,19,22+rise,21,30],P.flameL);c.px(18,27,"g")
 c.lamp(18,24,{r:27,power:.8,color:"#ff974f",z:3})
},glow("g",{r:7,strength:.35}))

sprite("prop_bread_crate_3q",{w:48,h:36,outline:P.ink},c=>{
 c.poly([4,12,24,4,44,12,24,21],P.woodL);c.poly([4,12,24,21,24,33,4,24],P.wood);c.poly([24,21,44,12,44,24,24,33],P.red)
 c.line(8,14,23,21,2,P.strapL);c.line(27,20,40,14,1,P.woodL);c.line(9,20,9,25,1,P.woodL);c.line(17,23,17,29,1,P.woodL);c.line(32,20,32,27,1,P.redL)
 c.ellipse(17,12,4,3,"#e9bf78");c.ellipse(25,11,4,3,"#f1d398");c.ellipse(33,13,4,3,"#d99c5a");c.px(17,11,P.shirt);c.px(25,10,P.shirt);c.px(33,12,P.shirt)
})
sprite("prop_copper_lantern",{w:22,h:36,outline:P.ink},c=>{
 c.line(11,3,11,8,2,P.stoneL);c.rect(6,8,10,3,P.stone);c.poly([7,11,15,11,18,22,15,29,7,29,4,22],P.stone);c.rect(7,14,8,11,P.glow);c.rect(9,14,4,10,P.gold);c.rect(6,29,10,3,P.ink2);c.line(7,10,7,28,1,P.stoneL);c.line(15,10,15,28,1,P.stoneL);c.lamp(11,19,{r:34,power:1,color:"#ffcf79",z:4})
},glow("g",{r:6,strength:.3}))

scene("rook_workbench_asset_stage",{w:180,h:112,bg:"#111a28"},
 layer("room",c=>{c.rect(0,0,180,112,"#182235");c.rect(0,52,180,60,"#313442");c.rect(0,44,180,8,"#66513e");c.line(0,45,180,45,"#b47a4b",2);c.rect(0,95,180,17,"#242836")}),
 layer("props",c=>{c.stamp("prop_copper_lantern",20,13);c.stamp("prop_bread_crate_3q",65,58);c.stamp("rook_spec48",119,37);c.stamp("prop_iron_lockbox",137,72);c.text(7,7,"PROP SCALE + STAGING","#f5dfaf",{scale:1})}),
 layer("shadow",c=>c.poly([59,91,106,90,122,96,70,99],P.ink)))

sheet("rook_gallery_sheet",["rook_spec*","prop_*","rook_*"],{cols:5,pad:2})
