# usage: python3 tools/shot.py URL out.png [seconds] -- headless smoke: New Game, wait, screenshot, console errors
import sys
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]; wait = int(sys.argv[3]) if len(sys.argv) > 3 else 4
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 800}); errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
    pg.on("requestfailed", lambda r: errs.append("REQFAIL " + r.url))
    pg.on("response", lambda r: errs.append(f"HTTP {r.status} {r.url}") if r.status >= 400 else None)
    pg.goto(url); pg.wait_for_timeout(1500)
    try: pg.get_by_text("New Game").first.click()
    except Exception as e: errs.append("noclick " + str(e)[:80])
    pg.wait_for_timeout(wait * 1000); pg.screenshot(path=out)
    print("\n".join(errs[:15]) or "no console errors"); b.close()
