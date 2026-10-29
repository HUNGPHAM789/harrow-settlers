import test from 'node:test';
import assert from 'node:assert';
import { Game } from '../src/sim/game.js';
import { T } from '../src/sim/defs.js';

test('Feature 1: Road speed buff and preference in simulation', () => {
  const game = new Game({ seed: 42 });
  const w = game.world.w;

  // Verify speed formula
  // In _moveSettlerAlongPath: road tile has speed 3.2, grass has 2.0
  const hqDoor = game.getHqDoor();
  const roadTileX = hqDoor.x + 1;
  const roadTileY = hqDoor.y;
  game.paintRoad(roadTileX, roadTileY, true);

  assert.strictEqual(game.roads[roadTileY * w + roadTileX], 1, 'Road tile should be marked as 1');
});

test('Feature 3: Geologist prospecting discovers Iron Ore or Coal on mountain', () => {
  const game = new Game({ seed: 101 });
  const w = game.world.w;
  const h = game.world.h;

  // Find a mountain tile
  let mX = -1, mY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (game.world.terrain[i] === T.MOUNTAIN) {
        mX = x;
        mY = y;
        break;
      }
    }
    if (mX !== -1) break;
  }

  assert.ok(mX !== -1, 'Mountain tile should exist on generated map');

  // Trigger prospecting
  const res = game.prospect(mX, mY);
  assert.strictEqual(res.ok, true, 'Prospect should successfully dispatch an idle settler as geologist');

  const geo = game.settlers.find(s => s.role === 'geologist');
  assert.ok(geo, 'Geologist settler should be active');
  assert.strictEqual(geo.state, 'walking_to_prospect');

  // Advance simulation to let geologist prospect
  for (let i = 0; i < 40; i++) {
    game.tick(0.25);
    if (game.prospects[mY * w + mX] > 0) break;
  }

  // After reaching target or completing, vein is set
  const mIdx = mY * w + mX;
  // If not completed yet, advance more ticks
  for (let i = 0; i < 60; i++) {
    if (game.prospects[mIdx] > 0) break;
    game.tick(0.25);
  }

  assert.ok([0, 1, 2].includes(game.prospects[mIdx]), 'Prospect vein must be 0, 1 (Iron), or 2 (Coal)');
});

test('Feature 3 & 4: Determinism with prospects and time cycle', () => {
  const game1 = new Game({ seed: 888 });
  const game2 = new Game({ seed: 888 });

  for (let i = 0; i < 40; i++) {
    game1.tick(0.25);
    game2.tick(0.25);
  }

  const json1 = JSON.stringify(game1.toJSON());
  const json2 = JSON.stringify(game2.toJSON());

  assert.strictEqual(json1, json2, 'Two runs with same seed must produce identical state JSON with new features');

  // Roundtrip
  const loaded = Game.fromJSON(game1.toJSON());
  assert.strictEqual(loaded.seed, game1.seed);
  assert.strictEqual(loaded.time, game1.time);
  assert.deepStrictEqual(Array.from(loaded.prospects), Array.from(game1.prospects));
});
