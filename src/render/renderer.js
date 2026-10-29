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
      if (b.state === 'active' && b.working && Math.random() < dt * 2.2) {
        const def = BUILDINGS[b.type]; if (!def) continue;
        const p = this.project(b.x + def.size[0] / 2, b.y + def.size[1] / 2);
        this.particles.push({ x: p.x + (Math.random() - 0.5) * 6, y: p.y - 22, vx: 3 + Math.random() * 3, vy: -9 - Math.random() * 5, life: 1, maxLife: 1.4 + Math.random() * 0.6 });
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
          if (sp.has('iso_tile_road')) sp.draw(ctx, 'iso_tile_road', p.x - HW, p.y);
          else { ctx.fillStyle = '#9c7853'; this._diamond(ctx, tx, ty, 1.5); ctx.fill(); }
        }
      }
    }
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
      else if (it.kind === 'building') this._drawBuilding(ctx, it.b, it.d);
      else this._drawSettler(ctx, it.s);
    }
    for (const p of this.particles) { ctx.fillStyle = `rgba(225,225,230,${Math.max(0, p.life) * 0.6})`; const r = 2 + (1 - p.life) * 3; ctx.fillRect(Math.round(p.x - r / 2), Math.round(p.y - r / 2), Math.ceil(r), Math.ceil(r)); }
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
    const c = ((this.game.time || 0) % 240) / 240; // matches sim awareness: night after 0.75
    let a = 0;
    if (c > 0.75) a = Math.min(0.32, (c - 0.75) / 0.06 * 0.32) * (c > 0.94 ? Math.max(0, (1 - c) / 0.06) : 1);
    if (a > 0.01) { ctx.fillStyle = `rgba(14,20,56,${a.toFixed(3)})`; ctx.fillRect(0, 0, w, h); }
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
