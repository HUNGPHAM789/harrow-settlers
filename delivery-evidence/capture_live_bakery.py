#!/usr/bin/env python3
"""
Headless Playwright Visual Auditor:
Captures live gameplay screenshots of the Remade Bakery House on index.html.
"""
import http.server
import pathlib
import threading
import time
from playwright.sync_api import sync_playwright

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

console_logs = []

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        )
        ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, device_scale_factor=1)
        page = ctx.new_page()
        
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        
        print(f"Navigating to {url}...")
        page.goto(url, wait_until='networkidle', timeout=15000)
        
        # Wait 2 seconds for animation & HUD to render
        page.wait_for_timeout(2500)
        
        # Capture initial screenshot
        screenshot_path = OUT_DIR / 'live_bakery_gameplay.png'
        page.screenshot(path=str(screenshot_path))
        print(f"✅ Captured live screenshot: {screenshot_path}")
        
        # Click Next button to step through animations
        for step in range(3):
            page.click('#btn-next')
            page.wait_for_timeout(400)
            
        screenshot_step_path = OUT_DIR / 'live_bakery_step_interaction.png'
        page.screenshot(path=str(screenshot_step_path))
        print(f"✅ Captured stepped screenshot: {screenshot_step_path}")
        
        browser.close()
except Exception as e:
    print(f"❌ Playwright error: {e}")
finally:
    server.shutdown()

print("Console logs:", console_logs)
