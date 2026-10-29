import { generateWorld, idx, inBounds } from './world.js';
import { findPath, nearestTile } from './pathfind.js';
import { TILE, T, WALKABLE, BUILDABLE, GOODS, BUILDINGS, START_STOCK, SETTLER_FOOD_PER_MIN, BUILD_ORDER } from './defs.js';
import { mulberry32, rngInt, rngPick, shuffle } from '../util/rng.js';

/**
 * Checks if two rectangles overlap.
 */
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return Math.max(x1, x2) < Math.min(x1 + w1, x2 + w2) &&
         Math.max(y1, y2) < Math.min(y1 + h1, y2 + h2);
}

export class Game {
  /**
   * Creates a new Game instance.
   * @param {{ seed?: number, world?: object }} [opts]
   */
  constructor({ seed = 12345, world = null } = {}) {
    this.seed = seed;
    this.rng = mulberry32(seed);
    this._rngSteps = 0;

    this.world = world || generateWorld(seed);
    this.time = 0;
    this.speed = 1;

    // Stock initialization
    this.stock = { ...START_STOCK };
    for (const g of GOODS) {
      if (this.stock[g] === undefined) {
        this.stock[g] = 0;
      }
    }

    this.buildings = [];
    this.settlers = [];
    this.roads = new Uint8Array(this.world.w * this.world.h);
    this.territory = new Uint8Array(this.world.w * this.world.h);
    this.events = [];
    this.saplings = [];

    this._nextBuildingId = 1;
    this._nextSettlerId = 1;

    this.stats = {
      pop: 0,
      housing: 12,
      foodPerMin: 0,
      produced: {},
      victory: false,
      victoryTime: null
    };

    for (const g of GOODS) {
      this.stats.produced[g] = 0;
    }

    // Place Castle (HQ) at world.start
    const hqX = this.world.start ? this.world.start.x : Math.floor(this.world.w / 2);
    const hqY = this.world.start ? this.world.start.y : Math.floor(this.world.h / 2);

    const hq = {
      id: this._nextBuildingId++,
      type: 'hq',
      x: hqX,
      y: hqY,
      state: 'active',
      progress: 1,
      inv: {},
      out: {},
      workers: [],
      cycleT: 0,
      working: false
    };
    this.buildings.push(hq);

    // Initial territory recalculation
    this.updateTerritory();

    // Spawn starting settlers (4) at HQ door
    const hqDoor = this.getHqDoor();
    for (let i = 0; i < 4; i++) {
      this.settlers.push({
        id: this._nextSettlerId++,
        x: hqDoor.x + 0.5,
        y: hqDoor.y + 0.5,
        role: 'idle',
        state: 'idle',
        path: [],
        carry: null,
        home: hq.id,
        job: null,
        dir: 'd',
        stuckTimer: 0,
        mood: 'calm',
        emote: null,
        lookAt: null,
        _wanderTimer: 0,
        _socialCooldown: 0,
        _idlePauseTimer: 0
      });
    }

    this._birthTimer = 0;
    this._foodDebt = 0;
    this._starveTimer = 0;
    this._celebratedActiveBuildings = new Set();
    this._starveEmoteTimer = 0;

    this._updateStats();
  }

  /**
   * Invokes the internal PRNG deterministically while tracking step count.
   * @private
   */
  _rand() {
    this._rngSteps++;
    return this.rng();
  }

  /**
   * Returns HQ door tile coordinates.
   * @returns {{ x: number, y: number }}
   */
  getHqDoor() {
    const hq = this.buildings.find(b => b.type === 'hq') || this.buildings[0];
    if (!hq) return { x: 0, y: 0 };
    const door = BUILDINGS.hq.door;
    return { x: hq.x + door[0], y: hq.y + door[1] };
  }

  /**
   * Drains logged game events.
   * @returns {Array<object>}
   */
  drainEvents() {
    const drained = this.events;
    this.events = [];
    return drained;
  }

  /**
   * Recalculates territory mask based on active HQ and Watchtowers.
   */
  updateTerritory() {
    const w = this.world.w;
    const h = this.world.h;
    this.territory.fill(0);

    for (const b of this.buildings) {
      if (b.state !== 'active') continue;
      const bdef = BUILDINGS[b.type];
      if (!bdef || !bdef.radius) continue;

      const r = bdef.radius;
      const rSq = r * r;
      const cx = b.x + Math.floor(bdef.size[0] / 2);
      const cy = b.y + Math.floor(bdef.size[1] / 2);

      const minY = Math.max(0, cy - r);
      const maxY = Math.min(h - 1, cy + r);
      const minX = Math.max(0, cx - r);
      const maxX = Math.min(w - 1, cx + r);

      for (let ty = minY; ty <= maxY; ty++) {
        for (let tx = minX; tx <= maxX; tx++) {
          const dx = tx - cx;
          const dy = ty - cy;
          if (dx * dx + dy * dy <= rSq) {
            this.territory[idx(w, tx, ty)] = 1;
          }
        }
      }
    }
  }

  /**
   * Checks whether a building of given type can be placed at (x, y).
   * @param {string} type Building type key
   * @param {number} x Tile X
   * @param {number} y Tile Y
   * @returns {{ ok: boolean, reason?: string }}
   */
  canPlace(type, x, y) {
    const bdef = BUILDINGS[type];
    if (!bdef || type === 'hq') {
      return { ok: false, reason: 'invalid_type' };
    }

    const w = this.world.w;
    const h = this.world.h;
    const bw = bdef.size[0];
    const bh = bdef.size[1];

    if (x < 0 || y < 0 || x + bw > w || y + bh > h) {
      return { ok: false, reason: 'out_of_bounds' };
    }

    // Footprint check
    for (let ty = y; ty < y + bh; ty++) {
      for (let tx = x; tx < x + bw; tx++) {
        const i = idx(w, tx, ty);
        if (!BUILDABLE[this.world.terrain[i]]) {
          return { ok: false, reason: 'unbuildable_terrain' };
        }
        if (this.territory[i] !== 1) {
          return { ok: false, reason: 'outside_territory' };
        }
      }
    }

    // Overlap check
    for (const b of this.buildings) {
      const obdef = BUILDINGS[b.type];
      if (rectsOverlap(x, y, bw, bh, b.x, b.y, obdef.size[0], obdef.size[1])) {
        return { ok: false, reason: 'overlaps_building' };
      }
    }

    // Cost check
    if (bdef.cost) {
      for (const [good, qty] of Object.entries(bdef.cost)) {
        if ((this.stock[good] || 0) < qty) {
          return { ok: false, reason: 'insufficient_resources' };
        }
      }
    }

    // Nearby resource requirement check
    if (bdef.needs) {
      if (!this._hasNearbyResource(x, y, bw, bh, bdef.needs)) {
        return { ok: false, reason: 'missing_resource_nearby' };
      }
    }

    return { ok: true };
  }

  /**
   * Places a building if valid and deducts construction cost.
   * @param {string} type
   * @param {number} x
   * @param {number} y
   * @returns {{ ok: boolean, reason?: string, id?: number }}
   */
  place(type, x, y) {
    const check = this.canPlace(type, x, y);
    if (!check.ok) return check;

    const bdef = BUILDINGS[type];
    if (bdef.cost) {
      for (const [good, qty] of Object.entries(bdef.cost)) {
        this.stock[good] -= qty;
      }
    }

    const building = {
      id: this._nextBuildingId++,
      type,
      x,
      y,
      state: 'queued',
      progress: 0,
      inv: {},
      out: {},
      workers: [],
      cycleT: 0,
      working: false
    };

    this.buildings.push(building);

    // Verify door path accessibility
    const hqDoor = this.getHqDoor();
    const bDoor = { x: x + bdef.door[0], y: y + bdef.door[1] };
    const path = findPath(this.world, hqDoor.x, hqDoor.y, bDoor.x, bDoor.y, {
      blocked: (tx, ty) => this._isTileBlocked(tx, ty, bDoor.x, bDoor.y)
    });

    if (!path) {
      this.events.push({
        t: this.time,
        kind: 'warn',
        text: `Building ${bdef.name} door is unreachable!`,
        x,
        y
      });
    }

    return { ok: true, id: building.id };
  }

  /**
   * Demolishes a building by ID, returning 50% floor of cost and freeing workers.
   * @param {number} id
   * @returns {boolean}
   */
  demolish(id) {
    const index = this.buildings.findIndex(b => b.id === id);
    if (index === -1) return false;

    const building = this.buildings[index];
    if (building.type === 'hq') return false;

    const bdef = BUILDINGS[building.type];
    if (bdef && bdef.cost) {
      for (const [good, qty] of Object.entries(bdef.cost)) {
        const refund = Math.floor(qty * 0.5);
        this.stock[good] = (this.stock[good] || 0) + refund;
      }
    }

    // Free workers / builders assigned to this building
    for (const settler of this.settlers) {
      if (settler.job === id || settler.home === id) {
        settler.role = 'idle';
        settler.state = 'idle';
        settler.job = null;
        settler.home = null;
        settler.path = [];
        settler.emote = null;
        settler.lookAt = null;
      }
    }

    this.buildings.splice(index, 1);
    this._celebratedActiveBuildings.delete(id);

    if (building.type === 'tower') {
      this.updateTerritory();
    }

    return true;
  }

  /**
   * Toggles road on a walkable territory tile.
   * @param {number} x
   * @param {number} y
   * @param {boolean} [on=true]
   * @returns {boolean}
   */
  paintRoad(x, y, on = true) {
    const w = this.world.w;
    if (!inBounds(this.world, x, y)) return false;
    const i = idx(w, x, y);
    if (!WALKABLE[this.world.terrain[i]] || this.territory[i] !== 1) return false;
    this.roads[i] = on ? 1 : 0;
    return true;
  }

  /**
   * Advances game simulation by dt seconds.
   * @param {number} dt Delta time in seconds (caller guarantees dt <= 0.25, or sub-stepped)
   */
  tick(dt) {
    if (dt <= 0) return;

    let remaining = dt;
    while (remaining > 0) {
      const step = Math.min(0.25, remaining);
      this._subTick(step);
      remaining -= step;
    }
  }

  /**
   * Internal sub-step simulation tick.
   * @private
   */
  _subTick(dt) {
    this.time += dt;

    // 1. Sapling growth
    for (let i = this.saplings.length - 1; i >= 0; i--) {
      const s = this.saplings[i];
      s.timeRemaining -= dt;
      if (s.timeRemaining <= 0) {
        if (this.world.tree[s.idx] === 1) {
          this.world.tree[s.idx] = 2; // Matured tree
        }
        this.saplings.splice(i, 1);
      }
    }

    // 2. Assign tasks to idle settlers
    this._assignTasks();

    // 3. Settler movement & state logic
    this._updateSettlers(dt);

    // 3.5 Update villager awareness
    this.updateAwareness(dt);

    // 4. Population birth check (every 25s)
    this._birthTimer += dt;
    if (this._birthTimer >= 25.0) {
      this._birthTimer = 0;
      const foodStock = (this.stock.bread || 0) + (this.stock.fish || 0);
      if (this.stats.pop < this.stats.housing && foodStock >= 2) {
        const hqDoor = this.getHqDoor();
        const newSettler = {
          id: this._nextSettlerId++,
          x: hqDoor.x + 0.5,
          y: hqDoor.y + 0.5,
          role: 'idle',
          state: 'idle',
          path: [],
          carry: null,
          home: null,
          job: null,
          dir: 'd',
          stuckTimer: 0,
          mood: 'calm',
          emote: null,
          lookAt: null,
          _wanderTimer: 0,
          _socialCooldown: 0,
          _idlePauseTimer: 0
        };
        this.settlers.push(newSettler);

        // (3) on settler birth, settlers within 6 tiles emote 'heart'
        for (const s of this.settlers) {
          if (Math.hypot(s.x - newSettler.x, s.y - newSettler.y) <= 6.0) {
            s.emote = { kind: 'heart', t: 4.0, age: this.time };
            s.mood = 'happy';
          }
        }

        this.events.push({
          t: this.time,
          kind: 'born',
          text: 'A new settler has arrived!',
          x: hqDoor.x,
          y: hqDoor.y
        });
      }
    }

    // 5. Food consumption & starvation check
    const consumptionRate = this.settlers.length * (SETTLER_FOOD_PER_MIN / 60.0);
    this._foodDebt += consumptionRate * dt;

    while (this._foodDebt >= 1.0) {
      if ((this.stock.bread || 0) >= 1) {
        this.stock.bread--;
        this._foodDebt -= 1.0;
      } else if ((this.stock.fish || 0) >= 1) {
        this.stock.fish--;
        this._foodDebt -= 1.0;
      } else {
        break;
      }
    }

    const totalFood = (this.stock.bread || 0) + (this.stock.fish || 0);
    if (totalFood === 0 && this.settlers.length > 2) {
      this._starveTimer += dt;
      if (this._starveTimer >= 20.0) {
        this._starveTimer = 0;
        const idleIdx = this.settlers.findIndex(s => s.role === 'idle');
        const removeIdx = idleIdx !== -1 ? idleIdx : this.settlers.length - 1;
        const removed = this.settlers.splice(removeIdx, 1)[0];

        if (removed && removed.job) {
          const b = this.buildings.find(b => b.id === removed.job);
          if (b) {
            b.workers = b.workers.filter(id => id !== removed.id);
          }
        }

        const hqDoor = this.getHqDoor();
        this.events.push({
          t: this.time,
          kind: 'starve',
          text: 'A settler died of starvation!',
          x: hqDoor.x,
          y: hqDoor.y
        });
      }
    } else {
      this._starveTimer = 0;
    }

    // 6. Victory check
    for (const b of this.buildings) {
      if (b.type === 'monument' && b.state === 'active' && !this.stats.victory) {
        this.stats.victory = true;
        this.stats.victoryTime = this.time;
        this.events.push({
          t: this.time,
          kind: 'victory',
          text: 'Great Hall constructed! Victory!'
        });
      }
    }

    this._updateStats();
  }

  /**
   * Updates villager awareness, moods, emotes, and social behaviors.
   * @param {number} dt
   */
  updateAwareness(dt) {
    const foodStock = (this.stock.bread || 0) + (this.stock.fish || 0);
    const isNight = (this.time % 240) > 180;
    const hqDoor = this.getHqDoor();

    // (2) food stock < 2 -> every settler mood 'hungry', and every 12 s a random few get emote '!'
    if (foodStock < 2) {
      for (const s of this.settlers) {
        s.mood = 'hungry';
      }
      this._starveEmoteTimer = (this._starveEmoteTimer || 0) + dt;
      if (this._starveEmoteTimer >= 12.0) {
        this._starveEmoteTimer = 0;
        for (const s of this.settlers) {
          if (this._rand() < 0.4) {
            s.emote = { kind: '!', t: 4.0, age: this.time };
          }
        }
      }
    } else {
      this._starveEmoteTimer = 0;
      for (const s of this.settlers) {
        if (s.mood === 'hungry') {
          s.mood = 'calm';
        }
      }
    }

    // (1) when a building becomes 'active'
    for (const b of this.buildings) {
      if (b.state === 'active' && !this._celebratedActiveBuildings.has(b.id)) {
        this._celebratedActiveBuildings.add(b.id);
        const bdef = BUILDINGS[b.type];
        const bcx = b.x + bdef.size[0] / 2;
        const bcy = b.y + bdef.size[1] / 2;

        for (const s of this.settlers) {
          if (Math.hypot(s.x - bcx, s.y - bcy) <= 10.0) {
            s.emote = { kind: 'cheer', t: 8.0, age: this.time };
            s.mood = 'proud';
            s.lookAt = { x: bcx, y: bcy };
          }
        }
      }
    }

    // Clear lookAt after 4 s for building celebration
    for (const s of this.settlers) {
      if (s.mood === 'proud' && s.emote && s.emote.kind === 'cheer') {
        if (this.time - s.emote.age >= 4.0 && s.lookAt) {
          // Clear lookAt if it was focused on a building centre
          s.lookAt = null;
        }
      }
    }

    // (5) two idle settlers within 2 tiles face each other and alternate emote '?' / 'heart' for 3 s with 20 s cooldown
    const idleSettlers = this.settlers.filter(s => s.role === 'idle');
    for (let i = 0; i < idleSettlers.length; i++) {
      const s1 = idleSettlers[i];
      s1._socialCooldown = Math.max(0, (s1._socialCooldown || 0) - dt);
      if (s1._socialCooldown > 0) continue;

      for (let j = i + 1; j < idleSettlers.length; j++) {
        const s2 = idleSettlers[j];
        s2._socialCooldown = Math.max(0, (s2._socialCooldown || 0) - dt);
        if (s2._socialCooldown > 0) continue;

        const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
        if (dist <= 2.0) {
          s1._socialCooldown = 20.0;
          s2._socialCooldown = 20.0;
          s1.lookAt = { x: s2.x, y: s2.y };
          s2.lookAt = { x: s1.x, y: s1.y };
          const kind = this._rand() < 0.5 ? '?' : 'heart';
          s1.emote = { kind, t: 3.0, age: this.time };
          s2.emote = { kind, t: 3.0, age: this.time };
          s1.mood = 'happy';
          s2.mood = 'happy';
          break;
        }
      }
    }

    // (4) & (6) Idle settler wandering & night behavior
    for (const s of this.settlers) {
      // Emote countdown
      if (s.emote) {
        s.emote.t -= dt;
        if (s.emote.t <= 0) {
          s.emote = null;
        }
      }

      // If role changed from 'idle', wandering/lookAt/emotes handled on assignment, but ensure state consistency
      if (s.role !== 'idle') continue;

      if (isNight) {
        // (6) at night idle settlers walk toward HQ and show 'zzz'
        s.emote = s.emote || { kind: 'zzz', t: 6.0, age: this.time };
        s.mood = 'calm';
        const distToHq = Math.hypot(s.x - (hqDoor.x + 0.5), s.y - (hqDoor.y + 0.5));
        if (distToHq > 2.0 && s.path.length === 0) {
          s.path = findPath(this.world, Math.floor(s.x), Math.floor(s.y), hqDoor.x, hqDoor.y, {
            blocked: (x, y) => this._isTileBlocked(x, y, hqDoor.x, hqDoor.y)
          }) || [];
        }
      } else {
        // (4) idle settlers near HQ wander: every 6-14 s pick a walkable tile within 4 tiles of HQ door and path there; sometimes pause with 'zzz' or '?'
        s._wanderTimer = (s._wanderTimer || 0) - dt;
        if (s._wanderTimer <= 0) {
          // pick 6-14 s interval using deterministic rng
          s._wanderTimer = 6.0 + this._rand() * 8.0;

          const distToHq = Math.hypot(s.x - (hqDoor.x + 0.5), s.y - (hqDoor.y + 0.5));
          if (distToHq <= 6.0 && s.path.length === 0) {
            // Pick a walkable tile within 4 tiles of HQ door
            const rx = hqDoor.x + Math.floor(this._rand() * 9) - 4;
            const ry = hqDoor.y + Math.floor(this._rand() * 9) - 4;
            if (inBounds(this.world, rx, ry)) {
              const rIdx = idx(this.world.w, rx, ry);
              if (WALKABLE[this.world.terrain[rIdx]]) {
                const path = findPath(this.world, Math.floor(s.x), Math.floor(s.y), rx, ry, {
                  blocked: (x, y) => this._isTileBlocked(x, y, rx, ry)
                });
                if (path && path.length > 0) {
                  s.path = path;
                  if (this._rand() < 0.3) {
                    s.emote = { kind: this._rand() < 0.5 ? 'zzz' : '?', t: 3.0, age: this.time };
                  }
                }
              }
            }
          }
        }
      }

      // (7) builders working get emote 'hammer' occasionally, workers carrying food get 'food' rarely
      // Handled in settler state update loop or worker updates.
    }
  }

  /**
   * Assigns idle settlers to queued construction or active building worker slots.
   * @private
   */
  _assignTasks() {
    const idleSettlers = this.settlers.filter(s => s.role === 'idle');
    if (idleSettlers.length === 0) return;

    // 1. Assign builders to queued buildings
    for (const b of this.buildings) {
      if (b.state === 'queued') {
        const bdef = BUILDINGS[b.type];
        const bDoor = { x: b.x + bdef.door[0], y: b.y + bdef.door[1] };
        
        // Find closest idle settler
        let bestDist = Infinity;
        let bestSettler = null;
        for (const s of idleSettlers) {
          const d = Math.hypot(s.x - bDoor.x, s.y - bDoor.y);
          if (d < bestDist) {
            bestDist = d;
            bestSettler = s;
          }
        }

        if (bestSettler) {
          const sx = Math.floor(bestSettler.x);
          const sy = Math.floor(bestSettler.y);
          const path = findPath(this.world, sx, sy, bDoor.x, bDoor.y, {
            blocked: (x, y) => this._isTileBlocked(x, y, bDoor.x, bDoor.y)
          });

          if (path) {
            b.state = 'building';
            bestSettler.role = 'builder';
            bestSettler.job = b.id;
            bestSettler.state = 'walking_to_build';
            bestSettler.path = path;
            bestSettler.emote = null;
            bestSettler.lookAt = null;

            // Remove from idle pool
            const idx = idleSettlers.indexOf(bestSettler);
            if (idx !== -1) idleSettlers.splice(idx, 1);
          } else {
            this.events.push({
              t: this.time,
              kind: 'warn',
              text: `${bdef.name} door is unreachable for builders!`,
              x: b.x,
              y: b.y
            });
          }
        }
      }
      if (idleSettlers.length === 0) break;
    }

    // 2. Assign workers to active buildings
    for (const b of this.buildings) {
      if (b.state === 'active') {
        const bdef = BUILDINGS[b.type];
        const requiredJobs = bdef.jobs || 0;

        // Clean up invalid worker IDs
        b.workers = b.workers.filter(id => this.settlers.some(s => s.id === id && s.job === b.id));

        while (b.workers.length < requiredJobs && idleSettlers.length > 0) {
          const bDoor = { x: b.x + bdef.door[0], y: b.y + bdef.door[1] };
          
          let bestDist = Infinity;
          let bestSettler = null;
          for (const s of idleSettlers) {
            const d = Math.hypot(s.x - bDoor.x, s.y - bDoor.y);
            if (d < bestDist) {
              bestDist = d;
              bestSettler = s;
            }
          }

          if (bestSettler) {
            const sx = Math.floor(bestSettler.x);
            const sy = Math.floor(bestSettler.y);
            const path = findPath(this.world, sx, sy, bDoor.x, bDoor.y, {
              blocked: (x, y) => this._isTileBlocked(x, y, bDoor.x, bDoor.y)
            });

            if (path) {
              b.workers.push(bestSettler.id);
              bestSettler.role = 'worker';
              bestSettler.job = b.id;
              bestSettler.state = 'walking_to_work';
              bestSettler.path = path;
              bestSettler.emote = null;
              bestSettler.lookAt = null;

              const idx = idleSettlers.indexOf(bestSettler);
              if (idx !== -1) idleSettlers.splice(idx, 1);
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }
      if (idleSettlers.length === 0) break;
    }
  }

  /**
   * Updates state and position for all settlers.
   * @private
   */
  _updateSettlers(dt) {
    const hqDoor = this.getHqDoor();

    for (const settler of this.settlers) {
      // (7) builders working get emote 'hammer' occasionally, workers carrying food get 'food' rarely
      if (settler.role === 'builder' && settler.state === 'building') {
        if (!settler.emote && this._rand() < 0.05 * dt) {
          settler.emote = { kind: 'hammer', t: 2.5, age: this.time };
        }
      } else if (settler.role === 'worker' && settler.carry && (settler.carry === 'fish' || settler.carry === 'bread')) {
        if (!settler.emote && this._rand() < 0.02 * dt) {
          settler.emote = { kind: 'food', t: 2.5, age: this.time };
        }
      }

      // Idle settler behavior
      if (settler.role === 'idle') {
        if (settler.carry) {
          // Carry return to HQ
          const distToHq = Math.hypot(settler.x - (hqDoor.x + 0.5), settler.y - (hqDoor.y + 0.5));
          if (distToHq <= 1.0) {
            this.stock[settler.carry] = (this.stock[settler.carry] || 0) + 1;
            settler.carry = null;
            settler.path = [];
          } else if (settler.path.length === 0) {
            settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), hqDoor.x, hqDoor.y, {
              blocked: (x, y) => this._isTileBlocked(x, y, hqDoor.x, hqDoor.y)
            }) || [];
          }
        }
        if (settler.path.length > 0) {
          this._moveSettlerAlongPath(settler, dt);
        }
        continue;
      }

      // Builder settler behavior
      if (settler.role === 'builder') {
        const b = this.buildings.find(b => b.id === settler.job);
        if (!b || b.state === 'active') {
          settler.role = 'idle';
          settler.job = null;
          settler.state = 'idle';
          settler.path = [];
          settler.emote = null;
          settler.lookAt = null;
          continue;
        }

        const bdef = BUILDINGS[b.type];
        const bDoor = { x: b.x + bdef.door[0], y: b.y + bdef.door[1] };

        if (settler.state === 'walking_to_build') {
          const reached = this._moveSettlerAlongPath(settler, dt);
          if (reached || Math.hypot(settler.x - (bDoor.x + 0.5), settler.y - (bDoor.y + 0.5)) <= 0.6) {
            settler.state = 'building';
            settler.path = [];
          }
        }

        if (settler.state === 'building') {
          const area = bdef.size[0] * bdef.size[1];
          const buildTime = 6.0 * area / 4.0;
          b.progress = Math.min(1.0, b.progress + dt / buildTime);

          if (b.progress >= 1.0) {
            b.state = 'active';
            b.progress = 1.0;
            this.events.push({
              t: this.time,
              kind: 'built',
              text: `${bdef.name} completed!`,
              x: b.x,
              y: b.y
            });

            if (b.type === 'tower') {
              this.updateTerritory();
            }

            settler.role = 'idle';
            settler.job = null;
            settler.state = 'idle';
            settler.path = [];
            settler.emote = null;
            settler.lookAt = null;
          }
        }
        continue;
      }

      // Worker settler behavior
      if (settler.role === 'worker') {
        const b = this.buildings.find(b => b.id === settler.job);
        if (!b || b.state !== 'active') {
          settler.role = 'idle';
          settler.job = null;
          settler.state = 'idle';
          settler.path = [];
          settler.emote = null;
          settler.lookAt = null;
          continue;
        }

        const bdef = BUILDINGS[b.type];
        const bDoor = { x: b.x + bdef.door[0], y: b.y + bdef.door[1] };

        // 1. Walking to work door
        if (settler.state === 'walking_to_work') {
          const reached = this._moveSettlerAlongPath(settler, dt);
          if (reached || Math.hypot(settler.x - (bDoor.x + 0.5), settler.y - (bDoor.y + 0.5)) <= 0.6) {
            settler.state = 'at_building';
            settler.path = [];
          }
        }

        // 2. At building door / Working cycle
        if (settler.state === 'at_building' || settler.state === 'working') {
          if (settler.carry) {
            settler.state = 'delivering_output';
            settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), hqDoor.x, hqDoor.y, {
              blocked: (x, y) => this._isTileBlocked(x, y, hqDoor.x, hqDoor.y)
            }) || [];
            continue;
          }

          // Check if inputs needed
          let missingInput = null;
          if (bdef.in) {
            for (const [inGood, qty] of Object.entries(bdef.in)) {
              if ((b.inv[inGood] || 0) < qty) {
                missingInput = inGood;
                break;
              }
            }
          }

          if (missingInput) {
            settler.targetGood = missingInput;
            settler.state = 'walking_to_hq_for_input';
            settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), hqDoor.x, hqDoor.y, {
              blocked: (x, y) => this._isTileBlocked(x, y, hqDoor.x, hqDoor.y)
            }) || [];
            continue;
          }

          // Advance building production cycle
          b.working = true;
          b.cycleT += dt;

          if (b.cycleT >= (bdef.cycle || 10)) {
            b.cycleT = 0;
            let canProduce = true;

            if (bdef.needs) {
              canProduce = this._consumeRawResource(b);
            }

            if (canProduce) {
              if (bdef.in) {
                for (const [inGood, qty] of Object.entries(bdef.in)) {
                  b.inv[inGood] = (b.inv[inGood] || 0) - qty;
                }
              }
              if (bdef.plants === 'tree') {
                this._foresterPlant(b);
              }
              if (bdef.out) {
                for (const [outGood, qty] of Object.entries(bdef.out)) {
                  b.out[outGood] = (b.out[outGood] || 0) + qty;
                  this.stats.produced[outGood] = (this.stats.produced[outGood] || 0) + qty;
                }
              }
            } else {
              b.working = false;
            }
          }

          // Pick up output to deliver
          if (b.out) {
            for (const [outGood, qty] of Object.entries(b.out)) {
              if (qty > 0) {
                b.out[outGood]--;
                settler.carry = outGood;
                settler.state = 'delivering_output';
                settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), hqDoor.x, hqDoor.y, {
                  blocked: (x, y) => this._isTileBlocked(x, y, hqDoor.x, hqDoor.y)
                }) || [];
                break;
              }
            }
          }
        }

        // 3. Walking to HQ for input
        if (settler.state === 'walking_to_hq_for_input') {
          const reached = this._moveSettlerAlongPath(settler, dt);
          if (reached || Math.hypot(settler.x - (hqDoor.x + 0.5), settler.y - (hqDoor.y + 0.5)) <= 0.6) {
            const need = settler.targetGood;
            if ((this.stock[need] || 0) >= 1) {
              this.stock[need]--;
              settler.carry = need;
              settler.state = 'returning_input';
              settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), bDoor.x, bDoor.y, {
                blocked: (x, y) => this._isTileBlocked(x, y, bDoor.x, bDoor.y)
              }) || [];
            } else {
              settler.state = 'waiting_for_input_stock';
            }
          }
        }

        // 4. Waiting at HQ for stock
        if (settler.state === 'waiting_for_input_stock') {
          const need = settler.targetGood;
          if ((this.stock[need] || 0) >= 1) {
            this.stock[need]--;
            settler.carry = need;
            settler.state = 'returning_input';
            settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), bDoor.x, bDoor.y, {
              blocked: (x, y) => this._isTileBlocked(x, y, bDoor.x, bDoor.y)
            }) || [];
          }
        }

        // 5. Returning input to building
        if (settler.state === 'returning_input') {
          const reached = this._moveSettlerAlongPath(settler, dt);
          if (reached || Math.hypot(settler.x - (bDoor.x + 0.5), settler.y - (bDoor.y + 0.5)) <= 0.6) {
            const item = settler.carry;
            b.inv[item] = (b.inv[item] || 0) + 1;
            settler.carry = null;
            settler.state = 'at_building';
            settler.path = [];
          }
        }

        // 6. Delivering output to HQ
        if (settler.state === 'delivering_output') {
          const reached = this._moveSettlerAlongPath(settler, dt);
          if (reached || Math.hypot(settler.x - (hqDoor.x + 0.5), settler.y - (hqDoor.y + 0.5)) <= 0.6) {
            const item = settler.carry;
            this.stock[item] = (this.stock[item] || 0) + 1;
            settler.carry = null;
            settler.state = 'walking_to_work';
            settler.path = findPath(this.world, Math.floor(settler.x), Math.floor(settler.y), bDoor.x, bDoor.y, {
              blocked: (x, y) => this._isTileBlocked(x, y, bDoor.x, bDoor.y)
            }) || [];
          }
        }
      }

      // Anti-stuck safeguard reset
      if (settler.path.length === 0 && settler.state !== 'at_building' && settler.state !== 'building' && settler.state !== 'idle' && settler.state !== 'waiting_for_input_stock') {
        settler.stuckTimer += dt;
        if (settler.stuckTimer >= 5.0) {
          settler.stuckTimer = 0;
          settler.role = 'idle';
          settler.state = 'idle';
          settler.job = null;
          settler.emote = null;
          settler.lookAt = null;
          settler.x = hqDoor.x + 0.5;
          settler.y = hqDoor.y + 0.5;
        }
      } else {
        settler.stuckTimer = 0;
      }
    }
  }

  /**
   * Moves a settler step by step along path.
   * @private
   * @returns {boolean} True if reached path end
   */
  _moveSettlerAlongPath(settler, dt) {
    if (!settler.path || settler.path.length === 0) return true;

    const targetStep = settler.path[0];
    const tx = targetStep.x + 0.5;
    const ty = targetStep.y + 0.5;
    const dx = tx - settler.x;
    const dy = ty - settler.y;
    const dist = Math.hypot(dx, dy);

    const curX = Math.floor(settler.x);
    const curY = Math.floor(settler.y);
    const curIdx = idx(this.world.w, curX, curY);
    const speed = (this.roads[curIdx] === 1) ? 3.2 : 2.0;
    const stepDist = speed * dt;

    if (Math.abs(dx) > Math.abs(dy)) {
      settler.dir = dx > 0 ? 'r' : 'l';
    } else if (Math.abs(dy) > 0.001) {
      settler.dir = dy > 0 ? 'd' : 'u';
    }

    if (dist <= stepDist) {
      settler.x = tx;
      settler.y = ty;
      settler.path.shift();
      return settler.path.length === 0;
    } else {
      settler.x += (dx / dist) * stepDist;
      settler.y += (dy / dist) * stepDist;
      return false;
    }
  }

  /**
   * Helper to check if tile (x,y) is blocked by a building footprint.
   * @private
   */
  _isTileBlocked(x, y, targetX, targetY) {
    if (x === targetX && y === targetY) return false;
    if (!inBounds(this.world, x, y)) return true;
    if (!WALKABLE[this.world.terrain[idx(this.world.w, x, y)]]) return true;

    for (const b of this.buildings) {
      const bdef = BUILDINGS[b.type];
      if (x >= b.x && x < b.x + bdef.size[0] && y >= b.y && y < b.y + bdef.size[1]) {
        if (x === targetX && y === targetY) return false;
        return true;
      }
    }
    return false;
  }

  /**
   * Checks and consumes raw tile resource for active building cycle.
   * @private
   */
  _consumeRawResource(building) {
    const bdef = BUILDINGS[building.type];
    const needs = bdef.needs;
    const r = (needs === 'water' || needs === 'mountain') ? 4 : 6;
    const w = this.world.w;
    const h = this.world.h;

    const bDoor = { x: building.x + bdef.door[0], y: building.y + bdef.door[1] };
    const minX = Math.max(0, bDoor.x - r);
    const maxX = Math.min(w - 1, bDoor.x + r);
    const minY = Math.max(0, bDoor.y - r);
    const maxY = Math.min(h - 1, bDoor.y + r);

    let bestTile = null;
    let minD = Infinity;

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        const i = idx(w, tx, ty);
        const d = Math.hypot(tx - bDoor.x, ty - bDoor.y);
        if (d <= r && d < minD) {
          if (needs === 'tree' && this.world.tree[i] === 2) {
            minD = d; bestTile = { x: tx, y: ty, i };
          } else if (needs === 'rock' && (this.world.rock[i] > 0 || this.world.terrain[i] === T.ROCK)) {
            minD = d; bestTile = { x: tx, y: ty, i };
          } else if (needs === 'water' && (this.world.terrain[i] === T.WATER || this.world.terrain[i] === T.DEEP)) {
            minD = d; bestTile = { x: tx, y: ty, i };
          } else if (needs === 'mountain' && (this.world.terrain[i] === T.MOUNTAIN || this.world.ore[i] > 0)) {
            minD = d; bestTile = { x: tx, y: ty, i };
          }
        }
      }
    }

    if (!bestTile) {
      return false;
    }

    const { i } = bestTile;
    if (needs === 'tree') {
      this.world.tree[i] = 0;
    } else if (needs === 'rock') {
      if (this.world.rock[i] > 0) this.world.rock[i]--;
      if (this.world.rock[i] === 0 && this.world.terrain[i] === T.ROCK) {
        this.world.terrain[i] = T.GRASS;
      }
    } else if (needs === 'water') {
      if (this.world.fish[i] > 0) this.world.fish[i]--;
    } else if (needs === 'mountain') {
      if (this.world.ore[i] > 0) this.world.ore[i]--;
    }

    return true;
  }

  /**
   * Forester plants a tree sapling near door.
   * @private
   */
  _foresterPlant(building) {
    const bdef = BUILDINGS[building.type];
    const r = 6;
    const w = this.world.w;
    const h = this.world.h;
    const bDoor = { x: building.x + bdef.door[0], y: building.y + bdef.door[1] };

    const minX = Math.max(0, bDoor.x - r);
    const maxX = Math.min(w - 1, bDoor.x + r);
    const minY = Math.max(0, bDoor.y - r);
    const maxY = Math.min(h - 1, bDoor.y + r);

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        const i = idx(w, tx, ty);
        if (Math.hypot(tx - bDoor.x, ty - bDoor.y) <= r) {
          if (this.world.tree[i] === 0 && (this.world.terrain[i] === T.GRASS || this.world.terrain[i] === T.FOREST_FLOOR)) {
            this.world.tree[i] = 1; // Sapling
            this.saplings.push({ idx: i, timeRemaining: 90 });
            return;
          }
        }
      }
    }
  }

  /**
   * Checks if required nearby resource exists for placement validation.
   * @private
   */
  _hasNearbyResource(bx, by, bw, bh, needs) {
    const r = (needs === 'water' || needs === 'mountain') ? 4 : 6;
    const rSq = r * r;
    const w = this.world.w;
    const h = this.world.h;

    const minX = Math.max(0, bx - r);
    const maxX = Math.min(w - 1, bx + bw - 1 + r);
    const minY = Math.max(0, by - r);
    const maxY = Math.min(h - 1, by + bh - 1 + r);

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        const dx = Math.max(0, bx - tx, tx - (bx + bw - 1));
        const dy = Math.max(0, by - ty, ty - (by + bh - 1));
        if (dx * dx + dy * dy <= rSq) {
          const i = idx(w, tx, ty);
          if (needs === 'tree' && this.world.tree[i] === 2) return true;
          if (needs === 'rock' && (this.world.rock[i] > 0 || this.world.terrain[i] === T.ROCK)) return true;
          if (needs === 'water' && (this.world.terrain[i] === T.WATER || this.world.terrain[i] === T.DEEP)) return true;
          if (needs === 'mountain' && (this.world.terrain[i] === T.MOUNTAIN || this.world.ore[i] > 0)) return true;
        }
      }
    }
    return false;
  }

  /**
   * Recalculates stats.
   * @private
   */
  _updateStats() {
    this.stats.pop = this.settlers.length;
    let housing = 12;
    for (const b of this.buildings) {
      if (b.state === 'active' && BUILDINGS[b.type].pop) {
        if (b.type !== 'hq') {
          housing += BUILDINGS[b.type].pop;
        }
      }
    }
    this.stats.housing = housing;
    this.stats.foodPerMin = Number((this.stats.pop * SETTLER_FOOD_PER_MIN).toFixed(1));
  }

  /**
   * Serializes current state into a plain Object.
   * @returns {object}
   */
  toJSON() {
    return {
      seed: this.seed,
      time: this.time,
      speed: this.speed,
      rngSteps: this._rngSteps,
      stock: { ...this.stock },
      buildings: JSON.parse(JSON.stringify(this.buildings)),
      settlers: JSON.parse(JSON.stringify(this.settlers.map(s => ({
        ...s,
        mood: s.mood || 'calm',
        emote: s.emote ? { ...s.emote } : null,
        lookAt: s.lookAt ? { ...s.lookAt } : null
      })))),
      roads: Array.from(this.roads),
      territory: Array.from(this.territory),
      events: JSON.parse(JSON.stringify(this.events)),
      saplings: JSON.parse(JSON.stringify(this.saplings)),
      stats: JSON.parse(JSON.stringify(this.stats)),
      nextBuildingId: this._nextBuildingId,
      nextSettlerId: this._nextSettlerId,
      birthTimer: this._birthTimer,
      foodDebt: this._foodDebt,
      starveTimer: this._starveTimer,
      celebratedActiveBuildings: Array.from(this._celebratedActiveBuildings),
      worldState: {
        tree: Array.from(this.world.tree),
        rock: Array.from(this.world.rock),
        ore: Array.from(this.world.ore),
        fish: Array.from(this.world.fish)
      }
    };
  }

  /**
   * Deserializes instance from plain Object.
   * @param {object} obj
   * @returns {Game}
   */
  static fromJSON(obj) {
    const game = new Game({ seed: obj.seed });
    game.time = obj.time;
    game.speed = obj.speed;
    game._rngSteps = obj.rngSteps || 0;

    // Restore exact PRNG state
    game.rng = mulberry32(obj.seed);
    for (let i = 0; i < game._rngSteps; i++) {
      game.rng();
    }

    game.stock = { ...obj.stock };
    game.buildings = JSON.parse(JSON.stringify(obj.buildings));
    
    game.settlers = JSON.parse(JSON.stringify(obj.settlers)).map(s => ({
      mood: 'calm',
      emote: null,
      lookAt: null,
      _wanderTimer: 0,
      _socialCooldown: 0,
      _idlePauseTimer: 0,
      ...s
    }));

    if (obj.roads) game.roads.set(obj.roads);
    if (obj.territory) game.territory.set(obj.territory);

    game.events = JSON.parse(JSON.stringify(obj.events));
    game.saplings = JSON.parse(JSON.stringify(obj.saplings || []));
    game.stats = JSON.parse(JSON.stringify(obj.stats));
    game._nextBuildingId = obj.nextBuildingId;
    game._nextSettlerId = obj.nextSettlerId;
    game._birthTimer = obj.birthTimer || 0;
    game._foodDebt = obj.foodDebt || 0;
    game._starveTimer = obj.starveTimer || 0;
    game._celebratedActiveBuildings = new Set(obj.celebratedActiveBuildings || []);

    if (obj.worldState) {
      if (obj.worldState.tree) game.world.tree.set(obj.worldState.tree);
      if (obj.worldState.rock) game.world.rock.set(obj.worldState.rock);
      if (obj.worldState.ore) game.world.ore.set(obj.worldState.ore);
      if (obj.worldState.fish) game.world.fish.set(obj.worldState.fish);
    }

    return game;
  }
}
