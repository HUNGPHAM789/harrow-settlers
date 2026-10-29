import { Game } from './sim/game.js';
import { loadSprites } from './render/sprites.js';
import { Renderer } from './render/renderer.js';
import { UI } from './ui/ui.js';
import { Audio } from './audio/audio.js';

const SAVE_KEY = 'harrow-settlers-save-v1';
const canvas = document.getElementById('game');
const root = document.getElementById('ui');
const audio = new Audio();
let game, renderer, ui, sprites, acc = 0, last = performance.now(), saveT = 0, started = false;

function boot(saved) {
  root.innerHTML = '';
  try { game = saved && Game.fromJSON ? Game.fromJSON(saved) : new Game({ seed: (Math.random() * 1e9) | 0 }); }
  catch (e) { console.warn('save invalid', e); game = new Game({ seed: (Math.random() * 1e9) | 0 }); }
  if (renderer) renderer.destroy?.();
  renderer = new Renderer(canvas, game, sprites);
  ui = new UI(root, game, renderer, {
    onNewGame: () => { localStorage.removeItem(SAVE_KEY); boot(null); },
    onToggleMute: () => { audio.setMuted(!audio.isMuted()); return audio.isMuted(); },
  });
  renderer.centerOnTile?.(game.world.start.x + 1, game.world.start.y + 1);
}
function title() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#1b1630ee;color:#f4e4bc;font:700 22px ui-monospace,monospace;z-index:99';
  const saved = localStorage.getItem(SAVE_KEY);
  el.innerHTML = '<div style="font-size:44px;letter-spacing:4px">HARROW SETTLERS</div><div style="opacity:.8;font-size:15px">Build a village. Feed your people. Raise the Great Hall.</div>';
  const mk = (t, f) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'font:inherit;padding:10px 28px;background:#e8b04a;border:3px solid #5a3a1a;cursor:pointer;color:#2a1a0a'; b.onclick = () => { audio.unlockOnGesture(); el.remove(); started = true; f(); }; el.appendChild(b); };
  if (saved) mk('Continue', () => boot(JSON.parse(saved)));
  mk('New Game', () => { localStorage.removeItem(SAVE_KEY); boot(null); });
  document.body.appendChild(el);
}
function frame(now) {
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  if (started && game) {
    acc += dt * (game.speed ?? 1);
    let n = 0; while (acc >= 0.05 && n++ < 12) { game.tick(0.05); acc -= 0.05; }
    if (n >= 12) acc = 0;
    for (const e of game.events ?? []) { if (e.kind === 'built') audio.play('build_done'); else if (e.kind === 'warn' || e.kind === 'starve') audio.play('warn'); else if (e.kind === 'born') audio.play('born'); else if (e.kind === 'victory') audio.play('victory'); }
    renderer.update?.(dt); renderer.render(dt); ui.update();
    const mm = document.getElementById('minimap-canvas'); if (mm) renderer.drawMinimap(mm);
    if ((saveT += dt) > 30 && !game.stats.victory) { saveT = 0; try { localStorage.setItem(SAVE_KEY, JSON.stringify(game.toJSON())); } catch {} }
  }
  requestAnimationFrame(frame);
}
(async () => { sprites = await loadSprites(); title(); requestAnimationFrame(frame); })();
window.addEventListener('keydown', () => audio.unlockOnGesture(), { once: true });
