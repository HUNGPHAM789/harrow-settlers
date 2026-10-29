import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, rngInt, rngPick, shuffle } from '../src/util/rng.js';
import { MinHeap } from '../src/util/heap.js';
import { makeValueNoise, fbm } from '../src/util/noise.js';

test('mulberry32 PRNG determinism and range', () => {
  const rng1 = mulberry32(12345);
  const rng2 = mulberry32(12345);
  const rng3 = mulberry32(99999);

  const seq1 = Array.from({ length: 100 }, () => rng1());
  const seq2 = Array.from({ length: 100 }, () => rng2());
  const seq3 = Array.from({ length: 100 }, () => rng3());

  assert.deepEqual(seq1, seq2, 'Same seed must produce identical output sequence');
  assert.notDeepEqual(seq1, seq3, 'Different seed should produce different output sequence');

  for (const v of seq1) {
    assert.ok(v >= 0 && v < 1, `Value ${v} must be in [0, 1)`);
  }
});

test('rngInt, rngPick, shuffle helpers', () => {
  const rng = mulberry32(42);

  // rngInt bounds
  const counts = new Map();
  for (let i = 0; i < 1000; i++) {
    const v = rngInt(rng, 10, 15);
    assert.ok(v >= 10 && v <= 15 && Number.isInteger(v), `rngInt result ${v} out of bounds [10, 15]`);
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  assert.equal(counts.size, 6, 'All integers in inclusive range [10, 15] should be produced');

  // rngPick
  const arr = ['a', 'b', 'c'];
  assert.equal(rngPick(rng, []), undefined, 'Pick on empty array returns undefined');
  const picked = rngPick(rng, arr);
  assert.ok(arr.includes(picked), 'Picked element must exist in input array');

  // shuffle
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  const itemsCopy = [...items];
  const shuffled = shuffle(rng, items);
  assert.equal(shuffled, items, 'shuffle operates in place');
  assert.deepEqual([...items].sort(), itemsCopy, 'shuffled array contains exact same elements');
});

test('MinHeap priority monotonicity with 1000 items', () => {
  const heap = new MinHeap();
  assert.equal(heap.size, 0);

  const rng = mulberry32(1337);
  const count = 1000;

  for (let i = 0; i < count; i++) {
    const prio = rng() * 100;
    heap.push({ id: i, prio }, prio);
  }

  assert.equal(heap.size, count);

  let prevPrio = -Infinity;
  let poppedCount = 0;

  while (heap.size > 0) {
    const item = heap.pop();
    assert.ok(item !== undefined);
    assert.ok(item.prio >= prevPrio, `Heap invariant violated: ${item.prio} < ${prevPrio}`);
    prevPrio = item.prio;
    poppedCount++;
  }

  assert.equal(poppedCount, count);
  assert.equal(heap.size, 0);
  assert.equal(heap.pop(), undefined);
});

test('MinHeap priority validation and edge cases', () => {
  const heap = new MinHeap();

  assert.throws(() => heap.push('item', NaN), TypeError);
  assert.throws(() => heap.push('item', Infinity), TypeError);
  assert.throws(() => heap.push('item', -Infinity), TypeError);
  assert.throws(() => heap.push('item', 'invalid'), TypeError);

  assert.equal(heap.peek(), undefined);
  heap.push('first', 10);
  heap.push('second', 5);
  assert.equal(heap.peek(), 'second');
  heap.clear();
  assert.equal(heap.size, 0);
  assert.equal(heap.peek(), undefined);
});

test('Value Noise determinism, range, and smoothness', () => {
  const noise1 = makeValueNoise(777);
  const noise2 = makeValueNoise(777);

  assert.equal(noise1(2.5, 3.8), noise2(2.5, 3.8), 'Value noise must be deterministic for same seed');

  // Check output bounds [0, 1) over 1000 random points
  const rng = mulberry32(101);
  for (let i = 0; i < 1000; i++) {
    const x = (rng() - 0.5) * 200;
    const y = (rng() - 0.5) * 200;
    const val = noise1(x, y);
    assert.ok(val >= 0 && val < 1, `Noise output ${val} out of bounds [0, 1) at (${x}, ${y})`);
  }

  // Check smoothness: adjacent samples with step 0.05 must differ by < 0.2
  let maxDiff = 0;
  const step = 0.05;
  for (let x = 0; x < 10; x += step) {
    for (let y = 0; y < 10; y += step) {
      const current = noise1(x, y);
      const right = noise1(x + step, y);
      const down = noise1(x, y + step);

      const diffX = Math.abs(current - right);
      const diffY = Math.abs(current - down);

      if (diffX > maxDiff) maxDiff = diffX;
      if (diffY > maxDiff) maxDiff = diffY;

      assert.ok(diffX < 0.2, `X diff ${diffX} exceeded threshold 0.2 at (${x}, ${y})`);
      assert.ok(diffY < 0.2, `Y diff ${diffY} exceeded threshold 0.2 at (${x}, ${y})`);
    }
  }
});

test('fbm noise functionality and edge cases', () => {
  const noise = makeValueNoise(42);

  // Range check
  for (let x = 0; x < 5; x += 0.5) {
    for (let y = 0; y < 5; y += 0.5) {
      const val = fbm(noise, x, y, 4, 2, 0.5);
      assert.ok(val >= 0 && val < 1, `fbm output ${val} out of bounds [0, 1)`);
    }
  }

  // Handle octaves <= 0
  assert.equal(fbm(noise, 1.0, 1.0, 0), 0, 'fbm with 0 octaves should return 0');
  assert.equal(fbm(noise, 1.0, 1.0, -2), 0, 'fbm with negative octaves should return 0');
});
