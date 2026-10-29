import { GOODS, BUILDINGS, BUILD_ORDER } from '../sim/defs.js';

/**
 * UI Class manages the DOM-based HUD and menus.
 */
export class UI {
  constructor(root, game, renderer, { onNewGame, onToggleMute }) {
    this.root = root;
    this.game = game;
    this.renderer = renderer;
    this.onNewGame = onNewGame;
    this.onToggleMute = onToggleMute;

    this.tool = null; // null | 'road' | 'demolish' | {build: type}
    this.selectedBuilding = null;
    this.hoveredTile = null;
    this.activeCategory = 'Resources';
    this.lastStock = { ...game.stock };
    this.stockFlash = {}; // good -> 'pos'|'neg'|null

    this.categories = {
      Resources: ['woodcutter', 'forester', 'quarry', 'mine'],
      Food: ['fisher', 'farm', 'mill', 'bakery'],
      Industry: ['sawmill', 'smelter', 'smith'],
      Civic: ['hut', 'tower', 'market', 'monument']
    };

    this._initDOM();
    this._setupEvents();
  }

  _initDOM() {
    this.root.innerHTML = `
      <div class="top-bar">
        <div id="stock-list" style="display:flex; gap:10px;"></div>
        <div class="stats-group">
          <div id="stat-pop">Pop: 0/0</div>
          <div id="stat-food">Food: 0.0/m</div>
          <div id="stat-time">00:00</div>
          <div class="speed-controls">
            <button class="btn-speed" data-speed="0">II</button>
            <button class="btn-speed active" data-speed="1">1x</button>
            <button class="btn-speed" data-speed="2">2x</button>
            <button class="btn-speed" data-speed="4">4x</button>
          </div>
        </div>
      </div>

      <div class="objectives panel">
        <div style="font-weight:bold; margin-bottom:4px; border-bottom:1px solid">Objectives</div>
        <div id="obj-list"></div>
      </div>

      <div class="info-panel panel hidden" id="info-panel"></div>

      <div class="build-palette">
        <div class="palette-tabs" id="palette-tabs"></div>
        <div class="palette-content" id="palette-tools"></div>
      </div>

      <div class="minimap-container" id="minimap-container">
        <canvas id="minimap-canvas" width="128" height="128" style="width:100%; height:100%; image-rendering:pixelated;"></canvas>
      </div>

      <div class="toast-container" id="toast-container"></div>
      <div id="tooltip" class="tooltip hidden"></div>

      <div id="pause-menu" class="modal-overlay hidden">
        <div class="modal panel">
          <h2>Paused</h2>
          <div class="modal-btns">
            <button id="btn-resume">Resume</button>
            <button id="btn-restart">Restart Game</button>
            <button id="btn-mute">Toggle Mute</button>
          </div>
        </div>
      </div>

      <div id="victory-modal" class="modal-overlay hidden">
        <div class="modal panel">
          <h2>Victory!</h2>
          <p id="victory-stats"></p>
          <div class="modal-btns">
            <button id="btn-play-again">Play Again</button>
          </div>
        </div>
      </div>
    `;

    this._renderStockList();
    this._renderTabs();
    this._renderTools();
    this._renderObjectives();
  }

  _setupEvents() {
    // Speed buttons
    this.root.querySelectorAll('.btn-speed').forEach(btn => {
      btn.onclick = () => {
        this.game.speed = parseInt(btn.dataset.speed);
        this.root.querySelectorAll('.btn-speed').forEach(b => b.classList.toggle('active', b === btn));
      };
    });

    // Hotkeys
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.togglePause();
      if (e.key === 'r') this.setTool('road');
      if (e.key === 'd') this.setTool('demolish');
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        const tools = this.root.querySelectorAll('.tool-btn');
        if (tools[idx]) tools[idx].click();
      }
    });

    // Pause menu buttons
    this.root.querySelector('#btn-resume').onclick = () => this.togglePause();
    this.root.querySelector('#btn-restart').onclick = () => this.onNewGame();
    this.root.querySelector('#btn-mute').onclick = () => this.onToggleMute();
    this.root.querySelector('#btn-play-again').onclick = () => this.onNewGame();
  }

  update() {
    this._updateStock();
    this._updateStats();
    this._updateObjectives();
    this._updateInfoPanel();
    this._processEvents();
    this._updateTooltip();
    
    // Update minimap every few frames
    if (this.game.time % 1 < 0.1) {
      const mCanvas = this.root.querySelector('#minimap-canvas');
      this.renderer.drawMinimap(mCanvas);
    }

    if (this.game.stats.victory && this.root.querySelector('#victory-modal').classList.contains('hidden')) {
      this._showVictory();
    }
  }

  _renderStockList() {
    const list = this.root.querySelector('#stock-list');
    list.innerHTML = GOODS.map(g => `
      <div class="stock-item" id="stock-${g}" title="${g}">
        <img src="assets/sprites/carry_${g}.png" class="stock-icon" onerror="this.style.backgroundColor='#888'">
        <span class="stock-count">0</span>
      </div>
    `).join('');
  }

  _updateStock() {
    for (const g of GOODS) {
      const count = this.game.stock[g] || 0;
      const last = this.lastStock[g] || 0;
      const el = this.root.querySelector(`#stock-${g} .stock-count`);
      if (count !== last) {
        el.textContent = count;
        const flash = count > last ? 'flash-pos' : 'flash-neg';
        el.classList.remove('flash-pos', 'flash-neg');
        void el.offsetWidth; // trigger reflow
        el.classList.add(flash);
        this.lastStock[g] = count;
      }
    }
  }

  _updateStats() {
    const s = this.game.stats;
    this.root.querySelector('#stat-pop').textContent = `Pop: ${s.pop}/${s.housing}`;
    this.root.querySelector('#stat-food').textContent = `Food: ${s.foodPerMin.toFixed(1)}/m`;
    
    const sec = Math.floor(this.game.time);
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const sc = (sec % 60).toString().padStart(2, '0');
    this.root.querySelector('#stat-time').textContent = `${m}:${sc}`;
  }

  _renderTabs() {
    const tabs = this.root.querySelector('#palette-tabs');
    tabs.innerHTML = Object.keys(this.categories).map(cat => `
      <div class="tab-btn ${cat === this.activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</div>
    `).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeCategory = btn.dataset.cat;
        this._renderTabs();
        this._renderTools();
      };
    });
  }

  _renderTools() {
    const tools = this.root.querySelector('#palette-tools');
    let html = `
      <div class="tool-btn ${this.tool === 'road' ? 'active' : ''}" id="tool-road" title="Road (R)">
        <div class="tool-key">R</div>
        <div style="font-size:10px">ROAD</div>
      </div>
      <div class="tool-btn ${this.tool === 'demolish' ? 'active' : ''}" id="tool-demolish" title="Demolish (D)">
        <div class="tool-key">D</div>
        <div style="font-size:10px">DEMO</div>
      </div>
      <div style="width:2px; background:var(--border-dark); margin:0 4px;"></div>
    `;

    this.categories[this.activeCategory].forEach((type, i) => {
      const b = BUILDINGS[type];
      const active = this.tool?.build === type;
      html += `
        <div class="tool-btn ${active ? 'active' : ''}" data-type="${type}">
          <div class="tool-key">${i + 1}</div>
          <img src="assets/sprites/b_${type}.png" class="tool-icon" onerror="this.style.backgroundColor='#aaa'">
        </div>
      `;
    });

    tools.innerHTML = html;

    tools.querySelector('#tool-road').onclick = () => this.setTool('road');
    tools.querySelector('#tool-demolish').onclick = () => this.setTool('demolish');
    tools.querySelectorAll('[data-type]').forEach(btn => {
      btn.onclick = () => this.setTool({ build: btn.dataset.type });
      btn.onmouseenter = (e) => this._showCostTooltip(btn.dataset.type, e);
      btn.onmouseleave = () => this._hideTooltip();
    });
  }

  _showCostTooltip(type, e) {
    const b = BUILDINGS[type];
    const tt = this.root.querySelector('#tooltip');
    let costHtml = '';
    for (const [g, amt] of Object.entries(b.cost)) {
      const has = this.game.stock[g] || 0;
      costHtml += `<div class="cost-item ${has < amt ? 'poor' : ''}">${amt} ${g}</div>`;
    }
    tt.innerHTML = `<strong>${b.name}</strong><br>${b.jobs || 0} workers<br><div class="cost-row">${costHtml}</div>`;
    tt.classList.remove('hidden');
    tt.style.left = `${e.clientX}px`;
    tt.style.top = `${e.clientY - 60}px`;
  }

  _hideTooltip() {
    this.root.querySelector('#tooltip').classList.add('hidden');
  }

  setTool(tool) {
    if (JSON.stringify(this.tool) === JSON.stringify(tool)) {
      this.tool = null;
    } else {
      this.tool = tool;
      this.selectedBuilding = null;
    }
    this._renderTools();
    this.renderer.placementGhost = this.tool?.build ? { type: this.tool.build, x: 0, y: 0 } : null;
  }

  handleCanvasClick(tx, ty, button) {
    if (button !== 0) {
      this.setTool(null);
      return;
    }

    if (this.tool === 'road') {
      this.game.paintRoad(tx, ty, true);
    } else if (this.tool === 'demolish') {
      const b = this.game.buildings.find(b => 
        tx >= b.x && tx < b.x + BUILDINGS[b.type].size[0] &&
        ty >= b.y && ty < b.y + BUILDINGS[b.type].size[1]
      );
      if (b && b.type !== 'hq') this.game.demolish(b.id);
    } else if (this.tool?.build) {
      const res = this.game.place(this.tool.build, tx, ty);
      if (!res.ok) this.toast(res.reason, 'warn');
    } else {
      // Selection
      const b = this.game.buildings.find(b => 
        tx >= b.x && tx < b.x + BUILDINGS[b.type].size[0] &&
        ty >= b.y && ty < b.y + BUILDINGS[b.type].size[1]
      );
      this.selectedBuilding = b || null;
    }
  }

  handleHover(tx, ty) {
    this.hoveredTile = { tx, ty };
    if (this.renderer.placementGhost) {
      this.renderer.placementGhost.x = tx;
      this.renderer.placementGhost.y = ty;
    }
  }

  _updateTooltip() {
    const tt = this.root.querySelector('#tooltip');
    if (!this.hoveredTile || !this.tool?.build) {
      if (tt.innerHTML.includes('Cannot')) tt.classList.add('hidden');
      return;
    }
    const res = this.game.canPlace(this.tool.build, this.hoveredTile.tx, this.hoveredTile.ty);
    if (!res.ok) {
      tt.innerHTML = `<span style="color:#f55">Cannot place: ${res.reason}</span>`;
      tt.classList.remove('hidden');
      // Follow mouse roughly
      tt.style.left = `min(calc(100vw - 160px), ${this.renderer.mouseX + 15}px)`;
      tt.style.top = `${this.renderer.mouseY + 15}px`;
    } else {
      if (tt.innerHTML.includes('Cannot')) tt.classList.add('hidden');
    }
  }

  _updateInfoPanel() {
    const panel = this.root.querySelector('#info-panel');
    if (!this.selectedBuilding) {
      panel.classList.add('hidden');
      return;
    }

    const b = this.selectedBuilding;
    const def = BUILDINGS[b.type];
    const invStr = Object.entries(b.inv || {}).map(([g, n]) => `${n} ${g}`).join(', ') || 'empty';
    const outStr = Object.entries(b.out || {}).map(([g, n]) => `${n} ${g}`).join(', ') || 'empty';

    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div class="info-header">${def.name}</div>
      <div>Status: ${b.state}</div>
      <div>Workers: ${b.workers.length} / ${def.jobs || 0}</div>
      ${b.state === 'building' ? `
        <div class="progress-bar"><div class="progress-fill" style="width:${b.progress * 100}%"></div></div>
      ` : ''}
      ${b.state === 'active' && def.cycle ? `
        <div style="font-size:10px; margin-top:4px;">Production:</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${(b.cycleT / def.cycle) * 100}%"></div></div>
        <div style="font-size:10px">In: ${invStr}</div>
        <div style="font-size:10px">Out: ${outStr}</div>
      ` : ''}
      <div style="margin-top:8px">
        ${b.type !== 'hq' ? `<button id="btn-demo-sel" style="width:100%; font-size:10px">Demolish</button>` : ''}
        <button id="btn-close-sel" style="width:100%; font-size:10px; margin-top:2px">Close</button>
      </div>
    `;

    const btnDemo = panel.querySelector('#btn-demo-sel');
    if (btnDemo) btnDemo.onclick = () => { this.game.demolish(b.id); this.selectedBuilding = null; };
    panel.querySelector('#btn-close-sel').onclick = () => { this.selectedBuilding = null; };
  }

  _renderObjectives() {
    const milestones = [
      { id: 'hut', text: 'First Hut', check: () => this.game.buildings.some(b => b.type === 'hut' && b.state === 'active') },
      { id: 'sawmill', text: 'Sawmill Running', check: () => this.game.buildings.some(b => b.type === 'sawmill' && b.state === 'active') },
      { id: 'pop', text: '10 Population', check: () => this.game.stats.pop >= 10 },
      { id: 'bread', text: 'Produce Bread', check: () => (this.game.stats.produced.bread || 0) > 0 },
      { id: 'iron', text: 'Smelt Iron', check: () => (this.game.stats.produced.iron || 0) > 0 },
      { id: 'victory', text: 'The Great Hall', check: () => this.game.stats.victory }
    ];

    const list = this.root.querySelector('#obj-list');
    list.innerHTML = milestones.map(m => `
      <div class="obj-item">
        <div class="obj-check ${m.check() ? 'done' : ''}"></div>
        <div class="obj-text ${m.check() ? 'done' : ''}">${m.text}</div>
      </div>
    `).join('');
  }

  _updateObjectives() {
    // Only re-render every second or so
    if (Math.floor(this.game.time) % 2 === 0) this._renderObjectives();
  }

  _processEvents() {
    const events = this.game.drainEvents();
    for (const ev of events) {
      this.toast(ev.text, ev.kind);
    }
  }

  toast(text, kind = 'info') {
    const container = this.root.querySelector('#toast-container');
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  togglePause() {
    const menu = this.root.querySelector('#pause-menu');
    if (this.game.speed > 0) {
      this._prevSpeed = this.game.speed;
      this.game.speed = 0;
      menu.classList.remove('hidden');
    } else {
      this.game.speed = this._prevSpeed || 1;
      menu.classList.add('hidden');
    }
    // Sync speed buttons
    this.root.querySelectorAll('.btn-speed').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.speed) === this.game.speed);
    });
  }

  _showVictory() {
    const modal = this.root.querySelector('#victory-modal');
    const stats = this.root.querySelector('#victory-stats');
    const s = this.game.stats;
    const m = Math.floor(s.victoryTime / 60);
    const sc = Math.floor(s.victoryTime % 60);
    stats.innerHTML = `
      Time: ${m}m ${sc}s<br>
      Final Population: ${s.pop}<br>
      Buildings: ${this.game.buildings.length}
    `;
    modal.classList.remove('hidden');
  }
}
