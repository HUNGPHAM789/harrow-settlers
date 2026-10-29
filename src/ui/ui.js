// src/ui/ui.js - Complete UI implementation for Harrow Settlers

import { BUILDINGS, BUILD_ORDER, GOODS } from '../sim/defs.js';

export class UI {
  constructor(root, game, renderer, callbacks = {}) {
    this.root = root;
    this.game = game;
    this.renderer = renderer;
    this.onNewGame = callbacks.onNewGame || (() => {});
    this.onToggleMute = callbacks.onToggleMute || (() => {});

    // State properties required by ARCH
    this.tool = null; // null | 'road' | 'demolish' | { build: type }
    
    // UI internal states
    this.selectedCategory = 'Resources';
    this.selectedBuildingId = null;
    this.prevStockCounts = {};
    this.toasts = [];
    this.isPausedMenuOpen = false;
    this.isVictoryModalOpen = false;
    this.muted = false;
    this.hoverTile = null;

    this.categories = {
      Resources: ['woodcutter', 'forester', 'quarry', 'sawmill', 'fisher'],
      Food: ['farm', 'mill', 'bakery'],
      Industry: ['mine', 'smelter', 'smith'],
      Civic: ['hut', 'tower', 'market', 'monument']
    };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.root.innerHTML = `
      <!-- Top HUD Bar -->
      <div class="hud-topbar">
        <div class="hud-stocks" id="hudStocks"></div>
        <div class="hud-stats">
          <div class="stat-group" title="Population / Housing">
            <span>👥</span> <span id="statPop">0</span>/<span id="statHousing">0</span>
          </div>
          <div class="stat-group" title="Food Production Rate">
            <span>🍞</span> <span id="statFoodRate">+0.0</span>/m
          </div>
          <div class="stat-group" title="Game Time">
            <span>⌛</span> <span id="statTime">00:00</span>
          </div>
        </div>
        <div class="hud-controls">
          <button class="pixel-btn" id="btnPause" title="Pause (Space)">⏸</button>
          <button class="pixel-btn" id="btnSpeed1" title="1x Speed">1x</button>
          <button class="pixel-btn" id="btnSpeed2" title="2x Speed">2x</button>
          <button class="pixel-btn" id="btnSpeed4" title="4x Speed">4x</button>
          <button class="pixel-btn" id="btnMute" title="Mute Audio">🔊</button>
          <button class="pixel-btn" id="btnMenu" title="Menu (Esc)">⚙</button>
        </div>
      </div>

      <!-- Objective Tracker -->
      <div class="objective-tracker parchment-panel">
        <h4>Milestones <span id="objProgress">0/6</span></h4>
        <ul class="objective-list" id="objectiveList"></ul>
      </div>

      <!-- Minimap Container -->
      <div class="minimap-widget parchment-panel">
        <canvas class="minimap-canvas" id="minimapCanvas" width="130" height="130"></canvas>
      </div>

      <!-- Build Palette -->
      <div class="build-palette parchment-panel" id="buildPalette">
        <div class="build-categories" id="buildCategories">
          ${Object.keys(this.categories).map(cat => `
            <button class="pixel-btn ${cat === this.selectedCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
          `).join('')}
        </div>
        <div class="build-grid" id="buildGrid"></div>
        <div class="tool-actions">
          <button class="pixel-btn" id="toolRoad" title="Road Tool (R)">🛤 Road</button>
          <button class="pixel-btn" id="toolDemolish" title="Demolish Tool (D)">🔨 Demolish</button>
          <button class="pixel-btn" id="toolCancel" title="Cancel Tool (Esc)">✖ Clear</button>
        </div>
      </div>

      <!-- Building Info Panel -->
      <div class="building-info-panel parchment-panel" id="buildingInfoPanel">
        <h3><span id="infoTitle">Building</span> <button class="close-btn" id="infoClose">×</button></h3>
        <div class="info-section">
          <strong>Status:</strong> <span id="infoStatus">Active</span>
        </div>
        <div class="info-section" id="infoWorkersSection">
          <strong>Workers:</strong> <span id="infoWorkers">0/1</span>
        </div>
        <div class="info-section" id="infoInventorySection">
          <strong>Inventory:</strong> <div id="infoInventory">None</div>
        </div>
        <div class="info-section" id="infoProgressSection">
          <strong>Progress:</strong>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" id="infoProgressBar"></div>
          </div>
        </div>
        <div class="info-section">
          <button class="pixel-btn" id="infoDemolishBtn" style="width: 100%; background: #d47878;">Demolish Building</button>
        </div>
      </div>

      <!-- Toast Container -->
      <div class="toast-container" id="toastContainer"></div>

      <!-- Tooltip -->
      <div class="ui-tooltip" id="uiTooltip"></div>

      <!-- Placement Problem Hover Tooltip -->
      <div class="placement-reason-tooltip" id="placementReasonTooltip"></div>

      <!-- Pause Menu Modal -->
      <div class="modal-overlay" id="pauseModal">
        <div class="modal-content parchment-panel">
          <h2>Game Paused</h2>
          <div class="modal-buttons">
            <button class="pixel-btn" id="menuResume">Resume Game</button>
            <button class="pixel-btn" id="menuRestart">New Game</button>
            <button class="pixel-btn" id="menuMute">Toggle Mute</button>
          </div>
        </div>
      </div>

      <!-- Victory Modal -->
      <div class="modal-overlay" id="victoryModal">
        <div class="modal-content parchment-panel">
          <h2>Victory! Great Hall Raised</h2>
          <p id="victoryStatsText">You have successfully built the Great Hall and secured your settlement's legacy.</p>
          <div class="modal-buttons">
            <button class="pixel-btn" id="victoryRestart">Play Again</button>
          </div>
        </div>
      </div>
    `;

    this.cacheDOMRefs();
    this.renderBuildGrid();
    this.updateStockIconsDOM();
  }

  cacheDOMRefs() {
    this.hudStocks = this.root.querySelector('#hudStocks');
    this.statPop = this.root.querySelector('#statPop');
    this.statHousing = this.root.querySelector('#statHousing');
    this.statFoodRate = this.root.querySelector('#statFoodRate');
    this.statTime = this.root.querySelector('#statTime');
    this.btnPause = this.root.querySelector('#btnPause');
    this.btnSpeed1 = this.root.querySelector('#btnSpeed1');
    this.btnSpeed2 = this.root.querySelector('#btnSpeed2');
    this.btnSpeed4 = this.root.querySelector('#btnSpeed4');
    this.btnMute = this.root.querySelector('#btnMute');
    this.btnMenu = this.root.querySelector('#btnMenu');
    
    this.buildCategories = this.root.querySelector('#buildCategories');
    this.buildGrid = this.root.querySelector('#buildGrid');
    this.toolRoad = this.root.querySelector('#toolRoad');
    this.toolDemolish = this.root.querySelector('#toolDemolish');
    this.toolCancel = this.root.querySelector('#toolCancel');

    this.buildingInfoPanel = this.root.querySelector('#buildingInfoPanel');
    this.infoTitle = this.root.querySelector('#infoTitle');
    this.infoClose = this.root.querySelector('#infoClose');
    this.infoStatus = this.root.querySelector('#infoStatus');
    this.infoWorkers = this.root.querySelector('#infoWorkers');
    this.infoWorkersSection = this.root.querySelector('#infoWorkersSection');
    this.infoInventory = this.root.querySelector('#infoInventory');
    this.infoInventorySection = this.root.querySelector('#infoInventorySection');
    this.infoProgressSection = this.root.querySelector('#infoProgressSection');
    this.infoProgressBar = this.root.querySelector('#infoProgressBar');
    this.infoDemolishBtn = this.root.querySelector('#infoDemolishBtn');

    this.toastContainer = this.root.querySelector('#toastContainer');
    this.uiTooltip = this.root.querySelector('#uiTooltip');
    this.placementReasonTooltip = this.root.querySelector('#placementReasonTooltip');
    this.minimapCanvas = this.root.querySelector('#minimapCanvas');

    this.objectiveList = this.root.querySelector('#objectiveList');
    this.objProgress = this.root.querySelector('#objProgress');

    this.pauseModal = this.root.querySelector('#pauseModal');
    this.menuResume = this.root.querySelector('#menuResume');
    this.menuRestart = this.root.querySelector('#menuRestart');
    this.menuMute = this.root.querySelector('#menuMute');

    this.victoryModal = this.root.querySelector('#victoryModal');
    this.victoryStatsText = this.root.querySelector('#victoryStatsText');
    this.victoryRestart = this.root.querySelector('#victoryRestart');
  }

  bindEvents() {
    // Speed buttons
    this.btnPause.addEventListener('click', () => this.setGameSpeed(0));
    this.btnSpeed1.addEventListener('click', () => this.setGameSpeed(1));
    this.btnSpeed2.addEventListener('click', () => this.setGameSpeed(2));
    this.btnSpeed4.addEventListener('click', () => this.setGameSpeed(4));
    this.btnMute.addEventListener('click', () => this.toggleMute());
    this.btnMenu.addEventListener('click', () => this.togglePauseMenu(true));

    // Category tabs
    this.buildCategories.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.dataset.category) {
        this.selectedCategory = btn.dataset.category;
        this.buildCategories.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        this.renderBuildGrid();
      }
    });

    // Build tools & actions
    this.toolRoad.addEventListener('click', () => {
      this.tool = 'road';
      this.updateToolHighlight();
    });
    this.toolDemolish.addEventListener('click', () => {
      this.tool = 'demolish';
      this.updateToolHighlight();
    });
    this.toolCancel.addEventListener('click', () => {
      this.tool = null;
      this.selectedBuildingId = null;
      this.buildingInfoPanel.style.display = 'none';
      this.updateToolHighlight();
    });

    // Building info panel close & demolish
    this.infoClose.addEventListener('click', () => {
      this.selectedBuildingId = null;
      this.buildingInfoPanel.style.display = 'none';
    });
    this.infoDemolishBtn.addEventListener('click', () => {
      if (this.selectedBuildingId !== null) {
        this.game.demolish(this.selectedBuildingId);
        this.selectedBuildingId = null;
        this.buildingInfoPanel.style.display = 'none';
      }
    });

    // Pause menu & Victory modal buttons
    this.menuResume.addEventListener('click', () => this.togglePauseMenu(false));
    this.menuRestart.addEventListener('click', () => {
      this.togglePauseMenu(false);
      this.onNewGame();
    });
    this.menuMute.addEventListener('click', () => this.toggleMute());
    this.victoryRestart.addEventListener('click', () => {
      this.victoryModal.style.display = 'none';
      this.onNewGame();
    });

    // Hotkeys (1-9 for category buildings, R for road, D for demolish, Esc for cancel/menu, Space for pause)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (this.victoryModal.style.display === 'flex') return;
        if (this.pauseModal.style.display === 'flex') {
          this.togglePauseMenu(false);
        } else if (this.tool !== null || this.selectedBuildingId !== null) {
          this.tool = null;
          this.selectedBuildingId = null;
          this.buildingInfoPanel.style.display = 'none';
          this.updateToolHighlight();
        } else {
          this.togglePauseMenu(true);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (this.game.speed === 0) {
          this.setGameSpeed(1);
        } else {
          this.setGameSpeed(0);
        }
      } else if (e.key.toLowerCase() === 'r') {
        this.tool = 'road';
        this.updateToolHighlight();
      } else if (e.key.toLowerCase() === 'd') {
        this.tool = 'demolish';
        this.updateToolHighlight();
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const currentCategoryBuildings = this.categories[this.selectedCategory] || [];
        if (currentCategoryBuildings[index]) {
          const type = currentCategoryBuildings[index];
          this.tool = { build: type };
          this.updateToolHighlight();
        }
      }
    });

    // Minimap click navigation
    this.minimapCanvas.addEventListener('click', (e) => {
      if (this.renderer && this.renderer.minimapToWorld) this.renderer.minimapToWorld(e.clientX, e.clientY, this.minimapCanvas);
    });
  }

  setGameSpeed(speed) {
    this.game.speed = speed;
    this.btnPause.classList.toggle('active', speed === 0);
    this.btnSpeed1.classList.toggle('active', speed === 1);
    this.btnSpeed2.classList.toggle('active', speed === 2);
    this.btnSpeed4.classList.toggle('active', speed === 4);
    if (speed === 0 && this.game.stats.victory) {
      // Don't show pause menu if victory
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.btnMute.textContent = this.muted ? '🔇' : '🔊';
    this.menuMute.textContent = this.muted ? 'Unmute Audio' : 'Toggle Mute';
    this.onToggleMute(this.muted);
  }

  togglePauseMenu(show) {
    this.isPausedMenuOpen = show;
    this.pauseModal.style.display = show ? 'flex' : 'none';
    if (show && this.game.speed > 0) {
      this.prevSpeed = this.game.speed;
      this.setGameSpeed(0);
    } else if (!show && this.game.speed === 0 && this.prevSpeed) {
      this.setGameSpeed(this.prevSpeed);
    }
  }

  updateStockIconsDOM() {
    this.hudStocks.innerHTML = GOODS.map(good => `
      <div class="stock-item" id="stockItem_${good}" title="${good}">
        <img class="stock-icon" src="public/assets/sprites/carry_${good}.png" alt="${good}" onerror="this.style.display='none'">
        <span class="stock-count" id="stockCount_${good}">0</span>
      </div>
    `).join('');
  }

  renderBuildGrid() {
    const buildings = this.categories[this.selectedCategory] || [];
    this.buildGrid.innerHTML = buildings.map((type, idx) => {
      const def = BUILDINGS[type];
      if (!def) return '';
      const hotkey = idx < 9 ? idx + 1 : '';
      return `
        <button class="pixel-btn build-btn" data-build="${type}" title="${def.name}">
          <span class="hotkey">${hotkey}</span>
          <img src="public/assets/sprites/b_${type}.png" alt="${def.name}" onerror="this.style.display='none'">
        </button>
      `;
    }).join('');

    // Bind build button clicks & tooltips
    this.buildGrid.querySelectorAll('.build-btn').forEach(btn => {
      const type = btn.dataset.build;
      const def = BUILDINGS[type];

      btn.addEventListener('click', () => {
        this.tool = { build: type };
        this.updateToolHighlight();
      });

      btn.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, def);
      });

      btn.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });

    this.updateBuildGridAffordability();
  }

  updateBuildGridAffordability() {
    const stock = this.game.stock;
    this.buildGrid.querySelectorAll('.build-btn').forEach(btn => {
      const type = btn.dataset.build;
      const def = BUILDINGS[type];
      if (!def || !def.cost) return;

      let affordable = true;
      for (const [good, qty] of Object.entries(def.cost)) {
        if ((stock[good] || 0) < qty) {
          affordable = false;
          break;
        }
      }
      btn.classList.toggle('unaffordable', !affordable);
    });
  }

  updateToolHighlight() {
    this.toolRoad.classList.toggle('active', this.tool === 'road');
    this.toolDemolish.classList.toggle('active', this.tool === 'demolish');

    this.buildGrid.querySelectorAll('.build-btn').forEach(btn => {
      const type = btn.dataset.build;
      const isSelected = typeof this.tool === 'object' && this.tool !== null && this.tool.build === type;
      btn.classList.toggle('selected', isSelected);
    });
  }

  showTooltip(e, def) {
    const rect = e.target.getBoundingClientRect();
    let html = `<strong>${def.name}</strong>`;
    if (def.cost && Object.keys(def.cost).length > 0) {
      html += `<div class="cost-list">`;
      for (const [good, qty] of Object.entries(def.cost)) {
        const have = this.game.stock[good] || 0;
        const cls = have >= qty ? 'affordable' : 'unaffordable';
        html += `<span class="cost-item ${cls}">${good}: ${qty} (Have ${have})</span>`;
      }
      html += `</div>`;
    }
    if (def.pop) html += `<div>Housing: +${def.pop}</div>`;
    if (def.cycle) html += `<div>Cycle: ${def.cycle}s</div>`;
    if (def.needs) html += `<div>Needs: ${def.needs} nearby</div>`;

    this.uiTooltip.innerHTML = html;
    this.uiTooltip.style.display = 'block';
    this.uiTooltip.style.left = `${rect.left}px`;
    this.uiTooltip.style.top = `${rect.bottom + 4}px`;
  }

  hideTooltip() {
    this.uiTooltip.style.display = 'none';
  }

  handleCanvasClick(tx, ty, button) {
    if (button !== 0) return; // Only left click

    if (this.tool === 'road') {
      this.game.paintRoad(tx, ty, true);
    } else if (this.tool === 'demolish') {
      // Find building at tx, ty
      const b = this.game.buildings.find(b => {
        const def = BUILDINGS[b.type];
        if (!def) return false;
        const [w, h] = def.size;
        return tx >= b.x && tx < b.x + w && ty >= b.y && ty < b.y + h;
      });
      if (b) {
        this.game.demolish(b.id);
        if (this.selectedBuildingId === b.id) {
          this.selectedBuildingId = null;
          this.buildingInfoPanel.style.display = 'none';
        }
      } else {
        // Maybe remove road
        this.game.paintRoad(tx, ty, false);
      }
    } else if (this.tool && typeof this.tool === 'object' && this.tool.build) {
      const type = this.tool.build;
      const res = this.game.place(type, tx, ty);
      if (!res.ok) {
        this.game.events.push({ t: this.game.time, kind: 'warn', text: `Cannot place ${BUILDINGS[type]?.name || type}: ${res.reason || 'Invalid location'}` });
      }
    } else {
      // Select building or inspect tile
      const b = this.game.buildings.find(b => {
        const def = BUILDINGS[b.type];
        if (!def) return false;
        const [w, h] = def.size;
        return tx >= b.x && tx < b.x + w && ty >= b.y && ty < b.y + h;
      });
      if (b) {
        this.selectedBuildingId = b.id;
        this.updateBuildingInfoPanel();
        this.buildingInfoPanel.style.display = 'block';
      } else {
        this.selectedBuildingId = null;
        this.buildingInfoPanel.style.display = 'none';
      }
    }
  }

  handleHover(tx, ty) {
    this.hoverTile = { tx, ty };
    if (this.tool && typeof this.tool === 'object' && this.tool.build) {
      const type = this.tool.build;
      const check = this.game.canPlace(type, tx, ty);
      if (!check.ok && check.reason) {
        this.placementReasonTooltip.textContent = check.reason;
        this.placementReasonTooltip.style.display = 'block';
        // Position near mouse or tile
        if (this.renderer) {
          const screen = this.renderer.tileToScreen(tx, ty);
          this.placementReasonTooltip.style.left = `${screen.x + 24}px`;
          this.placementReasonTooltip.style.top = `${screen.y + 8}px`;
        }
        return;
      }
    }
    this.placementReasonTooltip.style.display = 'none';
  }

  drainEvents() {
    const events = this.game.drainEvents();
    for (const ev of events) {
      this.showToast(ev.text, ev.kind);
      if (ev.kind === 'victory') {
        this.showVictoryModal();
      }
    }
  }

  showToast(text, kind = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${kind}`;
    toast.textContent = text;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  showVictoryModal() {
    const stats = this.game.stats;
    const mins = Math.floor((stats.victoryTime || this.game.time) / 60);
    const secs = Math.floor((stats.victoryTime || this.game.time) % 60);
    this.victoryStatsText.innerHTML = `
      Great Hall successfully raised!<br>
      Time: ${mins}:${secs < 10 ? '0' : ''}${secs}<br>
      Final Population: ${stats.pop}<br>
      Buildings: ${this.game.buildings.length}
    `;
    this.victoryModal.style.display = 'flex';
  }

  updateBuildingInfoPanel() {
    if (this.selectedBuildingId === null) {
      this.buildingInfoPanel.style.display = 'none';
      return;
    }

    const b = this.game.buildings.find(item => item.id === this.selectedBuildingId);
    if (!b) {
      this.selectedBuildingId = null;
      this.buildingInfoPanel.style.display = 'none';
      return;
    }

    const def = BUILDINGS[b.type];
    this.infoTitle.textContent = def ? def.name : b.type;
    this.infoStatus.textContent = b.state.toUpperCase();

    // Workers
    if (def && def.jobs && def.jobs > 0) {
      this.infoWorkersSection.style.display = 'block';
      this.infoWorkers.textContent = `${b.workers ? b.workers.length : 0}/${def.jobs}`;
    } else {
      this.infoWorkersSection.style.display = 'none';
    }

    // Inventory & Out
    let invHtml = '';
    if (b.inv && Object.keys(b.inv).length > 0) {
      invHtml += 'In: ' + Object.entries(b.inv).map(([g, n]) => `${g}: ${n}`).join(', ') + '<br>';
    }
    if (b.out && Object.keys(b.out).length > 0) {
      invHtml += 'Out: ' + Object.entries(b.out).map(([g, n]) => `${g}: ${n}`).join(', ');
    }
    if (!invHtml) invHtml = 'None';
    this.infoInventory.innerHTML = invHtml;
    this.infoInventorySection.style.display = (b.inv || b.out) ? 'block' : 'none';

    // Progress
    if (b.state === 'building' || b.state === 'queued' || (def && def.cycle)) {
      this.infoProgressSection.style.display = 'block';
      let prog = 0;
      if (b.state === 'building') {
        prog = b.progress * 100;
      } else if (def && def.cycle) {
        prog = ((b.progress || 0) / def.cycle) * 100;
      }
      this.infoProgressBar.style.width = `${Math.min(100, Math.max(0, prog))}%`;
    } else {
      this.infoProgressSection.style.display = 'none';
    }
  }

  updateObjectives() {
    const stats = this.game.stats;
    const buildings = this.game.buildings;
    
    // Milestones check
    const milestones = [
      { id: 'hut', label: 'Build first Settler Hut', done: buildings.some(b => b.type === 'hut') },
      { id: 'sawmill', label: 'Build Sawmill (Planks)', done: buildings.some(b => b.type === 'sawmill') },
      { id: 'pop10', label: 'Reach 10 Population', done: stats.pop >= 10 },
      { id: 'bread', label: 'Produce Bread', done: (this.game.stock.bread || 0) > 0 },
      { id: 'iron', label: 'Produce Iron', done: (this.game.stock.iron || 0) > 0 },
      { id: 'monument', label: 'Raise the Great Hall', done: stats.victory || buildings.some(b => b.type === 'monument' && b.state === 'active') }
    ];

    const completedCount = milestones.filter(m => m.done).length;
    this.objProgress.textContent = `${completedCount}/${milestones.length}`;

    this.objectiveList.innerHTML = milestones.map(m => `
      <li class="objective-item ${m.done ? 'completed' : ''}">
        <span class="objective-checkbox"></span>
        <span>${m.label}</span>
      </li>
    `).join('');
  }

  update() {
    // Drain events from sim
    this.drainEvents();

    // Update stocks HUD with flash
    const stock = this.game.stock;
    for (const good of GOODS) {
      const countEl = this.root.querySelector(`#stockCount_${good}`);
      if (!countEl) continue;
      const currentVal = stock[good] || 0;
      const prevVal = this.prevStockCounts[good] ?? currentVal;

      if (currentVal !== prevVal) {
        countEl.textContent = currentVal;
        countEl.classList.remove('flash-up', 'flash-down');
        // Trigger reflow to restart animation
        void countEl.offsetWidth;
        countEl.classList.add(currentVal > prevVal ? 'flash-up' : 'flash-down');
      } else if (countEl.textContent !== String(currentVal)) {
        countEl.textContent = currentVal;
      }
      this.prevStockCounts[good] = currentVal;
    }

    // Update build affordability
    this.updateBuildGridAffordability();

    // Update Stats
    this.statPop.textContent = this.game.stats.pop;
    this.statHousing.textContent = this.game.stats.housing;
    
    const foodRate = (this.game.stats.foodPerMin || 0).toFixed(1);
    this.statFoodRate.textContent = (foodRate >= 0 ? '+' : '') + foodRate;
    this.statFoodRate.style.color = foodRate >= 0 ? '#55ff55' : '#ff5555';

    const simTime = Math.floor(this.game.time);
    const mins = Math.floor(simTime / 60);
    const secs = simTime % 60;
    this.statTime.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Update Building Info Panel if open
    if (this.selectedBuildingId !== null) {
      this.updateBuildingInfoPanel();
    }

    // Update Objectives Tracker
    this.updateObjectives();

    // Update Minimap
    if (this.renderer && typeof this.renderer.drawMinimap === 'function') {
      this.renderer.drawMinimap(this.minimapCanvas);
    }
  }
}
