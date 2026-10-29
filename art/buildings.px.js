/* global pal, ramps, sprite */

// Warm Settlers-style building palette with 4-6 tones per material
pal({
  // Dark Outlines & Shadows
  k: "#16121e", // Primary dark outline
  d: "#2a1c22", // Deep shadow / dark trim
  s: "#3c4354", // Dark stone shadow
  S: "#63718a", // Base stone
  t: "#94a2b8", // Light stone
  T: "#cbd5e1", // Stone highlight

  // Wood & Timber Framing
  w: "#362018", // Dark wood seam
  W: "#663e28", // Wood shadow
  o: "#9c6038", // Base timber / plank
  O: "#d18e4f", // Light wood
  L: "#f0c480", // Wood highlight / grain

  // Clay Tile Roof
  r: "#4a191b", // Dark roof rim
  R: "#852a28", // Clay red shadow
  c: "#c44833", // Base clay red
  C: "#eb734e", // Light red tile
  p: "#faaa8c", // Roof tile highlight

  // Thatch / Straw / Wheat / Gold
  y: "#57401a", // Dark straw
  Y: "#967226", // Straw shadow
  e: "#d4a335", // Base straw / wheat
  E: "#f7df63", // Bright straw highlight

  // Foliage / Grass / Vines
  g: "#234020", // Dark green
  G: "#447836", // Base green
  h: "#6fa850", // Light foliage highlight

  // Metals / Iron / Steel
  m: "#262e36", // Dark metal
  M: "#4f5d6b", // Base iron
  i: "#899ba6", // Light metal
  I: "#cfdbe3", // Steel glint

  // Fire / Furnace / Glow
  f: "#9c2a00", // Dark fire orange
  F: "#ee6600", // Flame orange
  l: "#ffcf33", // Bright yellow glow

  // Plaster / Cloth / Banners
  a: "#e6dad0", // Plaster / canvas light
  A: "#b0a090", // Plaster shadow
  b: "#182848", // Dark royal blue
  B: "#2d57b5", // Banner blue
  u: "#5690f5"  // Light blue highlight
});

ramps("ksStT", "wWoOL", "rRcCp", "yYeE", "gGh", "mMiI", "fFl", "bBu");

// --- HELPER RENDERING FUNCTIONS ---

function drawShadow(c, x, y, w, h) {
  c.rect(x + 1, y + h - 2, w - 2, 2, "k");
  c.hline(x + 2, y + h - 1, w - 4, "d");
}

function drawStoneWall(c, x, y, w, h) {
  c.rect(x, y, w, h, "S");
  c.box(x, y, w, h, "k");
  // Top-left light, bottom-right shadow
  c.hline(x + 1, y + 1, w - 2, "T");
  c.vline(x + 1, y + 1, h - 2, "t");
  c.vline(x + w - 2, y + 1, h - 2, "s");
  c.hline(x + 1, y + h - 2, w - 2, "s");

  // Brick seams
  for (let py = y + 4; py < y + h - 2; py += 4) {
    c.hline(x + 1, py, w - 2, "s");
    const offset = ((py - y) / 4) % 2 === 0 ? 0 : 4;
    for (let px = x + 4 + offset; px < x + w - 2; px += 8) {
      c.vline(px, py - 3, 3, "s");
    }
  }
}

function drawWoodWall(c, x, y, w, h) {
  c.rect(x, y, w, h, "o");
  c.box(x, y, w, h, "k");
  c.hline(x + 1, y + 1, w - 2, "L");
  c.vline(x + 1, y + 1, h - 2, "O");
  c.vline(x + w - 2, y + 1, h - 2, "W");
  c.hline(x + 1, y + h - 2, w - 2, "W");

  // Plank lines
  for (let py = y + 3; py < y + h - 1; py += 3) {
    c.hline(x + 1, py, w - 2, "W");
    c.hline(x + 1, py + 1, w - 2, "O");
  }
}

function drawRoofClay(c, x, y, w, h) {
  // Pitched clay roof
  c.poly([x, y + h, x + Math.floor(w / 2), y, x + w, y + h], "c");
  // Outline
  c.line(x, y + h, x + Math.floor(w / 2), y, "k");
  c.line(x + Math.floor(w / 2), y, x + w, y + h, "k");
  c.hline(x, y + h, w, "k");

  // Shading: left slope bright, right slope shadow
  const mid = x + Math.floor(w / 2);
  c.poly([x + 1, y + h - 1, mid, y + 1, mid, y + h - 1], "C");
  c.poly([mid, y + 1, x + w - 1, y + h - 1, mid, y + h - 1], "R");

  // Ridge highlight & tile lines
  c.line(x + 2, y + h - 2, mid, y + 2, "p");
  for (let ry = y + 4; ry < y + h; ry += 3) {
    c.hline(x + 2, ry, w - 4, "r");
  }
}

function drawRoofThatch(c, x, y, w, h) {
  const mid = x + Math.floor(w / 2);
  c.poly([x, y + h, mid, y, x + w, y + h], "e");
  c.line(x, y + h, mid, y, "k");
  c.line(mid, y, x + w, y + h, "k");
  c.hline(x, y + h, w, "k");

  // Left highlight, right shadow
  c.poly([x + 1, y + h - 1, mid, y + 1, mid, y + h - 1], "E");
  c.poly([mid, y + 1, x + w - 1, y + h - 1, mid, y + h - 1], "Y");

  // Straw texture lines
  for (let ty = y + 3; ty < y + h; ty += 3) {
    c.hline(x + 2, ty, w - 4, "y");
  }
}

function drawDoor(c, x, y, w, h) {
  c.rect(x, y, w, h, "W");
  c.box(x, y, w, h, "k");
  c.hline(x + 1, y + 1, w - 2, "O");
  c.px(x + w - 2, y + Math.floor(h / 2), "I"); // Iron handle
}

function drawWindow(c, x, y, w, h) {
  c.rect(x, y, w, h, "l");
  c.box(x, y, w, h, "k");
  c.hline(x + 1, y + Math.floor(h / 2), w - 2, "k");
  c.vline(x + Math.floor(w / 2), y + 1, h - 2, "k");
}

function drawGenericScaffold(c, x, y, w, h, silhouette) {
  drawShadow(c, x, y, w, h);
  const baseH = Math.floor(h * 0.35);

  // Partial wall foundation
  if (silhouette === "stone") {
    drawStoneWall(c, x + 2, y + h - baseH, w - 4, baseH - 2);
  } else if (silhouette === "wood") {
    drawWoodWall(c, x + 2, y + h - baseH, w - 4, baseH - 2);
  } else {
    c.rect(x + 2, y + h - baseH, w - 4, baseH - 2, "R");
    c.box(x + 2, y + h - baseH, w - 4, baseH - 2, "k");
  }

  // Vertical timber scaffold poles
  const poles = [x + 2, x + Math.floor(w / 3), x + Math.floor((w * 2) / 3), x + w - 3];
  poles.forEach(px => {
    c.vline(px, y + 2, h - 4, "O");
    c.vline(px + 1, y + 2, h - 4, "W");
  });

  // Horizontal catwalk stages
  const stages = [y + Math.floor(h * 0.3), y + Math.floor(h * 0.6)];
  stages.forEach(sy => {
    if (sy > y + 2 && sy < y + h - 4) {
      c.rect(x + 1, sy, w - 2, 3, "O");
      c.box(x + 1, sy, w - 2, 3, "k");
      c.hline(x + 2, sy + 1, w - 4, "L");
    }
  });

  // Cross bracing
  c.line(poles[0], y + 4, poles[1], stages[0], "W");
  c.line(poles[1], y + 4, poles[0], stages[0], "W");
  c.line(poles[2], stages[0], poles[3], stages[1] || (y + h - 4), "W");

  // Ladder
  const lx = x + Math.floor(w / 2) - 2;
  c.vline(lx, y + 8, h - 12, "w");
  c.vline(lx + 4, y + 8, h - 12, "w");
  for (let ly = y + 10; ly < y + h - 6; ly += 4) {
    c.hline(lx, ly, 5, "O");
  }
}

// ============================================================================
// 1. HEADQUARTERS / CASTLE (b_hq: 48x64)
// ============================================================================
sprite("b_hq", { w: 48, h: 64 }, (c) => {
  drawShadow(c, 2, 16, 44, 48);

  // Main Castle Keep
  drawStoneWall(c, 10, 20, 28, 42);

  // Side Towers
  drawStoneWall(c, 4, 24, 10, 38);
  drawStoneWall(c, 34, 24, 10, 38);

  // Crenellations / Battlements
  [4, 10, 34, 40].forEach(bx => {
    c.rect(bx, 20, 4, 5, "S");
    c.box(bx, 20, 4, 5, "k");
    c.hline(bx + 1, 21, 2, "T");
  });
  [12, 18, 24, 30].forEach(bx => {
    c.rect(bx, 15, 4, 6, "S");
    c.box(bx, 15, 4, 6, "k");
    c.hline(bx + 1, 16, 2, "T");
  });

  // Central Spire Cap
  c.poly([18, 15, 24, 4, 30, 15], "r");
  c.line(18, 15, 24, 4, "k");
  c.line(24, 4, 30, 15, "k");
  c.poly([19, 14, 24, 5, 24, 14], "c");

  // Flagpole & Flying Banner (strictly inside canvas y=0..14)
  c.vline(24, 0, 12, "i");
  c.px(24, 0, "I");
  c.poly([25, 1, 35, 4, 25, 8], "B");
  c.line(25, 1, 35, 4, "u");
  c.line(35, 4, 25, 8, "b");

  // Grand Arched Double Entrance
  c.rect(18, 44, 12, 18, "w");
  c.box(18, 44, 12, 18, "k");
  c.hline(19, 45, 10, "L");
  c.vline(23, 45, 17, "k"); // Split line
  c.px(21, 53, "I"); // Left handle
  c.px(25, 53, "I"); // Right handle

  // Torches flanking entrance
  [15, 31].forEach(tx => {
    c.vline(tx, 48, 4, "w");
    c.px(tx, 47, "F");
    c.px(tx, 46, "l");
  });
});

sprite("b_hq_scaffold", { w: 48, h: 64 }, (c) => {
  drawGenericScaffold(c, 2, 16, 44, 48, "stone");
  // Additional crane pulley hoist
  c.vline(36, 6, 20, "O");
  c.hline(28, 6, 12, "O");
  c.line(28, 12, 36, 6, "W");
  c.vline(28, 7, 14, "w");
  c.rect(26, 21, 5, 5, "S");
});

// ============================================================================
// 2. SETTLER HUT (b_hut: 32x48)
// ============================================================================
sprite("b_hut", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Plaster & half-timber base
  c.rect(4, 26, 24, 20, "a");
  c.box(4, 26, 24, 20, "k");
  c.vline(4, 26, 20, "W");
  c.vline(16, 26, 20, "W");
  c.vline(27, 26, 20, "W");

  // Clay tile roof
  drawRoofClay(c, 2, 8, 28, 20);

  // Chimney & Smoke
  c.rect(22, 4, 4, 10, "S");
  c.box(22, 4, 4, 10, "k");
  c.px(21, 2, "a");
  c.px(20, 0, "a");

  // Door & Window with flowerbox
  drawDoor(c, 8, 34, 6, 12);
  drawWindow(c, 18, 32, 6, 6);
  c.hline(17, 39, 8, "o");
  c.px(18, 38, "c");
  c.px(20, 38, "l");
  c.px(22, 38, "c");
});

sprite("b_hut_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "wood");
});

// ============================================================================
// 3. WOODCUTTER (b_woodcutter: 32x48)
// ============================================================================
sprite("b_woodcutter", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Log cabin house
  drawWoodWall(c, 2, 22, 18, 24);
  drawRoofThatch(c, 0, 10, 22, 14);
  drawDoor(c, 7, 34, 6, 12);

  // PROPS: Stacked log pile (bottom right)
  for (let ly = 38; ly <= 44; ly += 3) {
    for (let lx = 21; lx <= 28; lx += 4) {
      c.rect(lx, ly, 4, 3, "o");
      c.box(lx, ly, 4, 3, "k");
      c.px(lx + 1, ly + 1, "L");
    }
  }

  // PROPS: Tree stump & axe wedged in stump
  c.rect(22, 28, 6, 6, "O");
  c.box(22, 28, 6, 6, "k");
  c.px(24, 29, "L");
  // Axe head & handle
  c.line(23, 23, 26, 28, "W");
  c.px(23, 23, "I");
  c.px(22, 24, "M");
});

sprite("b_woodcutter_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "wood");
  // Unfinished log stack prop
  c.rect(21, 40, 8, 6, "o");
  c.box(21, 40, 8, 6, "k");
});

// ============================================================================
// 4. FORESTER (b_forester: 32x48)
// ============================================================================
sprite("b_forester", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  drawWoodWall(c, 3, 22, 18, 24);
  drawRoofThatch(c, 1, 10, 22, 14);
  drawDoor(c, 8, 34, 6, 12);

  // Overgrown vines on roof
  c.px(4, 14, "G");
  c.px(5, 15, "h");
  c.px(14, 12, "G");

  // PROPS: Sapling Bench & Pots
  c.rect(21, 36, 10, 3, "o");
  c.box(21, 36, 10, 3, "k");
  // Pots with tiny trees
  [22, 25, 28].forEach(px => {
    c.rect(px, 32, 2, 4, "R");
    c.vline(px, 29, 3, "W");
    c.px(px - 1, 28, "h");
    c.px(px, 27, "G");
    c.px(px + 1, 28, "h");
  });
});

sprite("b_forester_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "wood");
});

// ============================================================================
// 5. QUARRY (b_quarry: 32x48)
// ============================================================================
sprite("b_quarry", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Open stonecutter shed
  drawStoneWall(c, 2, 24, 18, 22);
  // Open front bay
  c.rect(6, 32, 10, 14, "k");

  // Roof
  drawRoofClay(c, 0, 12, 22, 14);

  // PROPS: Cut stone blocks
  c.rect(21, 36, 8, 5, "S");
  c.box(21, 36, 8, 5, "k");
  c.hline(22, 37, 6, "T");

  c.rect(23, 30, 6, 5, "S");
  c.box(23, 30, 6, 5, "k");
  c.hline(24, 31, 4, "T");

  // Pickaxe leaning on stone
  c.line(20, 32, 24, 42, "W");
  c.hline(19, 32, 3, "I");
});

sprite("b_quarry_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "stone");
});

// ============================================================================
// 6. SAWMILL (b_sawmill: 48x48)
// ============================================================================
sprite("b_sawmill", { w: 48, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 44, 32);

  // Timber building
  drawWoodWall(c, 2, 20, 32, 26);
  drawRoofClay(c, 0, 6, 36, 16);
  drawDoor(c, 6, 32, 6, 14);

  // PROPS: Circular Saw Blade & Carriage Bed
  c.rect(32, 28, 14, 4, "W");
  c.box(32, 28, 14, 4, "k");

  // Saw blade disk
  c.rect(36, 20, 8, 12, "M");
  c.box(36, 20, 8, 12, "k");
  c.hline(37, 21, 6, "I");
  c.px(40, 26, "k"); // Center arbor

  // Stacked finished timber planks
  for (let py = 38; py <= 44; py += 3) {
    c.rect(34, py, 12, 2, "O");
    c.box(34, py, 12, 2, "k");
    c.hline(35, py, 10, "L");
  }
});

sprite("b_sawmill_scaffold", { w: 48, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 44, 32, "wood");
});

// ============================================================================
// 7. FISHER (b_fisher: 32x48)
// ============================================================================
sprite("b_fisher", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Pier stilts
  [4, 18, 26].forEach(px => {
    c.vline(px, 36, 11, "W");
    c.vline(px + 1, 36, 11, "w");
  });

  // Decking
  c.rect(2, 34, 28, 4, "O");
  c.box(2, 34, 28, 4, "k");

  // Stilt hut
  drawWoodWall(c, 2, 20, 18, 15);
  drawRoofThatch(c, 0, 10, 22, 12);
  drawDoor(c, 6, 24, 5, 10);

  // PROPS: Net drying rack with hanging fish
  c.vline(22, 20, 14, "W");
  c.vline(29, 20, 14, "W");
  c.hline(22, 20, 8, "W");
  // Net mesh
  for (let ny = 22; ny < 32; ny += 2) {
    c.hline(23, ny, 6, "A");
  }
  // Hanging fish
  c.px(24, 25, "i"); c.px(24, 26, "I");
  c.px(27, 27, "i"); c.px(27, 28, "I");
});

sprite("b_fisher_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "wood");
});

// ============================================================================
// 8. FARM (b_farm: 48x64)
// ============================================================================
sprite("b_farm", { w: 48, h: 64 }, (c) => {
  drawShadow(c, 2, 16, 44, 48);

  // Large Gambrel Barn
  c.rect(4, 28, 28, 34, "R");
  c.box(4, 28, 28, 34, "k");
  c.hline(5, 29, 26, "C");

  // Gambrel Roof
  c.poly([2, 28, 18, 8, 34, 28], "c");
  c.line(2, 28, 18, 8, "k");
  c.line(18, 8, 34, 28, "k");
  c.hline(2, 28, 32, "k");

  // Loft Door
  drawDoor(c, 13, 18, 10, 8);
  drawDoor(c, 12, 44, 12, 18);

  // PROPS: Massive Golden Haystack
  c.poly([32, 62, 40, 36, 47, 62], "e");
  c.line(32, 62, 40, 36, "k");
  c.line(40, 36, 47, 62, "k");
  c.hline(32, 62, 15, "k");
  c.poly([33, 61, 40, 38, 40, 61], "E");
  c.poly([40, 38, 46, 61, 40, 61], "Y");

  // Pitchfork stuck in ground
  c.vline(34, 48, 14, "W");
  c.hline(33, 48, 3, "I");
});

sprite("b_farm_scaffold", { w: 48, h: 64 }, (c) => {
  drawGenericScaffold(c, 2, 16, 44, 48, "wood");
});

// ============================================================================
// 9. WINDMILL (b_mill: 32x64)
// ============================================================================
sprite("b_mill", { w: 32, h: 64 }, (c) => {
  drawShadow(c, 2, 16, 28, 48);

  // Tapered Stone Mill Tower
  c.poly([6, 18, 25, 18, 28, 62, 3, 62], "S");
  c.line(6, 18, 3, 62, "k");
  c.line(25, 18, 28, 62, "k");
  c.hline(3, 62, 25, "k");

  // Tower shading
  c.poly([7, 19, 15, 19, 15, 61, 4, 61], "t");
  c.poly([15, 19, 24, 19, 27, 61, 15, 61], "s");

  // Cap Roof
  c.poly([5, 18, 15, 8, 26, 18], "r");
  c.line(5, 18, 15, 8, "k");
  c.line(15, 8, 26, 18, "k");

  drawDoor(c, 12, 48, 8, 14);

  // WINDMILL SAILS (strictly bounded inside x=0..31, y=0..63)
  const cx = 15, cy = 17;
  c.px(cx, cy, "k");

  // 4 Blades with cloth sails
  // Top-Left blade
  c.line(cx, cy, 3, 5, "W");
  c.poly([cx, cy, 3, 5, 1, 9], "a");
  // Top-Right blade
  c.line(cx, cy, 27, 5, "W");
  c.poly([cx, cy, 27, 5, 29, 9], "a");
  // Bottom-Left blade
  c.line(cx, cy, 3, 29, "W");
  c.poly([cx, cy, 3, 29, 1, 25], "a");
  // Bottom-Right blade
  c.line(cx, cy, 27, 29, "W");
  c.poly([cx, cy, 27, 29, 29, 25], "a");

  // Center hub
  c.rect(cx - 2, cy - 2, 5, 5, "I");
  c.box(cx - 2, cy - 2, 5, 5, "k");

  // PROPS: Flour sacks at base
  c.rect(22, 54, 5, 8, "a");
  c.box(22, 54, 5, 8, "k");
  c.hline(23, 55, 3, "A");

  c.rect(25, 57, 5, 5, "a");
  c.box(25, 57, 5, 5, "k");
});

sprite("b_mill_scaffold", { w: 32, h: 64 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 48, "stone");
});

// ============================================================================
// 10. BAKERY (b_bakery: 32x48)
// ============================================================================
sprite("b_bakery", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Brick Building
  c.rect(2, 22, 18, 24, "R");
  c.box(2, 22, 18, 24, "k");
  c.hline(3, 23, 16, "C");
  drawRoofClay(c, 0, 10, 22, 14);
  drawDoor(c, 7, 34, 6, 12);

  // Stone Chimney Stack
  drawStoneWall(c, 21, 8, 8, 38);

  // Oven mouth with glowing fire
  c.rect(22, 36, 6, 8, "k");
  c.rect(23, 38, 4, 6, "F");
  c.px(24, 40, "l");

  // Smoke from chimney top
  c.px(24, 5, "a");
  c.px(23, 3, "a");
  c.px(22, 1, "a");

  // Bread display basket
  c.rect(13, 38, 6, 4, "o");
  c.box(13, 38, 6, 4, "k");
  c.px(14, 37, "e");
  c.px(16, 37, "E");
});

sprite("b_bakery_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "stone");
});

// ============================================================================
// 11. MINE (b_mine: 32x48)
// ============================================================================
sprite("b_mine", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Earth/Rock mound
  c.poly([1, 46, 8, 16, 24, 16, 30, 46], "S");
  c.line(1, 46, 8, 16, "k");
  c.line(8, 16, 24, 16, "k");
  c.line(24, 16, 30, 46, "k");

  // Timber framed tunnel mouth
  c.rect(8, 24, 16, 22, "k");
  c.box(8, 24, 16, 22, "W");
  c.box(7, 23, 18, 24, "k");
  c.hline(8, 24, 16, "O");

  // Minecart tracks
  c.hline(10, 44, 12, "M");
  c.hline(10, 46, 12, "M");
  for (let rx = 11; rx <= 20; rx += 3) {
    c.vline(rx, 43, 4, "w");
  }

  // Minecart with ore & coal
  c.rect(12, 36, 8, 6, "m");
  c.box(12, 36, 8, 6, "k");
  c.px(13, 35, "i"); // Iron ore
  c.px(15, 35, "I");
  c.px(17, 35, "k"); // Coal

  // Hanging lantern
  c.px(16, 25, "I");
  c.px(16, 26, "l");
});

sprite("b_mine_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "stone");
});

// ============================================================================
// 12. SMELTER (b_smelter: 32x48)
// ============================================================================
sprite("b_smelter", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Blast Furnace Masonry
  drawStoneWall(c, 2, 18, 22, 28);
  drawStoneWall(c, 14, 4, 8, 16); // Tall stack

  // Furnace fire arch opening
  c.rect(6, 32, 12, 14, "k");
  c.rect(7, 34, 10, 12, "f");
  c.rect(8, 36, 8, 10, "F");
  c.rect(10, 38, 4, 8, "l");

  // Sparks & Smoke
  c.px(17, 2, "F");
  c.px(18, 0, "l");

  // Slag & Iron Ingots on ground
  c.rect(21, 40, 8, 3, "M");
  c.box(21, 40, 8, 3, "k");
  c.hline(22, 40, 6, "I");
});

sprite("b_smelter_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "stone");
});

// ============================================================================
// 13. SMITHY (b_smith: 48x48)
// ============================================================================
sprite("b_smith", { w: 48, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 44, 32);

  // Open Forge Building
  drawStoneWall(c, 2, 20, 26, 26);
  drawRoofClay(c, 0, 6, 30, 16);

  // Hearth Fire Arch
  c.rect(6, 30, 12, 16, "k");
  c.rect(7, 32, 10, 14, "f");
  c.rect(8, 34, 8, 12, "F");
  c.px(11, 38, "l");

  // PROPS: Anvil on Stump (Right side)
  c.rect(34, 38, 8, 8, "O"); // Stump
  c.box(34, 38, 8, 8, "k");

  // Anvil
  c.rect(32, 32, 12, 6, "M");
  c.box(32, 32, 12, 6, "k");
  c.hline(33, 32, 10, "I"); // Highlight top
  c.rect(42, 33, 3, 2, "M"); // Horn

  // Quenching Tub
  c.rect(22, 38, 7, 8, "W");
  c.box(22, 38, 7, 8, "k");
  c.hline(23, 40, 5, "u"); // Water surface
});

sprite("b_smith_scaffold", { w: 48, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 44, 32, "stone");
});

// ============================================================================
// 14. TOWER (b_tower: 32x48)
// ============================================================================
sprite("b_tower", { w: 32, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 28, 32);

  // Tall Stone Watchtower Body
  drawStoneWall(c, 6, 14, 20, 32);

  // Arrow Slits
  c.vline(15, 22, 6, "k");
  c.vline(15, 34, 6, "k");

  // Wooden Lookout Platform / Crowsnest
  c.rect(4, 10, 24, 6, "O");
  c.box(4, 10, 24, 6, "k");
  c.hline(5, 11, 22, "L");

  // Pitched Roof Canopy
  drawRoofClay(c, 2, 0, 28, 12);

  drawDoor(c, 12, 36, 8, 10);
});

sprite("b_tower_scaffold", { w: 32, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 28, 32, "stone");
});

// ============================================================================
// 15. MARKET (b_market: 48x48)
// ============================================================================
sprite("b_market", { w: 48, h: 48 }, (c) => {
  drawShadow(c, 2, 16, 44, 32);

  // Timber Stalls & Counters
  c.rect(4, 28, 40, 18, "o");
  c.box(4, 28, 40, 18, "k");
  c.hline(5, 29, 38, "L");

  // Striped Awnings / Canopies (Red & White)
  c.rect(2, 12, 44, 14, "a");
  c.box(2, 12, 44, 14, "k");
  for (let sx = 2; sx < 44; sx += 8) {
    c.rect(sx, 12, 4, 14, "c");
    c.hline(sx, 13, 4, "C");
  }
  // Scalloped awning edge
  for (let bx = 2; bx < 46; bx += 4) {
    c.px(bx, 26, "k");
  }

  // PROPS: Produce Crates & Sacks
  c.rect(8, 32, 8, 6, "W");
  c.box(8, 32, 8, 6, "k");
  c.hline(9, 31, 6, "c"); // Apples

  c.rect(20, 32, 8, 6, "W");
  c.box(20, 32, 8, 6, "k");
  c.hline(21, 31, 6, "h"); // Greens

  c.rect(32, 34, 6, 8, "a"); // Grain sack
  c.box(32, 34, 6, 8, "k");
});

sprite("b_market_scaffold", { w: 48, h: 48 }, (c) => {
  drawGenericScaffold(c, 2, 16, 44, 32, "wood");
});

// ============================================================================
// 16. MONUMENT / GREAT HALL (b_monument: 64x64)
// ============================================================================
sprite("b_monument", { w: 64, h: 64 }, (c) => {
  drawShadow(c, 2, 16, 60, 48);

  // Grand Stone Facade
  drawStoneWall(c, 6, 20, 52, 42);

  // Slate Roof
  c.poly([2, 22, 32, 6, 62, 22], "s");
  c.line(2, 22, 32, 6, "k");
  c.line(32, 6, 62, 22, "k");
  c.hline(2, 22, 60, "k");
  c.poly([3, 21, 32, 8, 32, 21], "t");

  // Gold Spires & Crests
  [6, 32, 58].forEach(sx => {
    c.vline(sx, 0, 8, "E");
    c.px(sx, 0, "l");
  });

  // Stained Glass Rose Window
  c.rect(26, 16, 12, 12, "b");
  c.box(26, 16, 12, 12, "k");
  c.px(28, 18, "u"); c.px(33, 18, "c");
  c.px(28, 23, "E"); c.px(33, 23, "u");

  // Grand Carved Oak Double Doors
  drawDoor(c, 24, 40, 16, 22);

  // Braziers with Fire
  [12, 48].forEach(bx => {
    c.rect(bx, 48, 6, 8, "S");
    c.box(bx, 48, 6, 8, "k");
    c.px(bx + 2, 46, "F");
    c.px(bx + 3, 45, "l");
  });
});

sprite("b_monument_scaffold", { w: 64, h: 64 }, (c) => {
  drawGenericScaffold(c, 2, 16, 60, 48, "stone");
  // Additional crane hoist lifting stone
  c.vline(48, 4, 30, "O");
  c.hline(36, 4, 18, "O");
  c.line(36, 12, 48, 4, "W");
  c.vline(38, 5, 20, "w");
  c.rect(35, 25, 8, 6, "S");
  c.box(35, 25, 8, 6, "k");
});
