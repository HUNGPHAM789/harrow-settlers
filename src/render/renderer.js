/**
 * Harrow Settlers - Renderer
 * Handles high-performance Canvas2D rendering with chunked terrain caching,
 * Y-sorted entity drawing, smooth camera, and particle systems.
 */

import { TILE, T, BUILDINGS, GOODS } from '../sim/defs.js';
import { terrainSprite, settlerSprite } from './sprites.js';

const CHUNK_SIZE = 16; // tiles per chunk side
const MAX_PARTICLES = 200;
const MAX_RENDERABLES = 5000;

export class Renderer {
  constructor(canvas, game, sprites) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.game = game;
    this.sprites = sprites;

    // Camera state
    this.camX = game.world.start.x + 1.5;
    this.camY = game.world.start.y + 1.5;
    this.zoom = 2.0;
    this.targetZoom = 2.0;
    this.rect = canvas.getBoundingClientRect();

    // Interaction state
    this.ghost = null; // { type, x, y }
    this.selectedId = null;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    // Chunk cache
    this.chunkW = Math.ceil(game.world.w / CHUNK_SIZE);
    this.chunkH = Math.ceil(game.world.h / CHUNK_SIZE);
    this.chunks = new Array(this.chunkW * this.chunkH).fill(null).map(() => ({
      canvas: document.createElement('canvas'),
      dirty: true
    }));
    this.chunks.forEach(c => {
      c.canvas.width = CHUNK_SIZE * TILE;
      c.canvas.height = CHUNK_SIZE * TILE;
      c.ctx = c.canvas.getContext('2d', { alpha: false });
    });

    // Particle system (circular buffer)
    this.particles = new Array(MAX_PARTICLES).fill(0).map(() => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0
    }));
    this.nextParticle = 0;

    // Renderable pool for Y-sorting to avoid GC
    this.renderPool = new Array(MAX_RENDERABLES).fill(0).map(() => ({
      y: 0, fn: null
    }));
    this.renderCount = 0;

    this._setupEvents();
    this.resize();
  }

  _setupEvents() {
    window.addEventListener('resize', () => this.resize());
    
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && !e.shiftKey)) {
        this.isDragging = true;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = (e.clientX - this.lastMouse.x) / (this.zoom * TILE);
        const dy = (e.clientY - this.lastMouse.y) / (this.zoom * TILE);
        this.camX -= dx;
        this.camY -= dy;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      this.targetZoom = Math.max(1, Math.min(4, this.targetZoom + delta));
    }, { passive: false });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.rect = this.canvas.getBoundingClientRect();
    this.ctx.imageSmoothingEnabled = false;
  }

  setGhost(type, x, y) {
    if (!type) this.ghost = null;
    else this.ghost = { type, x, y };
  }

  setSelected(id) {
    this.selectedId = id;
  }

  screenToTile(sx, sy) {
    const dpr = window.devicePixelRatio || 1;
    const x = (sx * dpr - this.canvas.width / 2) / (this.zoom * TILE) + this.camX;
    const y = (sy * dpr - this.canvas.height / 2) / (this.zoom * TILE) + this.camY;
    return { x: Math.floor(x), y: Math.floor(y) };
  }

  tileToScreen(tx, ty) {
    const dpr = window.devicePixelRatio || 1;
    const sx = (tx - this.camX) * (this.zoom * TILE) + this.canvas.width / 2;
    const sy = (ty - this.camY) * (this.zoom * TILE) + this.canvas.height / 2;
    return { x: sx / dpr, y: sy / dpr };
  }

  spawnSmoke(x, y) {
    const p = this.particles[this.nextParticle];
    p.x = x + 0.5 + (Math.random() - 0.5) * 0.2;
    p.y = y + 0.2;
    p.vx = (Math.random() - 0.5) * 0.01;
    p.vy = -0.02 - Math.random() * 0.02;
    p.life = p.maxLife = 1.0 + Math.random();
    p.size = 2 + Math.random() * 3;
    this.nextParticle = (this.nextParticle + 1) % MAX_PARTICLES;
  }

  update(dt) {
    // Smooth zoom
    this.zoom += (this.targetZoom - this.zoom) * 0.15;

    // Update particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (p.life > 0) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
      }
    }

    // Smoke from active buildings
    for (const b of this.game.buildings) {
      if (b.working && Math.random() < dt * 2) {
        this.spawnSmoke(b.x + (BUILDINGS[b.type].size[0]/2 - 0.5), b.y);
      }
    }

    // Clamp camera
    const margin = 5;
    this.camX = Math.max(margin, Math.min(this.game.world.w - margin, this.camX));
    this.camY = Math.max(margin, Math.min(this.game.world.h - margin, this.camY));
  }

  _drawChunk(cx, cy) {
    const chunk = this.chunks[cy * this.chunkW + cx];
    const ctx = chunk.ctx;
    const world = this.game.world;
    const ox = cx * CHUNK_SIZE;
    const oy = cy * CHUNK_SIZE;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CHUNK_SIZE * TILE, CHUNK_SIZE * TILE);

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const tx = ox + x;
        const ty = oy + y;
        if (tx >= world.w || ty >= world.h) continue;

        const idx = ty * world.w + tx;
        const type = world.terrain[idx];
        
        // Base terrain
        const sName = terrainSprite(type, tx, ty);
        this.sprites.draw(ctx, sName, x * TILE, y * TILE);

        // Decoration
        if (world.deco[idx] > 0) {
          this.sprites.draw(ctx, `deco_${world.deco[idx]}`, x * TILE, y * TILE);
        }

        // Roads
        if (this.game.roads[idx]) {
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }

        // Territory
        if (this.game.territory[idx]) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }
    chunk.dirty = false;
  }

  render() {
    const { ctx, canvas, game, sprites } = this;
    const world = game.world;

    ctx.save();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Camera transform
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.camX * TILE, -this.camY * TILE);

    // Frustum
    const viewW = canvas.width / this.zoom;
    const viewH = canvas.height / this.zoom;
    const x0 = Math.floor(this.camX - viewW / (2 * TILE)) - 1;
    const y0 = Math.floor(this.camY - viewH / (2 * TILE)) - 1;
    const x1 = Math.ceil(this.camX + viewW / (2 * TILE)) + 1;
    const y1 = Math.ceil(this.camY + viewH / (2 * TILE)) + 1;

    // 1. Draw Chunks
    const cx0 = Math.max(0, Math.floor(x0 / CHUNK_SIZE));
    const cy0 = Math.max(0, Math.floor(y0 / CHUNK_SIZE));
    const cx1 = Math.min(this.chunkW - 1, Math.floor(x1 / CHUNK_SIZE));
    const cy1 = Math.min(this.chunkH - 1, Math.floor(y1 / CHUNK_SIZE));

    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        const chunk = this.chunks[cy * this.chunkW + cx];
        if (chunk.dirty) this._drawChunk(cx, cy);
        ctx.drawImage(chunk.canvas, cx * CHUNK_SIZE * TILE, cy * CHUNK_SIZE * TILE);
      }
    }

    // 2. Draw Territory Border (animated dashed)
    this._drawTerritoryBorders(ctx, x0, y0, x1, y1);

    // 3. Collect & Sort Entities
    this.renderCount = 0;
    const waterFrame = Math.floor(game.time * 2) % 2;

    for (let y = Math.max(0, y0); y <= Math.min(world.h - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(world.w - 1, x1); x++) {
        const i = y * world.w + x;
        
        // Water animation
        if (world.terrain[i] === T.WATER || world.terrain[i] === T.DEEP) {
          const s = waterFrame === 0 ? 'tile_water' : 'tile_water_2';
          this._pushRenderable(y, (c) => sprites.draw(c, s, x * TILE, y * TILE));
        }

        // Resources
        if (world.tree[i] === 1) {
          this._pushRenderable(y + 0.8, (c) => sprites.draw(c, 'sapling', x * TILE, y * TILE));
        } else if (world.tree[i] === 2) {
          const variant = (x * 7 + y * 3) % 3 + 1;
          this._pushRenderable(y + 0.9, (c) => sprites.draw(c, `tree_${variant}`, x * TILE, (y - 1) * TILE));
        }
        if (world.rock[i] > 0) {
          const variant = (x * 13 + y * 5) % 2 + 1;
          this._pushRenderable(y + 0.5, (c) => sprites.draw(c, `rock_${variant}`, x * TILE, y * TILE));
        }
      }
    }

    // Buildings
    for (const b of game.buildings) {
      const def = BUILDINGS[b.type];
      if (b.x + def.size[0] < x0 || b.x > x1 || b.y + def.size[1] < y0 || b.y > y1) continue;

      this._pushRenderable(b.y + def.size[1], (c) => {
        const sName = b.state === 'building' ? `b_${b.type}_scaffold` : `b_${b.type}`;
        sprites.draw(c, sName, b.x * TILE, (b.y + def.size[1]) * TILE - sprites.size(sName).h);
        
        if (b.state === 'building') {
          this._drawProgressBar(c, b.x * TILE + 4, b.y * TILE, def.size[0] * TILE - 8, b.progress);
        }
        if (b.id === this.selectedId) {
          this._drawSelection(c, b.x, b.y, def.size[0], def.size[1]);
        }
      });
    }

    // Settlers
    const walkFrame = Math.floor(game.time * 8) % 4;
    for (const s of game.settlers) {
      if (s.x < x0 || s.x > x1 || s.y < y0 || s.y > y1) continue;
      this._pushRenderable(s.y, (c) => {
        const sName = settlerSprite(s.role, s.dir, walkFrame);
        sprites.draw(c, sName, s.x * TILE - 6, s.y * TILE - 14);
        if (s.carry) {
          sprites.draw(c, `carry_${s.carry}`, s.x * TILE - 4, s.y * TILE - 24);
        }
      });
    }

    // Ghost
    if (this.ghost && this.ghost.type) {
      const def = BUILDINGS[this.ghost.type];
      const can = game.canPlace(this.ghost.type, this.ghost.x, this.ghost.y);
      this._pushRenderable(this.ghost.y + def.size[1], (c) => {
        c.globalAlpha = 0.6;
        const sName = `b_${this.ghost.type}`;
        sprites.draw(c, sName, this.ghost.x * TILE, (this.ghost.y + def.size[1]) * TILE - sprites.size(sName).h, {
          tint: can.ok ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)'
        });
        c.globalAlpha = 1.0;
      });
    }

    // Particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (p.life > 0) {
        this._pushRenderable(p.y, (c) => {
          c.fillStyle = `rgba(200,200,200,${p.life / p.maxLife * 0.5})`;
          c.beginPath();
          c.arc(p.x * TILE, p.y * TILE, p.size, 0, Math.PI * 2);
          c.fill();
        });
      }
    }

    // Sort and Draw
    const list = this.renderPool.slice(0, this.renderCount);
    list.sort((a, b) => a.y - b.y);
    for (let i = 0; i < list.length; i++) {
      list[i].fn(ctx);
    }

    ctx.restore();

    // 4. Day/Night Cycle Overlay
    this._drawDayNight(ctx);
  }

  _pushRenderable(y, fn) {
    if (this.renderCount >= MAX_RENDERABLES) return;
    const r = this.renderPool[this.renderCount++];
    r.y = y;
    r.fn = fn;
  }

  _drawProgressBar(ctx, x, y, w, progress) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y - 6, w, 4);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x + 1, y - 5, (w - 2) * progress, 2);
  }

  _drawSelection(ctx, tx, ty, tw, th) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx * TILE + 0.5, ty * TILE + 0.5, tw * TILE - 1, th * TILE - 1);
  }

  _drawTerritoryBorders(ctx, x0, y0, x1, y1) {
    const world = this.game.world;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -this.game.time * 15;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let y = Math.max(0, y0); y <= Math.min(world.h - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(world.w - 1, x1); x++) {
        const i = y * world.w + x;
        if (!this.game.territory[i]) continue;

        // Check neighbors to draw edges
        if (x === 0 || !this.game.territory[i - 1]) {
          ctx.moveTo(x * TILE, y * TILE);
          ctx.lineTo(x * TILE, (y + 1) * TILE);
        }
        if (x === world.w - 1 || !this.game.territory[i + 1]) {
          ctx.moveTo((x + 1) * TILE, y * TILE);
          ctx.lineTo((x + 1) * TILE, (y + 1) * TILE);
        }
        if (y === 0 || !this.game.territory[i - world.w]) {
          ctx.moveTo(x * TILE, y * TILE);
          ctx.lineTo((x + 1) * TILE, y * TILE);
        }
        if (y === world.h - 1 || !this.game.territory[i + world.w]) {
          ctx.moveTo(x * TILE, (y + 1) * TILE);
          ctx.lineTo((x + 1) * TILE, (y + 1) * TILE);
        }
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawDayNight(ctx) {
    // Cycle every 10 mins (600s). Night is 2 mins.
    const cycle = 600;
    const time = this.game.time % cycle;
    let alpha = 0;
    let color = '0,0,50';

    if (time > 400 && time < 450) alpha = (time - 400) / 50 * 0.3; // Sunset
    else if (time >= 450 && time <= 550) alpha = 0.3; // Night
    else if (time > 550 && time < 600) alpha = (1 - (time - 550) / 50) * 0.3; // Sunrise

    if (alpha > 0) {
      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawMinimap(mCanvas) {
    const mCtx = mCanvas.getContext('2d');
    const world = this.game.world;
    const scale = mCanvas.width / world.w;
    
    mCtx.fillStyle = '#000';
    mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);

    const colors = ['#004', '#008', '#da2', '#4a2', '#262', '#666', '#888', '#fff'];
    for (let y = 0; y < world.h; y++) {
      for (let x = 0; x < world.w; x++) {
        const i = y * world.w + x;
        mCtx.fillStyle = colors[world.terrain[i]];
        mCtx.fillRect(x * scale, y * scale, scale, scale);
        
        if (this.game.territory[i]) {
          mCtx.fillStyle = 'rgba(255,255,255,0.2)';
          mCtx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    // Buildings
    mCtx.fillStyle = '#f0f';
    for (const b of this.game.buildings) {
      const def = BUILDINGS[b.type];
      mCtx.fillRect(b.x * scale, b.y * scale, def.size[0] * scale, def.size[1] * scale);
    }

    // Camera rect
    const viewW = (this.canvas.width / this.zoom) / TILE;
    const viewH = (this.canvas.height / this.zoom) / TILE;
    mCtx.strokeStyle = '#fff';
    mCtx.lineWidth = 1;
    mCtx.strokeRect(
      (this.camX - viewW / 2) * scale,
      (this.camY - viewH / 2) * scale,
      viewW * scale,
      viewH * scale
    );
  }

  minimapToWorld(mx, my, mCanvas) {
    const scale = mCanvas.width / this.game.world.w;
    return {
      x: mx / scale,
      y: my / scale
    };
  }

  markDirty(tx, ty) {
    const cx = Math.floor(tx / CHUNK_SIZE);
    const cy = Math.floor(ty / CHUNK_SIZE);
    if (cx >= 0 && cx < this.chunkW && cy >= 0 && cy < this.chunkH) {
      this.chunks[cy * this.chunkW + cx].dirty = true;
    }
  }

  markAllDirty() {
    this.chunks.forEach(c => c.dirty = true);
  }
}
