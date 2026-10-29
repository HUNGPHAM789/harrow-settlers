import test from 'node:test';
import assert from 'node:assert/strict';
import { findPath, nearestTile } from '../src/sim/pathfind.js';
import { T } from '../src/sim/defs.js';
import { mulberry32, rngInt } from '../src/util/rng.js';

/**
 * Creates a fake world object for pathfinding tests.
 * @param {number} w Width
 * @param {number} h Height
 * @param {number} [fillType=T.GRASS] Terrain tile type
 * @returns {{w: number, h: number, terrain: Uint8Array}}
 */
function createWorld(w, h, fillType = T.GRASS) {
  const terrain = new Uint8Array(w * h).fill(fillType);
  return { w, h, terrain };
}

test('straight path on open grid', () => {
  const world = createWorld(10, 10, T.GRASS);
  const path = findPath(world, 1, 1, 5, 1);

  assert.notEqual(path, null);
  assert.equal(path.length, 4);
  assert.deepEqual(path, [
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 }
  ]);
});

test('path around obstacle', () => {
  const world = createWorld(10, 10, T.GRASS);
  // Place a wall of water from (3,0) to (3,3)
  for (let y = 0; y <= 3; y++) {
    world.terrain[y * world.w + 3] = T.WATER;
  }

  const path = findPath(world, 1, 1, 5, 1);
  assert.notEqual(path, null);
  assert.ok(path.length > 0);

  // Ensure no step visits water
  for (const step of path) {
    const tile = world.terrain[step.y * world.w + step.x];
    assert.notEqual(tile, T.WATER);
  }

  // Ensure path ends at target
  assert.deepEqual(path[path.length - 1], { x: 5, y: 1 });
});

test('null when enclosed or target is water/unwalkable', () => {
  const world = createWorld(10, 10, T.GRASS);

  // Surround start (1,1) completely with water
  const wallCoords = [
    [0, 0], [1, 0], [2, 0],
    [0, 1],         [2, 1],
    [0, 2], [1, 2], [2, 2]
  ];
  for (const [x, y] of wallCoords) {
    world.terrain[y * world.w + x] = T.WATER;
  }

  const pathEnclosed = findPath(world, 1, 1, 8, 8);
  assert.equal(pathEnclosed, null);

  // Target is water
  const world2 = createWorld(10, 10, T.GRASS);
  world2.terrain[5 * world2.w + 5] = T.WATER;
  const pathWaterTarget = findPath(world2, 1, 1, 5, 5);
  assert.equal(pathWaterTarget, null);
});

test('no corner cutting through non-walkable or blocked tiles', () => {
  const world = createWorld(5, 5, T.GRASS);
  // Set (2,1) to water
  world.terrain[1 * world.w + 2] = T.WATER;

  // Path from (1,1) to (2,2): direct diagonal requires (2,1) and (1,2) to be walkable.
  // Since (2,1) is water, direct diagonal step must be prevented.
  const path = findPath(world, 1, 1, 2, 2);
  assert.notEqual(path, null);

  // First step cannot be (2,2) directly from (1,1)
  assert.notDeepEqual(path[0], { x: 2, y: 2 });
});

test('blocked callback respected except for target tile', () => {
  const world = createWorld(10, 10, T.GRASS);
  const isBlocked = (x, y) => x === 3 && y === 1;

  // Path from (1,1) to (5,1) with (3,1) blocked -> should step around (3,1)
  const path = findPath(world, 1, 1, 5, 1, { blocked: isBlocked });
  assert.notEqual(path, null);
  for (const step of path) {
    assert.ok(!(step.x === 3 && step.y === 1));
  }

  // Target is blocked tile itself -> path allowed to end at target
  const pathTargetBlocked = findPath(world, 1, 1, 3, 1, { blocked: isBlocked });
  assert.notEqual(pathTargetBlocked, null);
  assert.deepEqual(pathTargetBlocked[pathTargetBlocked.length - 1], { x: 3, y: 1 });
});

test('maxExpansions limits search expansions and returns null when exceeded', () => {
  const world = createWorld(50, 50, T.GRASS);

  // Search far target with low maxExpansions limit
  const pathExceeded = findPath(world, 0, 0, 45, 45, { maxExpansions: 10 });
  assert.equal(pathExceeded, null);

  // Sufficient maxExpansions finds path
  const pathSufficient = findPath(world, 0, 0, 45, 45, { maxExpansions: 4000 });
  assert.notEqual(pathSufficient, null);
});

test('nearestTile BFS search and radius limit', () => {
  const world = createWorld(20, 20, T.GRASS);
  world.terrain[5 * world.w + 5] = T.WATER;
  world.terrain[2 * world.w + 8] = T.ROCK;

  // Find nearest water from (1, 1)
  const foundWater = nearestTile(world, 1.8, 1.2, (x, y) => world.terrain[y * world.w + x] === T.WATER, 10);
  assert.deepEqual(foundWater, { x: 5, y: 5 });

  // Out of radius maxR=2
  const notFoundWater = nearestTile(world, 1, 1, (x, y) => world.terrain[y * world.w + x] === T.WATER, 2);
  assert.equal(notFoundWater, null);
});

test('200 random paths on generated world finish fast', () => {
  const w = 96;
  const h = 96;
  const rng = mulberry32(12345);
  const world = createWorld(w, h, T.GRASS);

  // Add random water pools and mountain obstacles
  for (let i = 0; i < 800; i++) {
    const rx = rngInt(rng, 0, w - 1);
    const ry = rngInt(rng, 0, h - 1);
    world.terrain[ry * w + rx] = i % 2 === 0 ? T.WATER : T.MOUNTAIN;
  }

  const startTime = performance.now();
  let count = 0;

  for (let i = 0; i < 200; i++) {
    const sx = rngInt(rng, 0, w - 1);
    const sy = rngInt(rng, 0, h - 1);
    const tx = rngInt(rng, 0, w - 1);
    const ty = rngInt(rng, 0, h - 1);

    const path = findPath(world, sx, sy, tx, ty);
    if (path) count++;
  }

  const duration = performance.now() - startTime;
  assert.ok(duration < 200, `200 paths executed in ${duration.toFixed(2)}ms (expected < 200ms)`);
});

test('roads discount causes pathfinding to prefer road tiles', () => {
  const w = 10, h = 10;
  const world = createWorld(w, h, T.GRASS);
  const roads = new Uint8Array(w * h);

  // Put a road along y = 2 from x = 1 to x = 8
  for (let x = 1; x <= 8; x++) {
    roads[2 * w + x] = 1;
  }

  const pathWithRoad = findPath(world, 1, 1, 8, 1, { roads });
  assert.ok(pathWithRoad, 'Path should be found');
  const usesRoad = pathWithRoad.some(step => roads[step.y * w + step.x] === 1);
  assert.strictEqual(usesRoad, true, 'Pathfinder should utilize the discounted road tiles');
});
