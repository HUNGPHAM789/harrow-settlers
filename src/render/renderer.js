/**
 * Harrow Settlers - isometric renderer (2:1 dimetric, 32x16 diamond tiles).
 *
 * Projection (world px, before camera):  sx = (tx - ty) * 16,  sy = (tx + ty) * 8.
 * The point (sx, sy) is the TOP vertex of tile (tx, ty); the diamond spans x-16..x+16, y..y+16.
 * Camera.x/y is an isometric world-pixel point shown at the screen centre.
 * The renderer never mutates game state; clicks are reported through `onTileClick`.
 */
import { T, BUILDINGS } from '../sim/defs.js';

const HW = 16; // half tile width
const HH = 8;  // half tile height
const TERRAIN_NAMES = ['deep', 'water', 'sand', 'grass', 'forest', 'rock', 'mountain', 'snow'];
const FALLBACK_COLOR = ['#14283c', '#285078', '#d2b48c', '#588c42', '#3c6e3c', '#8c8c8c', '#646464', '#e8eef0'];
const MINIMAP_COLOR = FALLBACK_COLOR;

const hash2 = (x, y) => (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../sim/game.js').Game} game
   * @param {import('./sprites.js').Sprites} sprites
   */
  constructor(canvas, game, sprites) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.game = game;
    this.sprites = sprites;
    this.camera = { x: 0, y: 0, zoom: 2 };
    this.ghost = null;
    this.selectedId = null;
    this.onTileClick = null; // (tile:{x,y}, button:number) => void
    this.isDragging = false;
    this.dragMoved = 0;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.keysPressed = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
    this.mouseScreenX = -1;
    this.mouseScreenY = -1;
    this.particles = [];
    this._dpr = window.devicePixelRatio || 1;
    this._cw = 0;
    this._ch = 0;
    const s = game.world?.start ?? { x: 48, y: 48 };
    this.centerOnTile(s.x + 1, s.y + 1);
    this._initListeners();
    this.resize();
  }

  // ---------------------------------------------------------------- projection
  /** Iso world px of continuous tile coords (u,v). */
  project(u, v) { return { x: (u - v) * HW, y: (u + v) * HH }; }
  /** Continuous tile coords of an iso world px point. */
  unproject(wx, wy) { return { u: (wx / HW + wy / HH) / 2, v: (wy / HH - wx / HW) / 2 }; }

  screenToWorld(sx, sy) {
    return { x: this.camera.x + (sx - this._cw / 2) / this.camera.zoom, y: this.camera.y + (sy - this._ch / 2) / this.camera.zoom };
  }
  worldToScreen(wx, wy) {
    return { x: (wx - this.camera.x) * this.camera.zoom + this._cw / 2, y: (wy - this.camera.y) * this.camera.zoom + this._ch / 2 };
  }
  /** Tile whose diamond contains the screen point. */
  screenToTile(sx, sy) {
    const w = this.screenToWorld(sx, sy);
    const { u, v } = this.unproject(w.x, w.y);
    return { x: Math.floor(u), y: Math.floor(v) };
  }
  /** Screen position of the CENTRE of tile (tx, ty). */
  tileToScreen(tx, ty) {
    const p = this.project(tx + 0.5, ty + 0.5);
    return this.worldToScreen(p.x, p.y);
  }
  centerOnTile(tx, ty) {
    const p = this.project(tx + 0.5, ty + 0.5);
    this.camera.x = p.x; this.camera.y = p.y;
    this._clampCamera();
  }
  /** Tile under the mouse, or null when the pointer is outside the canvas/map. */
  hoverTile() {
    if (this.mouseScreenX < 0) return null;
    const t = this.screenToTile(this.mouseScreenX, this.mouseScreenY);
    const w = this.game.world;
    return w && t.x >= 0 && t.y >= 0 && t.x < w.w && t.y < w.h ? t : null;
  }
  setGhost(ghost) { this.ghost = ghost; }
  setSelected(id) { this.selectedId = id; }

  // ---------------------------------------------------------------- input
  _initListeners() {
    this._onMouseDown = (e) => {
      if (e.button === 0 || e.button === 1 || e.button === 2) {
        this.isDragging = e.button !== 2; this.dragMoved = 0;
        this.dragStartX = e.clientX; this.dragStartY = e.clientY; this._downButton = e.button;
      }
    };
    this._onMouseMove = (e) => {
      const r = this.canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (e.target === this.canvas || this.isDragging) { this.mouseScreenX = e.clientX - r.left; this.mouseScreenY = e.clientY - r.top; }
      else if (!inside || e.target !== this.canvas) { this.mouseScreenX = -1; }
      if (this.isDragging) {
        const dx = e.clientX - this.dragStartX, dy = e.clientY - this.dragStartY;
        this.dragMoved += Math.abs(dx) + Math.abs(dy);
        this.dragStartX = e.clientX; this.dragStartY = e.clientY;
        if (this.dragMoved > 6) { this.camera.x -= dx / this.camera.zoom; this.camera.y -= dy / this.camera.zoom; this._clampCamera(); }
      }
    };
    this._onMouseUp = (e) => {
      const wasDrag = this.dragMoved > 6;
      const onCanvas = e.target === this.canvas;
      this.isDragging = false;
      if (!wasDrag && onCanvas && this.onTileClick && this._downButton === e.button) {
        const r = this.canvas.getBoundingClientRect();
        const t = this.screenToTile(e.clientX - r.left, e.clientY - r.top);
        const w = this.game.world;
        if (w && t.x >= 0 && t.y >= 0 && t.x < w.w && t.y < w.h) this.onTileClick(t, e.button);
      }
      this._downButton = -1;
    };
    this._onWheel = (e) => {
      e.preventDefault();
      const nz = Math.max(1, Math.min(4, this.camera.zoom + (e.deltaY < 0 ? 1 : -1)));
      if (nz === this.camera.zoom) return;
      const r = this.canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const before = this.screenToWorld(mx, my);
      this.camera.zoom = nz;
      const after = this.screenToWorld(mx, my);
      this.camera.x += before.x - after.x; this.camera.y += before.y - after.y;
      this._clampCamera();
    };
    this._onKeyDown = (e) => { if (e.key in this.keysPressed && !/INPUT|TEXTAREA/.test(e.target.tagName)) this.keysPressed[e.key] = true; };
    this._onKeyUp = (e) => { if (e.key in this.keysPressed) this.keysPressed[e.key] = false; };
    this._onContext = (e) => e.preventDefault();
    this._onResize = () => this.resize();
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('wheel', this._onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', this._onContext);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('resize', this._onResize);
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('wheel', this._onWheel);
    this.canvas.removeEventListener('contextmenu', this._onContext);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('resize', this._onResize);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    }
    this._dpr = dpr; this._cw = w; this._ch = h;
  }

  _clampCamera() {
    const wd = this.game.world; if (!wd) return;
    const minX = -wd.h * HW, maxX = wd.w * HW, minY = 0, maxY = (wd.w + wd.h) * HH;
    this.camera.x = Math.max(minX, Math.min(maxX, this.camera.x));
    this.camera.y = Math.max(minY, Math.min(maxY, this.camera.y));
  }

  _updateCamera(dt) {
    const sp = 360 / this.camera.zoom;
    let dx = 0, dy = 0; const k = this.keysPressed;
    if (k.w || k.ArrowUp) dy -= 1; if (k.s || k.ArrowDown) dy += 1;
    if (k.a || k.ArrowLeft) dx -= 1; if (k.d || k.ArrowRight) dx += 1;
    if (dx || dy) { const l = Math.hypot(dx, dy); this.camera.x += dx / l * sp * dt; this.camera.y += dy / l * sp * dt * 0.75; this._clampCamera(); }
  }

  // ---------------------------------------------------------------- frame
  /** Per-frame animation state (smoke). Call with real dt. */
  update(dt) {
    for (const b of this.game.buildings) {
      if (b.state === 'active' && b.working && Math.random() < dt * 3.5) {
        const def = BUILDINGS[b.type]; if (!def) continue;
        const [bw, bh] = def.size;
        const bottom = this.project(b.x + bw, b.y + bh);
        let chimX = bottom.x, chimY = bottom.y - 24;
        if (b.type === 'smith') { chimX += 8; chimY -= 12; }
        else if (b.type === 'smelter') { chimX += 4; chimY -= 18; }
        else if (b.type === 'bakery') { chimX -= 7; chimY -= 8; }
        else if (b.type === 'mill') continue;
        this.particles.push({
          x: chimX + (Math.random() - 0.5) * 3,
          y: chimY,
          vx: 2.5 + Math.random() * 2.5,
          vy: -11 - Math.random() * 6,
          life: 1,
          maxLife: 1.5 + Math.random() * 0.6,
          size: 2.2 + Math.random() * 1.8
        });
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt / p.maxLife;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  render(dt = 0.016) {
    this.resize();
    this._updateCamera(dt);
    const world = this.game.world; if (!world) return;
    const ctx = this.ctx, cw = this._cw, ch = this._ch, z = this.camera.zoom;
    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#10243a'; ctx.fillRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(Math.round(cw / 2), Math.round(ch / 2));
    ctx.scale(z, z);
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
    const vis = this._visibleTiles(world);
    this._renderTerrain(ctx, world, vis);
    this._renderTerritory(ctx, world, vis);
    this._renderGhostFootprint(ctx, world);
    this._renderEntities(ctx, world, vis);
    this._renderGhostBuilding(ctx);
    ctx.restore();
    this._renderDayNight(ctx, cw, ch);
  }

  _visibleTiles(world) {
    const m = 3, cw = this._cw, ch = this._ch;
    let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (const [sx, sy] of [[0, 0], [cw, 0], [0, ch], [cw, ch]]) {
      const w = this.screenToWorld(sx, sy); const { u, v } = this.unproject(w.x, w.y);
      u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
    }
    return { x0: Math.max(0, Math.floor(u0) - m), x1: Math.min(world.w - 1, Math.ceil(u1) + m + 3), y0: Math.max(0, Math.floor(v0) - m), y1: Math.min(world.h - 1, Math.ceil(v1) + m + 3) };
  }

  _diamond(ctx, tx, ty, inset = 0) {
    const p = this.project(tx, ty);
    ctx.beginPath(); ctx.moveTo(p.x, p.y + inset); ctx.lineTo(p.x + HW - inset * 2, p.y + HH); ctx.lineTo(p.x, p.y + HH * 2 - inset); ctx.lineTo(p.x - HW + inset * 2, p.y + HH); ctx.closePath();
  }

  _variant(base, h, max) {
    for (let n = max; n >= 1; n--) { if (this.sprites.has(`${base}_${n}`)) { const k = 1 + (h % n); return `${base}_${k}`; } }
    return base;
  }

  _renderTerrain(ctx, world, v) {
    const sp = this.sprites, time = this.game.time || 0, roads = this.game.roads, W = world.w;
    for (let ty = v.y0; ty <= v.y1; ty++) {
      for (let tx = v.x0; tx <= v.x1; tx++) {
        const i = ty * W + tx, t = world.terrain[i], name = TERRAIN_NAMES[t] ?? 'grass', h = hash2(tx, ty);
        const p = this.project(tx, ty);
        let sprite = `iso_tile_${name}`;
        if (t === T.WATER || t === T.DEEP) { const f = (Math.floor(time * 1.4) + (h & 7)) % 3 + 1; sprite = sp.has(`iso_tile_${name}_${f}`) ? `iso_tile_${name}_${f}` : sprite; }
        else if (t === T.GRASS) sprite = this._variant('iso_tile_grass', h, 6);
        if (sp.has(sprite)) sp.draw(ctx, sprite, p.x - HW, p.y);
        else { ctx.fillStyle = FALLBACK_COLOR[t] ?? '#588c42'; this._diamond(ctx, tx, ty); ctx.fill(); }
        if (roads && roads[i]) {
          this._renderRoadTile(ctx, tx, ty, roads, W, world.h);
        }
      }
    }
  }

  _renderRoadTile(ctx, tx, ty, roads, W, H) {
    const p = this.project(tx, ty);
    const cx = p.x, cy = p.y + HH;

    const nw = ty > 0 && roads[(ty - 1) * W + tx] === 1;
    const ne = tx < W - 1 && roads[ty * W + (tx + 1)] === 1;
    const se = ty < H - 1 && roads[(ty + 1) * W + tx] === 1;
    const sw = tx > 0 && roads[ty * W + (tx - 1)] === 1;

    const midNW = { x: p.x - HW / 2, y: p.y + HH / 2 };
    const midNE = { x: p.x + HW / 2, y: p.y + HH / 2 };
    const midSE = { x: p.x + HW / 2, y: p.y + (3 * HH) / 2 };
    const midSW = { x: p.x - HW / 2, y: p.y + (3 * HH) / 2 };

    const count = (nw ? 1 : 0) + (ne ? 1 : 0) + (se ? 1 : 0) + (sw ? 1 : 0);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (count === 0) {
      ctx.fillStyle = '#8a6540';
      ctx.beginPath(); ctx.ellipse(cx, cy, 7, 3.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b38a5a';
      ctx.beginPath(); ctx.ellipse(cx, cy - 0.5, 5, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = '#5a3f28';
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      if (nw) { ctx.moveTo(cx, cy); ctx.lineTo(midNW.x, midNW.y); }
      if (ne) { ctx.moveTo(cx, cy); ctx.lineTo(midNE.x, midNE.y); }
      if (se) { ctx.moveTo(cx, cy); ctx.lineTo(midSE.x, midSE.y); }
      if (sw) { ctx.moveTo(cx, cy); ctx.lineTo(midSW.x, midSW.y); }
      ctx.stroke();

      ctx.strokeStyle = '#8a6742';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      if (nw) { ctx.moveTo(cx, cy); ctx.lineTo(midNW.x, midNW.y); }
      if (ne) { ctx.moveTo(cx, cy); ctx.lineTo(midNE.x, midNE.y); }
      if (se) { ctx.moveTo(cx, cy); ctx.lineTo(midSE.x, midSE.y); }
      if (sw) { ctx.moveTo(cx, cy); ctx.lineTo(midSW.x, midSW.y); }
      ctx.stroke();

      ctx.strokeStyle = '#c49a6c';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      if (nw) { ctx.moveTo(cx, cy); ctx.lineTo(midNW.x, midNW.y); }
      if (ne) { ctx.moveTo(cx, cy); ctx.lineTo(midNE.x, midNE.y); }
      if (se) { ctx.moveTo(cx, cy); ctx.lineTo(midSE.x, midSE.y); }
      if (sw) { ctx.moveTo(cx, cy); ctx.lineTo(midSW.x, midSW.y); }
      ctx.stroke();

      ctx.fillStyle = '#b38a5a';
      ctx.beginPath(); ctx.ellipse(cx, cy, 3.2, 1.8, 0, 0, Math.PI * 2); ctx.fill();

      if (count === 1 || count >= 3) {
        const postX = Math.round(cx - 3), postY = Math.round(cy - 2);
        ctx.fillStyle = 'rgba(20, 20, 25, 0.35)';
        ctx.beginPath(); ctx.ellipse(postX + 1, postY + 2, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a301a'; ctx.fillRect(postX, postY - 5, 2, 6);
        ctx.fillStyle = count >= 3 ? '#f5d547' : '#f0ece1'; ctx.fillRect(postX + 2, postY - 5, 3, 2);
      }
    }
    ctx.restore();
  }

  _renderTerritory(ctx, world, v) {
    const terr = this.game.territory; if (!terr) return;
    const W = world.w, H = world.h, dash = (this.game.time * 14) % 12;
    ctx.save(); ctx.strokeStyle = 'rgba(255,214,90,0.95)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -dash;
    ctx.beginPath();
    const out = (x, y) => x < 0 || y < 0 || x >= W || y >= H || !terr[y * W + x];
    for (let ty = v.y0; ty <= v.y1; ty++) for (let tx = v.x0; tx <= v.x1; tx++) {
      if (!terr[ty * W + tx]) continue;
      const p = this.project(tx, ty), T_ = [p.x, p.y], R = [p.x + HW, p.y + HH], B = [p.x, p.y + 2 * HH], L = [p.x - HW, p.y + HH];
      if (out(tx - 1, ty)) { ctx.moveTo(...T_); ctx.lineTo(...L); }
      if (out(tx, ty - 1)) { ctx.moveTo(...T_); ctx.lineTo(...R); }
      if (out(tx + 1, ty)) { ctx.moveTo(...R); ctx.lineTo(...B); }
      if (out(tx, ty + 1)) { ctx.moveTo(...L); ctx.lineTo(...B); }
    }
    ctx.stroke(); ctx.restore();
  }

  // ---------------------------------------------------------------- entities
  _renderEntities(ctx, world, v) {
    const items = [], W = world.w, sp = this.sprites;
    for (let ty = v.y0; ty <= v.y1; ty++) for (let tx = v.x0; tx <= v.x1; tx++) {
      const i = ty * W + tx;
      const tr = world.tree[i];
      if (tr > 0) items.push({ k: tx + ty, tx, ty, kind: tr === 1 ? 'sapling' : 'tree', h: hash2(tx, ty) });
      if (world.rock[i] > 0) items.push({ k: tx + ty, tx, ty, kind: 'rock', h: hash2(tx, ty) });
      if (this.game.prospects && this.game.prospects[i] > 0) items.push({ k: tx + ty + 0.15, tx, ty, kind: 'prospect', vein: this.game.prospects[i] });
    }
    for (const b of this.game.buildings) {
      const d = BUILDINGS[b.type]; if (!d) continue;
      items.push({ k: b.x + b.y + d.size[0] + d.size[1] - 2 + 0.25, kind: 'building', b, d });
    }
    for (const s of this.game.settlers) items.push({ k: s.x + s.y + 0.5, kind: 'settler', s });
    items.sort((a, b) => a.k - b.k);
    for (const it of items) {
      if (it.kind === 'tree') this._drawTree(ctx, it);
      else if (it.kind === 'sapling') this._drawProp(ctx, 'iso_sapling', 'sapling', it, 12, 14, '#4a8a3a');
      else if (it.kind === 'rock') this._drawProp(ctx, `iso_rock_${1 + (it.h % 2)}`, `rock_${1 + (it.h % 2)}`, it, 18, 14, '#8a8a90');
      else if (it.kind === 'prospect') this._drawProspectSign(ctx, it);
      else if (it.kind === 'building') this._drawBuilding(ctx, it.b, it.d);
      else this._drawSettler(ctx, it.s);
    }
    for (const p of this.particles) {
      ctx.fillStyle = `rgba(235,235,240,${(Math.max(0, p.life) * 0.65).toFixed(3)})`;
      const r = (p.size || 2.5) + (1 - p.life) * 3.5;
      ctx.beginPath(); ctx.arc(Math.round(p.x), Math.round(p.y), r, 0, Math.PI * 2); ctx.fill();
    }
  }

  _shadow(ctx, x, y, rx, ry, a = 0.28) {
    ctx.fillStyle = `rgba(10,16,30,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }

  _drawTree(ctx, it) {
    const c = this.project(it.tx + 0.5, it.ty + 0.5), name = `iso_tree_${1 + (it.h % 3)}`;
    this._shadow(ctx, c.x, c.y + HH, 8, 3.5);
    this._drawProp(ctx, name, `tree_${1 + (it.h % 3)}`, it, 22, 30, '#2f6a35', true);
  }

  /** Draw a prop whose bottom-centre stands on the centre of tile it.tx,it.ty. */
  _drawProp(ctx, name, legacy, it, fw, fh, color, noShadow) {
    const c = this.project(it.tx + 0.5, it.ty + 0.5), fy = c.y + HH;
    if (!noShadow) this._shadow(ctx, c.x, fy - 1, fw / 3, 2.5, 0.22);
    const use = this.sprites.has(name) ? name : this.sprites.has(legacy) ? legacy : null;
    if (use) { const sz = this.sprites.size(use); this.sprites.draw(ctx, use, Math.round(c.x - sz.w / 2), Math.round(fy - sz.h)); }
    else { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(c.x, fy - fh / 2, fw / 2, fh / 2, 0, 0, Math.PI * 2); ctx.fill(); }
  }

  _box(ctx, bx, by, bw, bh, hgt, top, left, right) {
    const A = this.project(bx, by), B = this.project(bx + bw, by), C = this.project(bx + bw, by + bh), D = this.project(bx, by + bh);
    ctx.fillStyle = left; ctx.beginPath(); ctx.moveTo(D.x, D.y); ctx.lineTo(C.x, C.y); ctx.lineTo(C.x, C.y - hgt); ctx.lineTo(D.x, D.y - hgt); ctx.fill();
    ctx.fillStyle = right; ctx.beginPath(); ctx.moveTo(C.x, C.y); ctx.lineTo(B.x, B.y); ctx.lineTo(B.x, B.y - hgt); ctx.lineTo(C.x, C.y - hgt); ctx.fill();
    ctx.fillStyle = top; ctx.beginPath(); ctx.moveTo(A.x, A.y - hgt); ctx.lineTo(B.x, B.y - hgt); ctx.lineTo(C.x, C.y - hgt); ctx.lineTo(D.x, D.y - hgt); ctx.fill();
  }

  _drawBuilding(ctx, b, d) {
    const [bw, bh] = d.size, sp = this.sprites, active = b.state === 'active';
    const bottom = this.project(b.x + bw, b.y + bh), center = this.project(b.x + bw / 2, b.y + bh / 2);
    this._shadow(ctx, center.x, center.y + 1, (bw + bh) * 9, (bw + bh) * 3.6, 0.18);
    const iso = active ? `b_iso_${b.type}` : `b_iso_${b.type}_scaffold`;
    const legacy = active ? `b_${b.type}` : `b_${b.type}_scaffold`;
    const use = sp.has(iso) ? iso : sp.has(legacy) ? legacy : null;
    if (use) {
      const sz = sp.size(use);
      if (!active && !sp.has(iso) && sp.has(`b_${b.type}`)) ctx.globalAlpha = 0.55;
      sp.draw(ctx, use, Math.round(bottom.x - sz.w / 2), Math.round(bottom.y - sz.h));
      ctx.globalAlpha = 1;
    } else {
      const full = 14 + (bw + bh) * 4, hgt = active ? full : Math.max(3, full * (0.25 + 0.75 * (b.progress || 0)));
      const pal = d.wonder ? ['#e8d28a', '#a8905a', '#c7ad6e'] : b.type === 'hq' ? ['#c9c4d6', '#7d788c', '#a29db4'] : ['#d9a35f', '#8a5a2b', '#b07a40'];
      this._box(ctx, b.x, b.y, bw, bh, hgt, pal[0], pal[1], pal[2]);
    }
    if (!active) {
      const bwid = (bw + bh) * 8;
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(Math.round(center.x - bwid / 2), Math.round(center.y - 6), bwid, 4);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(Math.round(center.x - bwid / 2) + 1, Math.round(center.y - 5), Math.max(0, (bwid - 2) * (b.progress || 0)), 2);
    } else {
      if (b.type === 'mill') {
        const sz = (use && sp.has(use)) ? sp.size(use) : { w: 32, h: 14 + (bw + bh) * 4 };
        this._drawWindmillSails(ctx, b, bottom, sz);
      } else if (b.type === 'farm') {
        this._drawFarmCrops(ctx, b);
      }
      const dayT = ((this.game.time || 0) % 240) / 240;
      if (dayT > 0.65 && dayT < 0.96) {
        const factor = Math.min(1, Math.sin(((dayT - 0.65) / 0.31) * Math.PI));
        this._drawBuildingNightLights(ctx, b, bottom, factor);
      }
    }
    if (this.selectedId === b.id) {
      ctx.strokeStyle = '#ffe14a'; ctx.lineWidth = 1.5; ctx.beginPath();
      const A = this.project(b.x, b.y), B = this.project(b.x + bw, b.y), C = this.project(b.x + bw, b.y + bh), D = this.project(b.x, b.y + bh);
      ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(D.x, D.y); ctx.closePath(); ctx.stroke();
    }
  }

  _drawSettler(ctx, s) {
    const time = this.game.time || 0, moving = s.path && s.path.length > 0;
    const c = this.project(s.x + 0.5, s.y + 0.5), fy = c.y + HH - 1;
    const role = s.role || 'idle';
    let dir = s.dir || 'd';
    if (!moving && s.lookAt) { const dx = s.lookAt.x - s.x, dy = s.lookAt.y - s.y; dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); }
    const frame = moving ? 1 + (Math.floor(time * 7 + s.id) % 2) : 0;
    let name = `settler_${role}_${dir}_${frame}`;
    if (!this.sprites.has(name)) name = 'settler_idle_d_0';
    this._shadow(ctx, c.x, fy, 5, 2.2, 0.3);
    const bob = moving ? Math.abs(Math.sin(time * 14 + s.id)) * -1.2 : 0;
    const breathe = !moving && role === 'idle' ? Math.sin(time * 2.2 + s.id * 1.7) * 0.5 : 0;
    const x = Math.round(c.x - 6), y = Math.round(fy - 16 + bob + (breathe > 0.25 ? 1 : 0));
    ctx.save();
    if (this.sprites.has(name)) {
      if (s.mood === 'hungry') ctx.globalAlpha = 0.82;
      this.sprites.draw(ctx, name, x, y);
    } else { ctx.fillStyle = role === 'builder' ? '#f59e0b' : '#3b82f6'; ctx.fillRect(x + 2, y + 4, 8, 12); }
    ctx.restore();
    if (s.carry) {
      const cs = `carry_${s.carry}`;
      if (this.sprites.has(cs)) this.sprites.draw(ctx, cs, Math.round(c.x - 4), y - 8);
      else { ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(c.x - 3), y - 6, 6, 6); }
    }
    if (s.emote) this._drawEmote(ctx, s.emote, c.x, y - (s.carry ? 12 : 3), s.id);
  }

  /** Speech bubble with a small pixel glyph; fades in its last 0.5 s. */
  _drawEmote(ctx, emote, cx, top, id) {
    const t = this.game.time || 0, kind = emote.kind;
    const a = Math.max(0, Math.min(1, emote.t / 0.5, (emote.age ?? 9) / 0.15));
    const bx = Math.round(cx - 7), by = Math.round(top - 14 + Math.sin(t * 5 + id) * 1);
    ctx.save(); ctx.globalAlpha = a;
    const sprite = `emote_${kind}`;
    if (this.sprites.has(sprite)) { this.sprites.draw(ctx, sprite, bx - 1, by - 1); ctx.restore(); return; }
    ctx.fillStyle = '#2a1a2a'; ctx.fillRect(bx - 1, by, 16, 12); ctx.fillRect(bx, by - 1, 14, 14);
    ctx.fillStyle = '#fffbe8'; ctx.fillRect(bx, by, 14, 11); ctx.fillRect(bx + 1, by - 0, 12, 12);
    ctx.fillStyle = '#2a1a2a'; ctx.fillRect(bx + 5, by + 12, 4, 2); ctx.fillStyle = '#fffbe8'; ctx.fillRect(bx + 6, by + 11, 2, 2);
    const g = (c, x, y, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(bx + x, by + y, w, h); };
    if (kind === '!') { g('#d93a3a', 6, 2, 2, 5); g('#d93a3a', 6, 8, 2, 2); }
    else if (kind === '?') { g('#3a6ad9', 4, 2, 5, 1); g('#3a6ad9', 8, 3, 2, 2); g('#3a6ad9', 6, 5, 2, 2); g('#3a6ad9', 6, 8, 2, 2); }
    else if (kind === 'heart') { g('#e8507a', 3, 3, 3, 2); g('#e8507a', 8, 3, 3, 2); g('#e8507a', 3, 5, 8, 2); g('#e8507a', 4, 7, 6, 1); g('#e8507a', 5, 8, 4, 1); g('#e8507a', 6, 9, 2, 1); }
    else if (kind === 'zzz') { g('#7a86b8', 3, 2, 5, 1); g('#7a86b8', 6, 3, 1, 1); g('#7a86b8', 5, 4, 1, 1); g('#7a86b8', 4, 5, 1, 1); g('#7a86b8', 3, 6, 5, 1); g('#9aa4cc', 8, 7, 3, 1); g('#9aa4cc', 9, 8, 1, 1); g('#9aa4cc', 8, 9, 3, 1); }
    else if (kind === 'cheer') { g('#f2c230', 6, 2, 2, 2); g('#f2c230', 3, 4, 8, 2); g('#f2c230', 4, 6, 6, 2); g('#f2c230', 4, 8, 2, 2); g('#f2c230', 8, 8, 2, 2); }
    else if (kind === 'hammer') { g('#8a5a2b', 6, 4, 2, 6); g('#7d8794', 3, 2, 8, 3); }
    else if (kind === 'food') { g('#e08a3a', 4, 4, 6, 5); g('#f0b060', 5, 4, 3, 2); g('#4a8a3a', 7, 2, 2, 2); }
    else g('#555', 4, 4, 6, 3);
    ctx.restore();
  }

  // ---------------------------------------------------------------- placement ghost
  _renderGhostFootprint(ctx, world) {
    if (!this.ghost) return;
    const def = BUILDINGS[this.ghost.type]; if (!def) return;
    const ok = this.game.canPlace(this.ghost.type, this.ghost.x, this.ghost.y).ok;
    for (let dy = 0; dy < def.size[1]; dy++) for (let dx = 0; dx < def.size[0]; dx++) {
      const tx = this.ghost.x + dx, ty = this.ghost.y + dy;
      const inMap = tx >= 0 && ty >= 0 && tx < world.w && ty < world.h;
      ctx.fillStyle = inMap && ok ? 'rgba(74,222,128,0.42)' : 'rgba(239,68,68,0.5)';
      this._diamond(ctx, tx, ty); ctx.fill();
      ctx.strokeStyle = inMap && ok ? '#22c55e' : '#ef4444'; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  _renderGhostBuilding(ctx) {
    if (!this.ghost) return;
    const def = BUILDINGS[this.ghost.type]; if (!def) return;
    const ok = this.game.canPlace(this.ghost.type, this.ghost.x, this.ghost.y).ok, [bw, bh] = def.size;
    ctx.save(); ctx.globalAlpha = 0.68;
    const iso = `b_iso_${this.ghost.type}`, legacy = `b_${this.ghost.type}`, bottom = this.project(this.ghost.x + bw, this.ghost.y + bh);
    const use = this.sprites.has(iso) ? iso : this.sprites.has(legacy) ? legacy : null;
    if (use) { const sz = this.sprites.size(use); this.sprites.draw(ctx, use, Math.round(bottom.x - sz.w / 2), Math.round(bottom.y - sz.h)); }
    else this._box(ctx, this.ghost.x, this.ghost.y, bw, bh, 14 + (bw + bh) * 4, ok ? '#9be8b0' : '#f0a0a0', ok ? '#4a9a62' : '#a04a4a', ok ? '#6fc488' : '#c46f6f');
    ctx.restore();
  }

  // ---------------------------------------------------------------- day/night
  _renderDayNight(ctx, w, h) {
    const c = ((this.game.time || 0) % 240) / 240;
    if (c >= 0.50 && c < 0.70) {
      const p = (c - 0.50) / 0.20;
      const a = Math.sin(p * Math.PI) * 0.18;
      if (a > 0.005) { ctx.fillStyle = `rgba(235, 125, 35, ${a.toFixed(3)})`; ctx.fillRect(0, 0, w, h); }
    } else if (c >= 0.70 && c < 0.92) {
      const p = (c - 0.70) / 0.22;
      const a = Math.sin(p * Math.PI) * 0.36;
      if (a > 0.005) { ctx.fillStyle = `rgba(14, 20, 56, ${a.toFixed(3)})`; ctx.fillRect(0, 0, w, h); }
    } else if (c >= 0.92) {
      const p = (c - 0.92) / 0.08;
      const a = Math.sin(p * Math.PI) * 0.14;
      if (a > 0.005) { ctx.fillStyle = `rgba(165, 130, 185, ${a.toFixed(3)})`; ctx.fillRect(0, 0, w, h); }
    }
  }

  _drawWindmillSails(ctx, b, bottom, sz) {
    const time = this.game.time || 0;
    const speed = b.working ? 2.8 : 0.4;
    const angle = (time * speed) % (Math.PI * 2);
    const hubX = Math.round(bottom.x);
    const hubY = Math.round(bottom.y - sz.h + 26);
    const radius = 20;

    ctx.save();
    ctx.fillStyle = '#3a2312';
    ctx.beginPath(); ctx.arc(hubX, hubY, 3.5, 0, Math.PI * 2); ctx.fill();

    for (let i = 0; i < 4; i++) {
      const a = angle + (i * Math.PI) / 2;
      const cos = Math.cos(a), sin = Math.sin(a);
      const tipX = hubX + cos * radius;
      const tipY = hubY + sin * radius * 0.75;

      ctx.strokeStyle = '#3a2010';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(hubX, hubY); ctx.lineTo(tipX, tipY); ctx.stroke();

      const perpX = -sin * 5.2;
      const perpY = cos * 5.2 * 0.75;
      ctx.fillStyle = b.working ? 'rgba(250, 248, 240, 0.95)' : 'rgba(220, 215, 205, 0.75)';
      ctx.strokeStyle = '#7c6853';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(hubX + cos * 4, hubY + sin * 4 * 0.75);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX + perpX, tipY + perpY);
      ctx.lineTo(hubX + cos * 4 + perpX * 0.6, hubY + sin * 4 * 0.75 + perpY * 0.6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  _drawFarmCrops(ctx, b) {
    const time = this.game.time || 0;
    const prog = b.state === 'active' ? Math.min(1, (b.cycleT || 0) / (BUILDINGS.farm?.cycle || 20)) : 0;
    const stage = prog < 0.33 ? 0 : prog < 0.70 ? 1 : 2;

    const base = this.project(b.x + 0.5, b.y + 0.5);
    const offsets = [
      [-12, -4], [10, -8], [-18, 6], [14, 4], [-4, 10], [6, 12]
    ];

    ctx.save();
    for (let i = 0; i < offsets.length; i++) {
      const [ox, oy] = offsets[i];
      const cx = base.x + ox, cy = base.y + oy;
      const sway = Math.sin(time * 3 + i * 1.3) * (stage === 2 ? 1.4 : 0.8);

      if (stage === 0) {
        ctx.fillStyle = '#4a8c32';
        ctx.fillRect(cx - 1, cy - 2, 2, 3);
        ctx.fillRect(cx + 2, cy - 1, 1, 2);
      } else if (stage === 1) {
        ctx.strokeStyle = '#68a838';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx + sway, cy - 5);
        ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 2 + sway, cy - 6);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#e5b338';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx + sway, cy - 7);
        ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + 3 + sway, cy - 8);
        ctx.stroke();
        ctx.fillStyle = '#f7d056';
        ctx.fillRect(cx + sway - 1, cy - 8, 2, 3);
        ctx.fillRect(cx + 3 + sway - 1, cy - 9, 2, 3);
      }
    }
    ctx.restore();
  }

  _drawBuildingNightLights(ctx, b, bottom, factor) {
    ctx.save();
    const time = this.game.time || 0;
    const flicker = 0.85 + Math.sin(time * 8 + b.id * 3) * 0.15;
    const a = (0.9 * factor * flicker).toFixed(3);

    if (b.type === 'hq') {
      ctx.fillStyle = `rgba(255, 215, 95, ${a})`;
      ctx.fillRect(bottom.x - 14, bottom.y - 65, 4, 7);
      ctx.fillRect(bottom.x + 10, bottom.y - 65, 4, 7);
      // Torches at gate
      ctx.fillStyle = `rgba(255, 140, 35, ${a})`;
      ctx.fillRect(bottom.x - 9, bottom.y - 23, 2, 3);
      ctx.fillRect(bottom.x + 9, bottom.y - 23, 2, 3);
      ctx.fillStyle = `rgba(255, 180, 50, ${(0.25 * factor).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(bottom.x, bottom.y - 20, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
    } else if (b.type === 'hut') {
      ctx.fillStyle = `rgba(255, 215, 95, ${a})`;
      ctx.fillRect(bottom.x + 12, bottom.y - 25, 5, 5);
      ctx.fillStyle = `rgba(255, 180, 50, ${(0.22 * factor).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(bottom.x + 14, bottom.y - 22, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
    } else if (b.type === 'tower') {
      ctx.fillStyle = `rgba(255, 180, 45, ${a})`;
      ctx.fillRect(bottom.x - 16, bottom.y - 65, 4, 4);
      ctx.fillRect(bottom.x + 21, bottom.y - 51, 3, 3);
      ctx.fillStyle = `rgba(255, 140, 30, ${(0.35 * factor).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(bottom.x - 14, bottom.y - 63, 8, 8, 0, 0, Math.PI * 2); ctx.fill();
    } else if (['smith', 'smelter', 'bakery'].includes(b.type)) {
      ctx.fillStyle = `rgba(255, 140, 35, ${a})`;
      ctx.fillRect(bottom.x - 4, bottom.y - 14, 8, 8);
      ctx.fillStyle = `rgba(255, 130, 30, ${(0.35 * factor).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(bottom.x, bottom.y - 8, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  _drawProspectSign(ctx, it) {
    const c = this.project(it.tx + 0.5, it.ty + 0.5);
    const fy = c.y + HH;

    ctx.save();
    this._shadow(ctx, c.x, fy, 4, 2, 0.25);
    ctx.fillStyle = '#4a301a';
    ctx.fillRect(c.x - 1, fy - 14, 2, 14);

    const isIron = it.vein === 1;
    ctx.fillStyle = isIron ? '#717882' : '#2b2c30';
    ctx.fillRect(c.x - 6, fy - 18, 12, 8);
    ctx.strokeStyle = isIron ? '#c8d0da' : '#646870';
    ctx.lineWidth = 1;
    ctx.strokeRect(c.x - 6, fy - 18, 12, 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isIron ? 'Fe' : 'C', c.x, fy - 14);
    ctx.restore();
  }

  // ---------------------------------------------------------------- minimap
  /** Minimap is a rotated (isometric) diamond of the island. */
  drawMinimap(mc) {
    const world = this.game.world; if (!world) return;
    const m = mc.getContext('2d'), mw = mc.width, mh = mc.height, W = world.w, H = world.h;
    m.fillStyle = '#10243a'; m.fillRect(0, 0, mw, mh);
    const s = Math.min(mw / (W + H), mh / ((W + H) / 2)); // px per half-diagonal
    const ox = mw / 2, oy = (mh - (W + H) * s / 2) / 2;
    const P = (u, v) => [ox + (u - v) * s, oy + (u + v) * s / 2];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = world.terrain[y * W + x]; if (t === T.DEEP) continue;
      const [px, py] = P(x, y); m.fillStyle = MINIMAP_COLOR[t] ?? '#588c42';
      m.fillRect(Math.floor(px - s), Math.floor(py), Math.ceil(s * 2), Math.max(1, Math.ceil(s)));
      if (this.game.territory && this.game.territory[y * W + x]) { m.fillStyle = 'rgba(255,214,90,0.28)'; m.fillRect(Math.floor(px - s), Math.floor(py), Math.ceil(s * 2), Math.max(1, Math.ceil(s))); }
    }
    for (const b of this.game.buildings) {
      const d = BUILDINGS[b.type]; const [px, py] = P(b.x + (d?.size[0] ?? 2) / 2, b.y + (d?.size[1] ?? 2) / 2);
      m.fillStyle = b.type === 'hq' ? '#fff' : '#d97a2a'; m.fillRect(Math.round(px - 1.5), Math.round(py - 1.5), 3, 3);
    }
    m.fillStyle = '#7ec8ff'; for (const st of this.game.settlers) { const [px, py] = P(st.x + 0.5, st.y + 0.5); m.fillRect(Math.round(px), Math.round(py), 1, 1); }
    m.strokeStyle = '#fff'; m.lineWidth = 1; m.beginPath();
    [[0, 0], [this._cw, 0], [this._cw, this._ch], [0, this._ch]].forEach(([sx, sy], i) => {
      const wp = this.screenToWorld(sx, sy), { u, v } = this.unproject(wp.x, wp.y), [px, py] = P(u, v);
      i ? m.lineTo(px, py) : m.moveTo(px, py);
    });
    m.closePath(); m.stroke();
    mc._iso = { ox, oy, s };
  }

  /** Centre the camera on the minimap click (client coords). */
  minimapToWorld(clientX, clientY, mc) {
    const r = mc.getBoundingClientRect(), iso = mc._iso; if (!iso || !this.game.world) return;
    const px = (clientX - r.left) / r.width * mc.width, py = (clientY - r.top) / r.height * mc.height;
    const a = (px - iso.ox) / iso.s, b = (py - iso.oy) / (iso.s / 2);
    this.centerOnTile((a + b) / 2 - 0.5, (b - a) / 2 - 0.5);
  }
}
