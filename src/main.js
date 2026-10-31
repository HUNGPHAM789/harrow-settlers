// Harrow Settlers — Remade World: Living Bakery House Experience
import { BakeryWorld } from './bakery_world.js';

const canvas = document.getElementById('game');
const root = document.getElementById('ui');

let world = null;
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  
  if (world) {
    world.update(dt);
    world.render();
  }
  
  requestAnimationFrame(frame);
}

window.addEventListener('DOMContentLoaded', () => {
  world = new BakeryWorld(canvas, root);
  window.__bakeryWorld = world;
  requestAnimationFrame(frame);
});
