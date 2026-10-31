// Harrow Settlers — Remade World: Living Bakery House Experience
// Authentic The Settlers II Solid Architecture, Purposeful Props & 12-Animation Work Loop

export class BakeryWorld {
  constructor(canvas, uiRoot) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.uiRoot = uiRoot;
    
    this.images = new Map();
    this.loaded = false;
    
    // Virtual resolution of the master Settlers scene
    this.stageW = 840;
    this.stageH = 520;
    
    // State machine
    this.currentBeat = 0;
    this.beatTime = 0;
    this.beatDuration = 2.0; // 2 seconds per animation beat
    this.isPlaying = true;
    this.speed = 1.0;
    this.totalBatches = 1;
    this.loavesBaked = 12;
    this.soundMuted = false;
    
    this.audioCtx = null;
    
    // 12-Beat Continuous Working Loop Chain
    this.beats = [
      { id: 'scoop', name: 'anim_chibi_baker_scoop', frames: 8, fw: 74, fh: 80, x: 355, y: 205, title: '01  SCOOP PURE WHEAT FLOUR', station: 'Flour Pantry', desc: 'Bending over oak barrel, scooping flour with wooden spade' },
      { id: 'pour', name: 'anim_chibi_baker_pour', frames: 8, fw: 74, fh: 80, x: 430, y: 210, title: '02  POUR SPRING WATER & MIX', station: 'Prep Bench', desc: 'Pouring fresh well water from terracotta pitcher into dough well' },
      { id: 'knead', name: 'anim_chibi_baker_knead', frames: 12, fw: 70, fh: 80, x: 430, y: 210, title: '03  KNEAD DOUGH (2-HANDED)', station: 'Kneading Table', desc: 'Vigorous 2-handed kneading with body lean & weight transfer' },
      { id: 'shape', name: 'anim_chibi_baker_shape', frames: 8, fw: 72, fh: 80, x: 430, y: 210, title: '04  SHAPE & SCORE ARTISAN LOAVES', station: 'Kneading Table', desc: 'Rolling boules and cutting diagonal baker slashes with lame' },
      { id: 'oven', name: 'anim_chibi_baker_oven', frames: 8, fw: 90, fh: 80, x: 500, y: 185, title: '05  PEEL STICK: LOAD INTO HEARTH', station: 'Stone Hearth', desc: 'Gripping long wooden peel stick, sliding raw loaves deep into glowing oven' },
      { id: 'sneeze', name: 'anim_chibi_baker_sneeze', frames: 10, fw: 76, fh: 80, x: 450, y: 225, title: '06  FLOUR-CLOUD SNEEZE (ACHOO!)', station: 'Workshop Floor', desc: 'Settlers comedy: Twitch windup, explosive flour puff, white-faced blink' },
      { id: 'peel_retrieve', name: 'anim_chibi_baker_peel_retrieve', frames: 8, fw: 92, fh: 80, x: 500, y: 185, title: '07  PEEL STICK: RETRIEVE HOT BREAD', station: 'Stone Hearth', desc: 'Reaching wooden stick into blazing embers, pulling out steaming hot loaves' },
      { id: 'aroma', name: 'anim_chibi_baker_aroma', frames: 8, fw: 78, fh: 80, x: 600, y: 200, title: '08  BREATHE IN FRESH BREAD AROMA', station: 'Cooling Rack', desc: 'Leaning over fresh bread, wafting steam with hands, blissful proud smile' },
      { id: 'carry', name: 'anim_chibi_baker_carry', frames: 8, fw: 68, fh: 80, x: 625, y: 235, title: '09  CARRY BASKET TO STOREFRONT', station: 'Courtyard Apron', desc: 'Bouncy delivery walk carrying brim-full wicker basket of loaves' },
      { id: 'serve', name: 'anim_chibi_baker_serve', frames: 8, fw: 74, fh: 80, x: 675, y: 250, title: '10  SERVE AT COUNTER & RING BELL', station: 'Shop Counter', desc: 'Placing basket on counter, tapping brass bell (DING!), greeting settlers' },
      { id: 'walk', name: 'anim_chibi_baker_walk', frames: 8, fw: 68, fh: 80, x: 520, y: 225, title: '11  RETURN TO WORKSHOP LANE', station: 'Atelier Corridor', desc: 'Striding back along stone apron to prepare the next batch' },
      { id: 'idle', name: 'anim_chibi_baker_idle', frames: 8, fw: 68, fh: 80, x: 440, y: 210, title: '12  READY FOR THE NEXT BATCH', station: 'Master Station', desc: 'Calm grounded breathing, dusting apron, adjusting toque' }
    ];
    
    // Props placed with ample breathing room across the sunlit terrace
    this.props = [
      { name: 'prop_bakery_flour_barrel_3q', x: 355, y: 235 },
      { name: 'prop_bakery_dough_table_3q', x: 425, y: 245 },
      { name: 'prop_bakery_peel_rack_3q', x: 395, y: 175 },
      { name: 'prop_bakery_hearth_3q', x: 515, y: 205 },
      { name: 'prop_bakery_cooling_rack_3q', x: 605, y: 225 },
      { name: 'prop_bakery_bread_basket_3q', x: 670, y: 290 },
      { name: 'prop_bakery_pretzel_sign_3q', x: 715, y: 205 },
      { name: 'prop_bakery_sparrow_3q', x: 380, y: 350 }
    ];
    
    this.init();
  }
  
  async init() {
    this.setupAudio();
    this.setupInput();
    await this.preloadAssets();
    this.buildHUD();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loaded = true;
  }
  
  setupAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
    }
  }
  
  playTone(freq, duration, type = 'sine', gainVal = 0.1) {
    if (this.soundMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {}
  }
  
  playSfx(kind) {
    if (kind === 'bell') {
      this.playTone(1560, 0.8, 'sine', 0.25);
      setTimeout(() => this.playTone(2340, 0.5, 'sine', 0.15), 50);
    } else if (kind === 'peel_slide') {
      this.playTone(180, 0.25, 'triangle', 0.15);
    } else if (kind === 'knead') {
      this.playTone(90, 0.15, 'triangle', 0.2);
    } else if (kind === 'sneeze') {
      this.playTone(320, 0.1, 'sawtooth', 0.25);
      setTimeout(() => this.playTone(120, 0.35, 'square', 0.2), 80);
    }
  }
  
  async preloadAssets() {
    const assetList = [
      'b_hd128_bakery_complete',
      'prop_bakery_hearth_3q',
      'prop_bakery_dough_table_3q',
      'prop_bakery_flour_barrel_3q',
      'prop_bakery_cooling_rack_3q',
      'prop_bakery_peel_rack_3q',
      'prop_bakery_bread_basket_3q',
      'prop_bakery_pretzel_sign_3q',
      'prop_bakery_sparrow_3q',
      'anim_chibi_baker_scoop',
      'anim_chibi_baker_pour',
      'anim_chibi_baker_knead',
      'anim_chibi_baker_shape',
      'anim_chibi_baker_oven',
      'anim_chibi_baker_sneeze',
      'anim_chibi_baker_peel_retrieve',
      'anim_chibi_baker_aroma',
      'anim_chibi_baker_carry',
      'anim_chibi_baker_serve',
      'anim_chibi_baker_walk',
      'anim_chibi_baker_idle'
    ];
    
    const promises = assetList.map(name => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = `public/assets/sprites/${name}.png`;
        img.onload = () => { this.images.set(name, img); resolve(); };
        img.onerror = () => { console.warn('Missing asset:', name); resolve(); };
      });
    });
    
    await Promise.all(promises);
  }
  
  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.isPlaying = !this.isPlaying;
        this.updateHUD();
      } else if (e.code === 'ArrowRight') {
        this.nextBeat();
      } else if (e.code === 'ArrowLeft') {
        this.prevBeat();
      } else if (e.key >= '1' && e.key <= '9') {
        this.jumpToBeat(parseInt(e.key, 10) - 1);
      } else if (e.key === '0') {
        this.jumpToBeat(9);
      } else if (e.key === '-') {
        this.jumpToBeat(10);
      } else if (e.key === '=') {
        this.jumpToBeat(11);
      }
    });
  }
  
  nextBeat() {
    this.currentBeat = (this.currentBeat + 1) % this.beats.length;
    this.beatTime = 0;
    if (this.currentBeat === 0) {
      this.totalBatches++;
      this.loavesBaked += 6;
    }
    this.triggerBeatSound(this.currentBeat);
    this.updateHUD();
  }
  
  prevBeat() {
    this.currentBeat = (this.currentBeat - 1 + this.beats.length) % this.beats.length;
    this.beatTime = 0;
    this.triggerBeatSound(this.currentBeat);
    this.updateHUD();
  }
  
  jumpToBeat(index) {
    if (index >= 0 && index < this.beats.length) {
      this.currentBeat = index;
      this.beatTime = 0;
      this.triggerBeatSound(this.currentBeat);
      this.updateHUD();
    }
  }
  
  triggerBeatSound(beatIdx) {
    if (beatIdx === 4 || beatIdx === 6) this.playSfx('peel_slide');
    else if (beatIdx === 2) this.playSfx('knead');
    else if (beatIdx === 5) this.playSfx('sneeze');
    else if (beatIdx === 9) this.playSfx('bell');
  }
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
  }
  
  update(dt) {
    if (!this.loaded) return;
    if (this.isPlaying) {
      this.beatTime += dt * this.speed;
      if (this.beatTime >= this.beatDuration) {
        this.beatTime = 0;
        this.nextBeat();
      }
    }
  }
  
  render() {
    if (!this.loaded) return;
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    // Calculate integer pixel scale and center
    const scaleX = cw / (this.stageW * dpr);
    const scaleY = ch / (this.stageH * dpr);
    const scale = Math.max(1, Math.min(scaleX, scaleY)) * dpr;
    
    const ox = Math.floor((cw - this.stageW * scale) / 2);
    const oy = Math.floor((ch - this.stageH * scale) / 2);
    
    // Clear letterbox borders
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, cw, ch);
    
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    
    // =========================================================================
    // 1. SKY & SUNNY SETTLERS II COUNTRYSIDE
    // =========================================================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 160);
    skyGrad.addColorStop(0, '#8ec8e8');
    skyGrad.addColorStop(1, '#dcecf5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.stageW, 160);
    
    // Distant forested rolling hills
    ctx.fillStyle = '#467332';
    ctx.beginPath();
    ctx.moveTo(0, 110); ctx.lineTo(160, 90); ctx.lineTo(320, 115); ctx.lineTo(500, 85);
    ctx.lineTo(680, 105); ctx.lineTo(this.stageW, 90); ctx.lineTo(this.stageW, 180); ctx.lineTo(0, 180);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#568a39';
    ctx.beginPath();
    ctx.moveTo(0, 130); ctx.lineTo(200, 110); ctx.lineTo(380, 132); ctx.lineTo(580, 108);
    ctx.lineTo(this.stageW, 125); ctx.lineTo(this.stageW, 190); ctx.lineTo(0, 190);
    ctx.closePath();
    ctx.fill();
    
    // Vibrant Green Meadow Ground
    ctx.fillStyle = '#629b35';
    ctx.fillRect(0, 160, this.stageW, this.stageH - 160);
    
    // Dandelions & lawn daisies
    ctx.fillStyle = '#f5d742';
    for (let gx = 10; gx < this.stageW; gx += 22) {
      for (let gy = 165; gy < this.stageH; gy += 18) {
        if ((gx * 3 + gy * 7) % 19 === 0) {
          ctx.fillRect(gx, gy, 2, 2);
        }
      }
    }
    
    // Cobblestone Village Road in foreground
    ctx.fillStyle = '#4c5261';
    ctx.beginPath();
    ctx.moveTo(0, 420); ctx.lineTo(200, 380); ctx.lineTo(440, 370); ctx.lineTo(660, 390);
    ctx.lineTo(this.stageW, 430); ctx.lineTo(this.stageW, this.stageH); ctx.lineTo(0, this.stageH);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#636c80';
    ctx.beginPath();
    ctx.moveTo(0, 424); ctx.lineTo(200, 384); ctx.lineTo(440, 374); ctx.lineTo(660, 394);
    ctx.lineTo(this.stageW, 434); ctx.lineTo(this.stageW, this.stageH - 4); ctx.lineTo(0, this.stageH - 4);
    ctx.closePath();
    ctx.fill();
    
    // =========================================================================
    // 2. RAISED STONE BAKERY TERRACE / WORK APRON
    // =========================================================================
    ctx.fillStyle = '#252a36';
    ctx.beginPath();
    ctx.moveTo(56, 320); ctx.lineTo(380, 176); ctx.lineTo(784, 320); ctx.lineTo(420, 404);
    ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = '#484f63';
    ctx.beginPath();
    ctx.moveTo(60, 318); ctx.lineTo(380, 180); ctx.lineTo(780, 318); ctx.lineTo(420, 400);
    ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = '#6b748f';
    ctx.beginPath();
    ctx.moveTo(64, 314); ctx.lineTo(380, 184); ctx.lineTo(776, 314); ctx.lineTo(420, 394);
    ctx.closePath(); ctx.fill();
    
    // Stone paving lines
    ctx.strokeStyle = '#565e70';
    ctx.lineWidth = 1;
    for (let lx = 90; lx < 750; lx += 45) {
      ctx.beginPath();
      ctx.moveTo(lx, 314 + (lx - 420) * 0.1);
      ctx.lineTo(lx + 60, 230 + (lx - 420) * 0.1);
      ctx.stroke();
    }
    for (let ly = 210; ly < 380; ly += 28) {
      ctx.beginPath();
      ctx.moveTo(120, ly);
      ctx.lineTo(720, ly + 20);
      ctx.stroke();
    }
    
    // Terrace stone curbing
    ctx.fillStyle = '#393e4d';
    ctx.beginPath();
    ctx.moveTo(60, 318); ctx.lineTo(420, 400); ctx.lineTo(420, 406); ctx.lineTo(60, 324);
    ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = '#2c303c';
    ctx.beginPath();
    ctx.moveTo(420, 400); ctx.lineTo(780, 318); ctx.lineTo(780, 324); ctx.lineTo(420, 406);
    ctx.closePath(); ctx.fill();
    
    // =========================================================================
    // 3. SOLID AUTHENTIC MEDIEVAL BAKERY HOUSE (b_hd128_bakery_complete)
    // =========================================================================
    const houseImg = this.images.get('b_hd128_bakery_complete');
    if (houseImg) {
      // Crop transparent margins: (58, 0, 329, 324)
      ctx.drawImage(houseImg, 58, 0, 271, 324, 60, 45, 271, 324);
    }
    
    // =========================================================================
    // 4. FUNCTIONAL PROPS PLACED IN DEDICATED WORK ZONES
    // =========================================================================
    for (const p of this.props) {
      const img = this.images.get(p.name);
      if (img) {
        ctx.drawImage(img, p.x, p.y);
      }
    }
    
    // Living Stone Hearth Embers Glow
    const now = performance.now();
    const flick = (Math.floor(now / 150) % 4) < 2;
    ctx.fillStyle = flick ? '#ffb438' : '#ed681f';
    ctx.beginPath();
    ctx.ellipse(542, 230, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // =========================================================================
    // 5. THE BAKERY CHEF & HIS WOODEN STICK (Current Animation)
    // =========================================================================
    const b = this.beats[this.currentBeat];
    const animImg = this.images.get(b.name);
    if (animImg) {
      const progress = Math.min(0.999, this.beatTime / this.beatDuration);
      const frameIdx = Math.floor(progress * b.frames);
      const sx = frameIdx * b.fw;
      ctx.drawImage(animImg, sx, 0, b.fw, b.fh, b.x, b.y, b.fw, b.fh);
    }
    
    // =========================================================================
    // 6. CLEAR ARCHITECTURAL ZONE SIGNPOSTS & LABELS
    // =========================================================================
    const stations = [
      { x: 380, y: 220, label: '1. FLOUR PANTRY', col: '#38bdf8' },
      { x: 460, y: 230, label: '2. KNEAD TABLE', col: '#facc15' },
      { x: 550, y: 195, label: '3. HEARTH OVEN', col: '#fb923c' },
      { x: 630, y: 215, label: '4. COOLING RACK', col: '#a3e635' },
      { x: 710, y: 280, label: '5. SHOP COUNTER', col: '#f43f5e' }
    ];
    
    ctx.font = 'bold 10px monospace';
    for (const s of stations) {
      const tw = ctx.measureText(s.label).width;
      ctx.fillStyle = '#161b26';
      ctx.fillRect(s.x - 4, s.y - 12, tw + 8, 16);
      ctx.strokeStyle = s.col;
      ctx.lineWidth = 1;
      ctx.strokeRect(s.x - 4, s.y - 12, tw + 8, 16);
      ctx.fillStyle = s.col;
      ctx.fillText(s.label, s.x, s.y);
    }
    
    ctx.restore();
  }
  
  buildHUD() {
    if (!this.uiRoot) return;
    this.uiRoot.innerHTML = `
      <style>
        .bakery-hud {
          position: fixed; inset: 0; pointer-events: none;
          display: flex; flex-direction: column; justify-content: space-between;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #f4ebd0; user-select: none; padding: 12px 18px;
        }
        .bakery-hud * { pointer-events: auto; }
        .hud-glass {
          background: rgba(22, 27, 38, 0.92);
          border: 2px solid #5a4230;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          border-radius: 8px; backdrop-filter: blur(8px);
        }
        .top-deck {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 18px;
        }
        .brand-title {
          font-size: 16px; font-weight: 800; color: #ffd36a;
          letter-spacing: 1.5px; text-shadow: 1px 2px 0 #3a1f0a;
        }
        .brand-sub { font-size: 11px; opacity: 0.85; color: #ded3b8; }
        .stats-badge {
          display: flex; gap: 14px; font-size: 12px; font-weight: 600;
        }
        .stat-item {
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,0,0,0.4); padding: 5px 12px; border-radius: 4px;
          border: 1px solid #4a3424;
        }
        .bottom-dock {
          display: flex; flex-direction: column; gap: 8px;
          padding: 12px 18px; align-self: center; max-width: 920px; width: 100%;
        }
        .step-info-bar {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 14px; font-weight: 700; color: #ffd36a;
        }
        .step-desc { font-size: 11px; color: #ded3b8; font-weight: 400; }
        .stage-buttons-row {
          display: grid; grid-template-columns: repeat(12, 1fr); gap: 5px;
        }
        .btn-stage {
          background: #232b38; border: 1px solid #4a3424; color: #ded3b8;
          font: inherit; font-size: 10px; font-weight: 700; padding: 6px 2px;
          text-align: center; border-radius: 4px; cursor: pointer; transition: all 0.15s;
        }
        .btn-stage:hover { background: #374256; color: #fff; border-color: #ffd36a; }
        .btn-stage.active {
          background: #ffd36a; color: #1b1420; border-color: #fff;
          box-shadow: 0 0 10px #ffd36a88;
        }
        .controls-row {
          display: flex; justify-content: space-between; align-items: center; margin-top: 4px;
        }
        .btn-ctrl {
          background: #3e2717; border: 1px solid #854d0e; color: #fef08a;
          font: inherit; font-size: 12px; font-weight: 700; padding: 6px 14px;
          border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;
        }
        .btn-ctrl:hover { background: #5c381f; color: #fff; }
      </style>
      <div class="bakery-hud">
        <div class="top-deck hud-glass">
          <div>
            <div class="brand-title">HARROW SETTLERS · MEDIEVAL BAKERY HOUSE</div>
            <div class="brand-sub">The Settlers II Authentic Architecture · Dedicated Work Zones · The Baker & His Wooden Stick</div>
          </div>
          <div class="stats-badge">
            <div class="stat-item">🍞 <span>Loaves Baked:</span> <b id="stat-loaves">12</b></div>
            <div class="stat-item">📦 <span>Batch:</span> <b id="stat-batches">1</b></div>
            <div class="stat-item">🔥 <span>Hearth:</span> <b style="color:#f97316">260°C</b></div>
          </div>
        </div>
        
        <div class="bottom-dock hud-glass">
          <div class="step-info-bar">
            <span id="hud-step-title">01  SCOOP PURE WHEAT FLOUR</span>
            <span class="step-desc" id="hud-step-desc">Flour Pantry: Bending over oak barrel, scooping flour with wooden spade</span>
          </div>
          
          <div class="stage-buttons-row" id="stage-buttons-container"></div>
          
          <div class="controls-row">
            <div style="display:flex; gap:6px;">
              <button class="btn-ctrl" id="btn-prev">◀ Prev</button>
              <button class="btn-ctrl" id="btn-play">⏸ Pause</button>
              <button class="btn-ctrl" id="btn-next">Next ▶</button>
            </div>
            
            <div style="display:flex; gap:6px;">
              <button class="btn-ctrl" id="btn-spd-05">0.5x</button>
              <button class="btn-ctrl" id="btn-spd-1" style="border-color:#ffd36a">1x</button>
              <button class="btn-ctrl" id="btn-spd-2">2x</button>
              <button class="btn-ctrl" id="btn-audio">🔊 Sound</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Build stage buttons 1..12
    const container = document.getElementById('stage-buttons-container');
    this.beats.forEach((b, idx) => {
      const btn = document.createElement('button');
      btn.className = `btn-stage ${idx === this.currentBeat ? 'active' : ''}`;
      btn.textContent = `${idx + 1}`;
      btn.title = b.title;
      btn.onclick = () => this.jumpToBeat(idx);
      container.appendChild(btn);
    });
    
    // Bind buttons
    document.getElementById('btn-play').onclick = () => {
      this.isPlaying = !this.isPlaying;
      document.getElementById('btn-play').textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    };
    document.getElementById('btn-prev').onclick = () => this.prevBeat();
    document.getElementById('btn-next').onclick = () => this.nextBeat();
    
    const setSpeed = (spd, btnId) => {
      this.speed = spd;
      ['btn-spd-05', 'btn-spd-1', 'btn-spd-2'].forEach(id => {
        document.getElementById(id).style.borderColor = (id === btnId) ? '#ffd36a' : '#854d0e';
      });
    };
    
    document.getElementById('btn-spd-05').onclick = () => setSpeed(0.5, 'btn-spd-05');
    document.getElementById('btn-spd-1').onclick = () => setSpeed(1.0, 'btn-spd-1');
    document.getElementById('btn-spd-2').onclick = () => setSpeed(2.0, 'btn-spd-2');
    
    document.getElementById('btn-audio').onclick = () => {
      this.soundMuted = !this.soundMuted;
      document.getElementById('btn-audio').textContent = this.soundMuted ? '🔇 Muted' : '🔊 Sound';
      if (!this.soundMuted) this.playTone(880, 0.1, 'sine', 0.1);
    };
  }
  
  updateHUD() {
    const b = this.beats[this.currentBeat];
    const titleEl = document.getElementById('hud-step-title');
    const descEl = document.getElementById('hud-step-desc');
    const loavesEl = document.getElementById('stat-loaves');
    const batchesEl = document.getElementById('stat-batches');
    const playBtn = document.getElementById('btn-play');
    
    if (titleEl) titleEl.textContent = b.title;
    if (descEl) descEl.textContent = `${b.station}: ${b.desc}`;
    if (loavesEl) loavesEl.textContent = `${this.loavesBaked}`;
    if (batchesEl) batchesEl.textContent = `${this.totalBatches}`;
    if (playBtn) playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    
    const btns = document.querySelectorAll('.btn-stage');
    btns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === this.currentBeat);
    });
  }
}
