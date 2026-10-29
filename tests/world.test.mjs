import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWorld, idx, inBounds } from '../src/sim/world.js';
import { T, BUILDABLE } from '../src/sim/defs.js';

test('world generation returns correct structure and typed array sizes', () => {
  const seed = 42;
  const w = 96;
  const h = 96;
  const world = generateWorld(seed, w, h);

  assert.strictEqual(world.w, w);
  assert.strictEqual(world.h, h);
  assert.strictEqual(world.seed, seed);

  assert.ok(world.terrain instanceof Uint8Array, 'terrain is Uint8Array');
  assert.ok(world.tree instanceof Uint8Array, 'tree is Uint8Array');
  assert.ok(world.rock instanceof Uint8Array, 'rock is Uint8Array');
  assert.ok(world.ore instanceof Uint8Array, 'ore is Uint8Array');
  assert.ok(world.fish instanceof Uint8Array, 'fish is Uint8Array');
  assert.ok(world.deco instanceof Uint8Array, 'deco is Uint8Array');

  const expectedSize = w * h;
  assert.strictEqual(world.terrain.length, expectedSize);
  assert.strictEqual(world.tree.length, expectedSize);
  assert.strictEqual(world.rock.length, expectedSize);
  assert.strictEqual(world.ore.length, expectedSize);
  assert.strictEqual(world.fish.length, expectedSize);
  assert.strictEqual(world.deco.length, expectedSize);
});

test('helper functions idx and inBounds', () => {
  const w = 96;
  const h = 96;
  const world = { w, h };

  // Test idx with number and object
  assert.strictEqual(idx(w, 10, 5), 5 * w + 10);
  assert.strictEqual(idx(world, 10, 5), 5 * w + 10);

  // Test inBounds with object
  assert.strictEqual(inBounds(world, 0, 0), true);
  assert.strictEqual(inBounds(world, 95, 95), true);
  assert.strictEqual(inBounds(world, -1, 10), false);
  assert.strictEqual(inBounds(world, 10, -1), false);
  assert.strictEqual(inBounds(world, 96, 10), false);
  assert.strictEqual(inBounds(world, 10, 96), false);

  // Test inBounds with dimensions
  assert.strictEqual(inBounds(w, h, 0, 0), true);
  assert.strictEqual(inBounds(w, h, 95, 95), true);
  assert.strictEqual(inBounds(w, h, -1, 10), false);
});

test('determinism for same seed and difference for different seeds', () => {
  const world1a = generateWorld(12345, 96, 96);
  const world1b = generateWorld(12345, 96, 96);
  const world2 = generateWorld(54321, 96, 96);

  assert.deepStrictEqual(world1a.start, world1b.start);
  assert.deepStrictEqual(world1a.terrain, world1b.terrain);
  assert.deepStrictEqual(world1a.tree, world1b.tree);
  assert.deepStrictEqual(world1a.rock, world1b.rock);
  assert.deepStrictEqual(world1a.ore, world1b.ore);

  // Different seeds should produce different terrain/start
  assert.notDeepStrictEqual(world1a.terrain, world2.terrain);
});

test('border is deep water', () => {
  const world = generateWorld(777, 96, 96);
  const { w, h, terrain } = world;

  for (let x = 0; x < w; x++) {
    assert.strictEqual(terrain[idx(w, x, 0)], T.DEEP, `Top border (${x}, 0) is DEEP`);
    assert.strictEqual(terrain[idx(w, x, h - 1)], T.DEEP, `Bottom border (${x}, ${h - 1}) is DEEP`);
  }
  for (let y = 0; y < h; y++) {
    assert.strictEqual(terrain[idx(w, 0, y)], T.DEEP, `Left border (0, ${y}) is DEEP`);
    assert.strictEqual(terrain[idx(w, w - 1, y)], T.DEEP, `Right border (${w - 1}, ${y}) is DEEP`);
  }
});

test('generation performance is < 150ms for 96x96', () => {
  const t0 = performance.now();
  generateWorld(999, 96, 96);
  const elapsed = performance.now() - t0;

  assert.ok(elapsed < 150, `World generation took ${elapsed.toFixed(2)}ms (expected < 150ms)`);
});

test('start area validity for seeds 1..30', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const world = generateWorld(seed, 96, 96);
    const { start, terrain, tree, rock, w, h } = world;

    assert.ok(start && typeof start.x === 'number' && typeof start.y === 'number', `Seed ${seed}: start exists`);

    // 1. 3x3 buildable flat area, GRASS or FOREST_FLOOR
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const x = start.x + dx;
        const y = start.y + dy;
        assert.ok(inBounds(world, x, y), `Seed ${seed}: Start area (${x}, ${y}) in bounds`);
        const t = terrain[idx(w, x, y)];
        assert.ok(BUILDABLE[t], `Seed ${seed}: Tile (${x}, ${y}) terrain ${t} is buildable`);
        assert.strictEqual(tree[idx(w, x, y)], 0, `Seed ${seed}: Start tile (${x}, ${y}) must have no tree`);
      }
    }

    // 2. >= 10 mature trees within 8 tiles
    let matureTreeCount = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.hypot(x - start.x, y - start.y);
        if (dist <= 8 && tree[idx(w, x, y)] === 2) {
          matureTreeCount++;
        }
      }
    }
    assert.ok(
      matureTreeCount >= 10,
      `Seed ${seed}: Expected >= 10 mature trees within 8 tiles, found ${matureTreeCount}`
    );

    // 3. Rock within 14 tiles
    let foundRock = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.hypot(x - start.x, y - start.y);
        const i = idx(w, x, y);
        if (dist <= 14 && (terrain[i] === T.ROCK || rock[i] > 0)) {
          foundRock = true;
          break;
        }
      }
      if (foundRock) break;
    }
    assert.ok(foundRock, `Seed ${seed}: Expected rock cluster/tile within 14 tiles`);

    // 4. Water within 14 tiles
    let foundWater = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.hypot(x - start.x, y - start.y);
        const i = idx(w, x, y);
        if (dist <= 14 && (terrain[i] === T.WATER || terrain[i] === T.DEEP)) {
          foundWater = true;
          break;
        }
      }
      if (foundWater) break;
    }
    assert.ok(foundWater, `Seed ${seed}: Expected water tile within 14 tiles`);

    // 5. Mountain within 22 tiles
    let foundMountain = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.hypot(x - start.x, y - start.y);
        const i = idx(w, x, y);
        if (dist <= 22 && terrain[i] === T.MOUNTAIN) {
          foundMountain = true;
          break;
        }
      }
      if (foundMountain) break;
    }
    assert.ok(foundMountain, `Seed ${seed}: Expected mountain tile within 22 tiles`);
  }
});
