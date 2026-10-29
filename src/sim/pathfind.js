import { WALKABLE } from './defs.js';
import { MinHeap } from '../util/heap.js';

const DIRS = [
  [0, -1], [1, 0], [0, 1], [-1, 0],
  [-1, -1], [1, -1], [-1, 1], [1, 1]
];

/**
 * Octile distance heuristic for A* on 8-connected grid.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function heuristic(x1, y1, x2, y2) {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  const min = dx < dy ? dx : dy;
  const max = dx < dy ? dy : dx;
  return (max - min) + 1.414 * min;
}

/**
 * 8-neighbour A* pathfinding.
 * @param {object} world { w, h, terrain }
 * @param {number} sx Start tile X
 * @param {number} sy Start tile Y
 * @param {number} tx Target tile X
 * @param {number} ty Target tile Y
 * @param {object} [opts] Options: { blocked, maxExpansions }
 * @returns {Array<{x: number, y: number}> | null} Array of tile steps excluding start, including target, or null
 */
export function findPath(world, sx, sy, tx, ty, opts = {}) {
  const startX = Math.floor(sx);
  const startY = Math.floor(sy);
  const targetX = Math.floor(tx);
  const targetY = Math.floor(ty);

  const w = world.w;
  const h = world.h;

  if (startX < 0 || startX >= w || startY < 0 || startY >= h) return null;
  if (targetX < 0 || targetX >= w || targetY < 0 || targetY >= h) return null;

  if (startX === targetX && startY === targetY) {
    return [];
  }

  const startIdx = startY * w + startX;
  const targetIdx = targetY * w + targetX;

  if (!WALKABLE[world.terrain[startIdx]]) return null;
  if (!WALKABLE[world.terrain[targetIdx]]) return null;

  const maxExpansions = opts.maxExpansions ?? 4000;
  const blockedFn = typeof opts.blocked === 'function' ? opts.blocked : null;

  const size = w * h;
  const gScore = new Float32Array(size);
  gScore.fill(Infinity);
  const parent = new Int32Array(size);
  parent.fill(-1);
  const closed = new Uint8Array(size);

  gScore[startIdx] = 0;

  const heap = new MinHeap();
  heap.push(startIdx, heuristic(startX, startY, targetX, targetY));

  let expansions = 0;
  let reached = false;

  while (heap.size > 0 && expansions < maxExpansions) {
    const currIdx = heap.pop();
    if (closed[currIdx]) continue;

    closed[currIdx] = 1;
    expansions++;

    if (currIdx === targetIdx) {
      reached = true;
      break;
    }

    const cx = currIdx % w;
    const cy = (currIdx / w) | 0;
    const currG = gScore[currIdx];

    for (let d = 0; d < 8; d++) {
      const dx = DIRS[d][0];
      const dy = DIRS[d][1];
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

      const nIdx = ny * w + nx;
      if (closed[nIdx]) continue;

      if (!WALKABLE[world.terrain[nIdx]]) continue;

      if (nIdx !== targetIdx && blockedFn && blockedFn(nx, ny)) continue;

      // Diagonal corner cutting check: both orthogonal neighbors must be walkable and unblocked
      if (dx !== 0 && dy !== 0) {
        const o1x = cx + dx;
        const o1y = cy;
        const o1Idx = o1y * w + o1x;
        if (o1x < 0 || o1x >= w || o1y < 0 || o1y >= h) continue;
        if (!WALKABLE[world.terrain[o1Idx]]) continue;
        if (o1Idx !== targetIdx && blockedFn && blockedFn(o1x, o1y)) continue;

        const o2x = cx;
        const o2y = cy + dy;
        const o2Idx = o2y * w + o2x;
        if (o2x < 0 || o2x >= w || o2y < 0 || o2y >= h) continue;
        if (!WALKABLE[world.terrain[o2Idx]]) continue;
        if (o2Idx !== targetIdx && blockedFn && blockedFn(o2x, o2y)) continue;
      }

      const stepCost = (dx !== 0 && dy !== 0) ? 1.414 : 1.0;
      const newG = currG + stepCost;

      if (newG < gScore[nIdx]) {
        gScore[nIdx] = newG;
        parent[nIdx] = currIdx;
        const fScore = newG + heuristic(nx, ny, targetX, targetY);
        heap.push(nIdx, fScore);
      }
    }
  }

  if (!reached) return null;

  const path = [];
  let curr = targetIdx;
  while (curr !== startIdx) {
    const x = curr % w;
    const y = (curr / w) | 0;
    path.push({ x, y });
    curr = parent[curr];
  }
  path.reverse();
  return path;
}

/**
 * BFS to find nearest tile matching predicate within radius maxR.
 * @param {object} world { w, h, terrain }
 * @param {number} sx Start tile X
 * @param {number} sy Start tile Y
 * @param {function} predicate Function (x, y) or (world, x, y) => boolean
 * @param {number} [maxR=30] Maximum search radius
 * @returns {{x: number, y: number} | null} Matching tile coordinates or null
 */
export function nearestTile(world, sx, sy, predicate, maxR = 30) {
  const startX = Math.floor(sx);
  const startY = Math.floor(sy);
  const w = world.w;
  const h = world.h;

  if (startX < 0 || startX >= w || startY < 0 || startY >= h) return null;

  function testTile(x, y) {
    try {
      if (predicate(x, y, world)) return true;
    } catch (_) {}
    try {
      if (predicate(world, x, y)) return true;
    } catch (_) {}
    return false;
  }

  if (testTile(startX, startY)) {
    return { x: startX, y: startY };
  }

  const visited = new Uint8Array(w * h);
  const queueX = new Int32Array(w * h);
  const queueY = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const startIdx = startY * w + startX;
  visited[startIdx] = 1;
  queueX[tail] = startX;
  queueY[tail] = startY;
  tail++;

  while (head < tail) {
    const cx = queueX[head];
    const cy = queueY[head];
    head++;

    for (let d = 0; d < 8; d++) {
      const nx = cx + DIRS[d][0];
      const ny = cy + DIRS[d][1];

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

      const dx = Math.abs(nx - startX);
      const dy = Math.abs(ny - startY);
      if (Math.max(dx, dy) > maxR) continue;

      const idx = ny * w + nx;
      if (!visited[idx]) {
        visited[idx] = 1;
        if (testTile(nx, ny)) {
          return { x: nx, y: ny };
        }
        queueX[tail] = nx;
        queueY[tail] = ny;
        tail++;
      }
    }
  }

  return null;
}
