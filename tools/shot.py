# usage: python3 tools/shot.py URL out.png [actions]  -- headless smoke test: logs console errors, clicks New Game, screenshots
import sys, time
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 800}); errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
    pg.goto(url); pg.wait_for_timeout(1500)
    try: pg.get_by_text("New Game").first.click()
    except Exception as e: errs.append("noclick " + str(e)[:80])
    pg.wait_for_timeout(4000); pg.screenshot(path=out)
    print("\n".join(errs[:15]) or "no console errors"); b.close()
