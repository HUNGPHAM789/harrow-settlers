#!/usr/bin/env python3
import http.server
import json
import os
import pathlib
import threading
import time
from playwright.sync_api import sync_playwright
from PIL import Image

PROJECT_ROOT = pathlib.Path('/Users/hungpham/projects/harrow-settlers')
OUT_DIR = PROJECT_ROOT / 'delivery-evidence'
OUT_DIR.mkdir(parents=True, exist_ok=True)

class QuietServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)
    def log_message(self, format, *args):
        pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), QuietServer)
port = server.server_port
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()
url = f'http://127.0.0.1:{port}/'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        )
        ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
        page = ctx.new_page()
        
        print(f"Navigating to {url}...")
        page.goto(url, wait_until='networkidle', timeout=20000)
        
        # Click New Game
        new_game_btn = page.get_by_role('button', name='New Game', exact=True)
        new_game_btn.wait_for(state='visible', timeout=10000)
        new_game_btn.click()
        
        page.wait_for_timeout(2000)
        
        # Place several buildings near HQ using game engine
        page.evaluate('''() => {
            const { game, renderer } = window.__settlers;
            const sx = game.world.start.x;
            const sy = game.world.start.y;
            
            // Try placing a hut, woodcutter, quarry, mill, farm nearby
            const candidates = [
                { type: 'hut', dx: -4, dy: 1 },
                { type: 'woodcutter', dx: 3, dy: -3 },
                { type: 'quarry', dx: -5, dy: -4 },
                { type: 'mill', dx: 4, dy: 2 },
                { type: 'bakery', dx: 1, dy: 4 }
            ];
            
            for (const c of candidates) {
                const tx = sx + c.dx;
                const ty = sy + c.dy;
                const check = game.canPlace(c.type, tx, ty);
                if (check.ok) {
                    game.place(c.type, tx, ty);
                }
            }
            
            // Make one or two active immediately to show completed 3D visuals
            if (game.buildings.length > 1) {
                game.buildings[1].state = 'active';
            }
            if (game.buildings.length > 2) {
                game.buildings[2].state = 'active';
            }
            
            // Build road connecting
            for (let x = sx - 4; x <= sx + 4; x++) {
                game.roads[sy * game.world.w + x] = 1;
            }
            for (let y = sy - 4; y <= sy + 4; y++) {
                game.roads[y * game.world.w + sx] = 1;
            }
            
            renderer.camera.zoom = 1.6;
            renderer.centerOnTile(sx, sy);
        }''')
        
        # Let simulation advance 4 seconds
        page.wait_for_timeout(4000)
        
        screenshot_path = OUT_DIR / 'live_gameplay_3d_settlement.png'
        page.screenshot(path=str(screenshot_path))
        print(f"Captured live gameplay screenshot to: {screenshot_path}")
        
finally:
    server.shutdown()
