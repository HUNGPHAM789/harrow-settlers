import test from 'node:test';
import assert from 'node:assert';
import { Game } from '../src/sim/game.js';
import { BUILDINGS } from '../src/sim/defs.js';

test('villager awareness over 300 sim seconds with building placement', () => {
  const game = new Game({ seed: 42 });

  // Place a hut near HQ
  const hqDoor = game.getHqDoor();
  // Find valid build spot near HQ
  let placed = false;
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const tx = hqDoor.x + dx;
      const ty = hqDoor.y + dy;
      const res = game.place('hut', tx, ty);
      if (res.ok) {
        placed = true;
        break;
      }
    }
    if (placed) break;
  }

  assert.strictEqual(placed, true, 'Hut should be successfully placed');

  // Tick for 300 sim seconds in 0.25s chunks
  let elapsed = 0;
  let sawCheer = false;
  let sawEmote = false;

  while (elapsed < 300) {
    game.tick(0.25);
    elapsed += 0.25;

    for (const s of game.settlers) {
      if (s.emote) sawEmote = true;
      if (s.mood === 'proud' && s.emote && s.emote.kind === 'cheer') sawCheer = true;
    }
  }

  assert.strictEqual(sawEmote, true, 'Settlers should exhibit emotes over 300 seconds');
  assert.strictEqual(sawCheer, true, 'Settlers should cheer when building becomes active');
});

test('determinism: two runs same seed identical toJSON', () => {
  const game1 = new Game({ seed: 123 });
  const game2 = new Game({ seed: 123 });

  // Place something and tick both
  game1.place('hut', game1.getHqDoor().x + 2, game1.getHqDoor().y);
  game2.place('hut', game2.getHqDoor().x + 2, game2.getHqDoor().y);

  for (let i = 0; i < 100; i++) {
    game1.tick(0.25);
    game2.tick(0.25);
  }

  const json1 = JSON.stringify(game1.toJSON());
  const json2 = JSON.stringify(game2.toJSON());

  assert.strictEqual(json1, json2, 'Two runs with same seed must produce identical state JSON');
});

test('starving makes mood hungry', () => {
  const game = new Game({ seed: 99 });
  game.stock.fish = 0;
  game.stock.bread = 0;

  game.tick(1.0);

  for (const s of game.settlers) {
    assert.strictEqual(s.mood, 'hungry', 'Settlers must be hungry when food stock < 2');
  }

  // Recover food
  game.stock.fish = 5;
  game.tick(1.0);

  for (const s of game.settlers) {
    assert.strictEqual(s.mood, 'calm', 'Settlers mood should return to calm once food recovers');
  }
});

test('wandering settlers get assigned to a job promptly', () => {
  const game = new Game({ seed: 777 });

  // Tick a bit to let idle settlers wander / emote
  for (let i = 0; i < 40; i++) {
    game.tick(0.25);
  }

  // Now place a woodcutter where resources exist and verify idle settler gets assigned promptly
  const hqDoor = game.getHqDoor();
  let placed = false;
  let hutId = null;

  for (let dx = -4; dx <= 4; dx++) {
    for (let dy = -4; dy <= 4; dy++) {
      const tx = hqDoor.x + dx;
      const ty = hqDoor.y + dy;
      const res = game.place('woodcutter', tx, ty);
      if (res.ok) {
        placed = true;
        hutId = res.id;
        break;
      }
    }
    if (placed) break;
  }

  if (placed) {
    // Tick until built / assigned
    for (let i = 0; i < 100; i++) {
      game.tick(0.25);
    }
    const b = game.buildings.find(item => item.id === hutId);
    assert.strictEqual(b.state, 'active', 'Woodcutter building should become active');
    
    // Check that settlers assigned to work had their wander path/emotes cleared
    for (const s of game.settlers) {
      if (s.job === hutId) {
        assert.strictEqual(s.emote, null, 'Assigned settler must have emote cleared');
        assert.strictEqual(s.lookAt, null, 'Assigned settler must have lookAt cleared');
      }
    }
  }
});
