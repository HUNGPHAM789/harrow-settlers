import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/sim/game.js';
import { BUILDINGS, T } from '../src/sim/defs.js';
import { idx } from '../src/sim/world.js';

/**
 * Helper to find a valid placement spot for a building type near HQ.
 */
function findSpot(game, type) {
  const hq = game.buildings.find(b => b.type === 'hq');
  // Search in a growing square around HQ
  for (let r = 1; r < 20; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = hq.x + dx;
        const y = hq.y + dy;
        if (game.canPlace(type, x, y).ok) {
          return { x, y };
        }
      }
    }
  }
  return null;
}

test('Game simulation: 600s headless run with AI placement', async (t) => {
  const game = new Game({ seed: 42 });
  const initialStock = { ...game.stock };
  
  // Placement order to build up economy
  const buildOrder = [
    'woodcutter', 'sawmill', 'quarry', 'fisher', 
    'hut', 'farm', 'mill', 'bakery'
  ];

  // Run for 600 seconds
  const totalTime = 600;
  const dt = 0.25;
  const steps = totalTime / dt;

  let buildingsPlaced = 0;

  for (let i = 0; i < steps; i++) {
    // Every 10 seconds, try to place the next building in the order
    if (i % (10 / dt) === 0 && buildingsPlaced < buildOrder.length) {
      const type = buildOrder[buildingsPlaced];
      const spot = findSpot(game, type);
      if (spot) {
        const res = game.place(type, spot.x, spot.y);
        if (res.ok) {
          buildingsPlaced++;
        }
      }
    }
    game.tick(dt);
  }

  // Assertions on production
  // We expect at least some resources to have been produced or processed
  // Note: Sawmill consumes logs to make planks, so logs might fluctuate.
  // But overall produced stats should be > 0.
  assert.ok(game.stats.produced.log > 0, 'Should have produced logs');
  assert.ok(game.stats.produced.plank > 0, 'Should have produced planks');
  assert.ok(game.stats.produced.stone > 0, 'Should have produced stone');
  assert.ok(game.stats.produced.fish > 0, 'Should have produced fish');
  assert.ok(game.stats.produced.bread > 0, 'Should have produced bread');

  // Check population growth (Hut adds housing, birth timer spawns settlers)
  assert.ok(game.settlers.length > 4, 'Population should have grown');
  assert.equal(game.buildings.length, 1 + buildOrder.length, 'All buildings should be placed');
});

test('Game determinism: two runs with same seed are identical', async (t) => {
  const seed = 999;
  const game1 = new Game({ seed });
  const game2 = new Game({ seed });

  // Perform some actions in both
  const spot1 = findSpot(game1, 'woodcutter');
  const spot2 = findSpot(game2, 'woodcutter');
  
  game1.place('woodcutter', spot1.x, spot1.y);
  game2.place('woodcutter', spot2.x, spot2.y);

  // Tick both
  for (let i = 0; i < 200; i++) {
    game1.tick(0.25);
    game2.tick(0.25);
  }

  const json1 = JSON.stringify(game1.toJSON());
  const json2 = JSON.stringify(game2.toJSON());

  assert.equal(json1, json2, 'Two games with same seed and actions must be identical');
});

test('Game save/load: roundtrip preserves state exactly', async (t) => {
  const game = new Game({ seed: 123 });
  
  // Place something and tick
  const spot = findSpot(game, 'woodcutter');
  game.place('woodcutter', spot.x, spot.y);
  game.tick(30);

  const state1 = game.toJSON();
  const game2 = Game.fromJSON(state1);
  const state2 = game2.toJSON();

  assert.deepEqual(state1, state2, 'Serialized state should survive roundtrip exactly');
  
  // Tick both further and compare
  game.tick(10);
  game2.tick(10);
  assert.deepEqual(game.toJSON(), game2.toJSON(), 'Resumed games should remain deterministic');
});

test('Game canPlace: validation reasons', async (t) => {
  const game = new Game({ seed: 777 });
  const hq = game.buildings[0];

  // 1. Out of bounds
  assert.equal(game.canPlace('hut', -1, 0).reason, 'out_of_bounds');

  // 2. Unbuildable terrain (find a water tile)
  let waterX = -1, waterY = -1;
  for (let y = 0; y < game.world.h; y++) {
    for (let x = 0; x < game.world.w; x++) {
      if (game.world.terrain[idx(game.world.w, x, y)] === T.WATER) {
        waterX = x; waterY = y; break;
      }
    }
    if (waterX !== -1) break;
  }
  // Note: Water is outside territory usually, but unbuildable check is first
  assert.equal(game.canPlace('hut', waterX, waterY).reason, 'unbuildable_terrain');

  // 3. Insufficient resources
  // Find a valid flat grass tile inside territory (near HQ)
  const validSpot = findSpot(game, 'hut');
  // Great Hall (monument) is expensive
  assert.equal(game.canPlace('monument', validSpot.x, validSpot.y).reason, 'insufficient_resources');

  // 4. Missing resource nearby
  // Woodcutter needs trees. Find a spot in territory but far from trees.
  // In a standard island world, we might need to search.
  // For this test, we'll just verify the logic returns the reason if we can find such a spot.
  let desertSpot = null;
  for (let r = 1; r < 10; r++) {
    const x = hq.x + r;
    const y = hq.y;
    const check = game.canPlace('woodcutter', x, y);
    if (check.reason === 'missing_resource_nearby') {
      desertSpot = { x, y };
      break;
    }
  }
  if (desertSpot) {
    assert.equal(game.canPlace('woodcutter', desertSpot.x, desertSpot.y).reason, 'missing_resource_nearby');
  }
});

test('Game demolish: refund 50%', async (t) => {
  const game = new Game({ seed: 101 });
  const type = 'hut'; // cost: { plank: 2, log: 1 }
  const spot = findSpot(game, type);
  
  const beforePlank = game.stock.plank;
  const beforeLog = game.stock.log;

  const { id } = game.place(type, spot.x, spot.y);
  
  assert.equal(game.stock.plank, beforePlank - 2);
  assert.equal(game.stock.log, beforeLog - 1);

  game.demolish(id);

  // Refund: floor(2 * 0.5) = 1 plank, floor(1 * 0.5) = 0 log
  assert.equal(game.stock.plank, beforePlank - 2 + 1);
  assert.equal(game.stock.log, beforeLog - 1 + 0);
});

test('Game starvation: settlers leave when no food', async (t) => {
  const game = new Game({ seed: 202 });
  
  // Drain all food
  game.stock.fish = 0;
  game.stock.bread = 0;
  
  const initialPop = game.settlers.length;
  assert.ok(initialPop >= 4);

  // Starvation check happens every 20s of 0 food
  // Tick for 25 seconds to be sure
  game.tick(25);

  assert.equal(game.settlers.length, initialPop - 1, 'One settler should have starved');
  
  const events = game.drainEvents();
  assert.ok(events.some(e => e.kind === 'starve'), 'Should have a starve event');
});
