/**
 * Harrow Settlers - World Generation
 * Generates an island map with natural height/moisture variation, terrain features,
 * resources, and a valid starting location for the HQ.
 */

import { T, BUILDABLE } from './defs.js';
import { mulberry32 } from '../util/rng.js';
import { makeValueNoise, fbm } from '../util/noise.js';

/**
 * Calculates array index from coordinates.
 * @param {number|{w: number}} w Width or object with property `w`
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @returns {number} Linear array index
 */
export function idx(w, x, y) {
  const width = typeof w === 'number' ? w : w.w;
  return y * width + x;
}

/**
 * Checks whether coordinates are within world boundaries.
 * @param {object|number} world World object `{w, h}` or width `w`
 * @param {number} x X coordinate or height `h` (if first arg is width)
 * @param {number} y Y coordinate or x coordinate
 * @param {number} [py] Y coordinate (if first two args are w, h)
 * @returns {boolean} True if within bounds
 */
export function inBounds(world, x, y, py) {
  let w, h, px, pY;
  if (typeof world === 'number') {
    w = world;
    h = x;
    px = y;
    pY = py;
  } else {
    w = world.w;
    h = world.h;
    px = x;
    pY = y;
  }
  return px >= 0 && px < w && pY >= 0 && pY < h;
}

/**
 * Generates a deterministic game world.
 * @param {number} seed 32-bit random seed
 * @param {number} [w=96] Map width in tiles
 * @param {number} [h=96] Map height in tiles
 * @returns {{
 *   w: number,
 *   h: number,
 *   seed: number,
 *   terrain: Uint8Array,
 *   tree: Uint8Array,
 *   rock: Uint8Array,
 *   ore: Uint8Array,
 *   fish: Uint8Array,
 *   start: {x: number, y: number},
 *   deco: Uint8Array
 * }} Generated world object
 */
export function generateWorld(seed, w = 96, h = 96) {
  const size = w * h;
  const terrain = new Uint8Array(size);
  const tree = new Uint8Array(size);
  const rock = new Uint8Array(size);
  const ore = new Uint8Array(size);
  const fish = new Uint8Array(size);
  const deco = new Uint8Array(size);

  const nHeight = makeValueNoise(seed);
  const nMoist = makeValueNoise((seed + 1000) >>> 0);
  const nDetail = makeValueNoise((seed + 2000) >>> 0);

  const cx = w / 2;
  const cy = h / 2;

  // Step 1: Generate base terrain and natural resource distributions
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;

      // Ensure border margin (at least outer 3 tiles) is strictly DEEP ocean
      if (x < 3 || x >= w - 3 || y < 3 || y >= h - 3) {
        terrain[i] = T.DEEP;
        continue;
      }

      // Normalized radial distance from map center
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Radial island falloff
      const falloff = Math.max(0, 1 - Math.pow(dist, 2.2));
      const height = fbm(nHeight, x * 0.04, y * 0.04, 4, 2, 0.5) * falloff;
      const moist = fbm(nMoist, x * 0.05, y * 0.05, 3, 2, 0.5);
      const detail = nDetail(x * 0.1, y * 0.1);

      if (height < 0.18) {
        terrain[i] = T.DEEP;
      } else if (height < 0.25) {
        terrain[i] = T.WATER;
      } else if (height < 0.32) {
        terrain[i] = T.SAND;
      } else if (height < 0.65) {
        if (moist > 0.52) {
          terrain[i] = T.FOREST_FLOOR;
        } else {
          terrain[i] = T.GRASS;
        }
      } else if (height < 0.78) {
        terrain[i] = T.ROCK;
      } else if (height < 0.88) {
        terrain[i] = T.MOUNTAIN;
      } else {
        terrain[i] = T.SNOW;
      }

      // Populate features
      const t = terrain[i];
      if (t === T.ROCK) {
        rock[i] = 15;
      } else if (t === T.MOUNTAIN) {
        ore[i] = 20;
      } else if (t === T.FOREST_FLOOR) {
        if (detail < 0.60) {
          tree[i] = 2; // mature tree
        } else if (detail < 0.75) {
          tree[i] = 1; // sapling
        }
      } else if (t === T.GRASS) {
        if (detail < 0.18) {
          tree[i] = 2;
        } else if (detail < 0.24) {
          tree[i] = 1;
        } else {
          deco[i] = Math.floor(detail * 100) % 4;
        }
      }
    }
  }

  // Step 2: Search for best starting position near center
  let bestStart = null;
  let bestScore = -Infinity;

  const searchR = 20;
  const startXMin = Math.max(4, Math.floor(cx) - searchR);
  const startXMax = Math.min(w - 7, Math.floor(cx) + searchR);
  const startYMin = Math.max(4, Math.floor(cy) - searchR);
  const startYMax = Math.min(h - 7, Math.floor(cy) + searchR);

  for (let sy = startYMin; sy <= startYMax; sy++) {
    for (let sx = startXMin; sx <= startXMax; sx++) {
      let flat = true;
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
          const t = terrain[(sy + dy) * w + (sx + dx)];
          if (t !== T.GRASS && t !== T.FOREST_FLOOR) {
            flat = false;
            break;
          }
        }
        if (!flat) break;
      }

      let score = 0;
      if (flat) score += 1000;

      // Penalize distance from center
      const distFromCenter = Math.hypot(sx + 1 - cx, sy + 1 - cy);
      score -= distFromCenter * 10;

      if (score > bestScore) {
        bestScore = score;
        bestStart = { x: sx, y: sy };
      }
    }
  }

  if (!bestStart) {
    bestStart = { x: Math.floor(cx) - 1, y: Math.floor(cy) - 1 };
  }

  const sx = bestStart.x;
  const sy = bestStart.y;

  // Step 3: Clear 3x3 start area for HQ
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 3; dx++) {
      const i = (sy + dy) * w + (sx + dx);
      terrain[i] = T.GRASS;
      tree[i] = 0;
      rock[i] = 0;
      ore[i] = 0;
      fish[i] = 0;
    }
  }

  // Helper to check if terrain condition holds within radius
  function hasTerrainWithin(checkFn, r) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = sx + dx;
        const ty = sy + dy;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
          const dist = Math.hypot(tx - sx, ty - sy);
          const i = ty * w + tx;
          if (dist <= r && checkFn(i, tx, ty)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Step 4: Ensure nearby required resources (WATER <= 14, ROCK <= 14, MOUNTAIN <= 22)
  const hasWater = hasTerrainWithin((i) => terrain[i] === T.WATER || terrain[i] === T.DEEP, 14);
  if (!hasWater) {
    for (let dy = 1; dy <= 3; dy++) {
      for (let dx = -8; dx <= -6; dx++) {
        const tx = sx + dx;
        const ty = sy + dy;
        if (tx >= 3 && tx < w - 3 && ty >= 3 && ty < h - 3) {
          const i = ty * w + tx;
          terrain[i] = T.WATER;
          tree[i] = 0;
          rock[i] = 0;
          ore[i] = 0;
        }
      }
    }
  }

  const hasRock = hasTerrainWithin((i) => terrain[i] === T.ROCK || rock[i] > 0, 14);
  if (!hasRock) {
    for (let dy = 1; dy <= 3; dy++) {
      for (let dx = 6; dx <= 8; dx++) {
        const tx = sx + dx;
        const ty = sy + dy;
        if (tx >= 3 && tx < w - 3 && ty >= 3 && ty < h - 3) {
          const i = ty * w + tx;
          terrain[i] = T.ROCK;
          rock[i] = 15;
          tree[i] = 0;
          ore[i] = 0;
        }
      }
    }
  }

  const hasMountain = hasTerrainWithin((i) => terrain[i] === T.MOUNTAIN, 22);
  if (!hasMountain) {
    for (let dy = -6; dy <= -4; dy++) {
      for (let dx = 9; dx <= 11; dx++) {
        const tx = sx + dx;
        const ty = sy + dy;
        if (tx >= 3 && tx < w - 3 && ty >= 3 && ty < h - 3) {
          const i = ty * w + tx;
          terrain[i] = T.MOUNTAIN;
          ore[i] = 20;
          tree[i] = 0;
          rock[i] = 0;
        }
      }
    }
  }

  // Step 5: Ensure >= 10 mature trees within 8 tiles
  function countTrees() {
    let count = 0;
    for (let dy = -8; dy <= 8; dy++) {
      for (let dx = -8; dx <= 8; dx++) {
        const tx = sx + dx;
        const ty = sy + dy;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
          if (tx >= sx && tx <= sx + 2 && ty >= sy && ty <= sy + 2) continue;
          const dist = Math.hypot(tx - sx, ty - sy);
          if (dist <= 8 && tree[ty * w + tx] === 2) {
            count++;
          }
        }
      }
    }
    return count;
  }

  let matureCount = countTrees();
  if (matureCount < 10) {
    for (let dy = -6; dy <= 6 && matureCount < 12; dy++) {
      for (let dx = -6; dx <= 6 && matureCount < 12; dx++) {
        const tx = sx + dx;
        const ty = sy + dy;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
          if (tx >= sx && tx <= sx + 2 && ty >= sy && ty <= sy + 2) continue;
          const dist = Math.hypot(tx - sx, ty - sy);
          if (dist <= 7) {
            const i = ty * w + tx;
            if (terrain[i] !== T.DEEP && terrain[i] !== T.WATER && terrain[i] !== T.ROCK && terrain[i] !== T.MOUNTAIN) {
              if (!BUILDABLE[terrain[i]]) {
                terrain[i] = T.GRASS;
              }
              if (tree[i] !== 2) {
                tree[i] = 2;
                rock[i] = 0;
                ore[i] = 0;
                matureCount++;
              }
            }
          }
        }
      }
    }
  }

  // Step 6: Recalculate fish abundance on WATER tiles adjacent to land
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (terrain[i] === T.WATER) {
        let nearLand = false;
        const nbrs = [i - 1, i + 1, i - w, i + w];
        for (let k = 0; k < 4; k++) {
          const nt = terrain[nbrs[k]];
          if (nt !== T.WATER && nt !== T.DEEP) {
            nearLand = true;
            break;
          }
        }
        if (nearLand) {
          fish[i] = 10;
        }
      }
    }
  }

  return {
    w,
    h,
    seed,
    terrain,
    tree,
    rock,
    ore,
    fish,
    start: bestStart,
    deco,
  };
}
