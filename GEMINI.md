# HARROW SETTLERS DEVELOPMENT & LIVE VERIFICATION PROTOCOL
*Auto-loaded when working inside projects/harrow-settlers.*

## 1. MANDATORY VISUAL DELIVERY TO TELEGRAM (Boss 29/10/2026)
- Any upgrade, feature addition, art refresh, or new dev MUST capture live visual evidence (gameplay screenshot/canvas export) and send the image directly to Telegram Chat `7026364377` via `python3 /Users/hungpham/telegram_send.py`.

## 2. PRODUCTION HOST & PATH INTEGRITY
- **Live Production Host:** Game is hosted live on GitHub Pages at `https://hungpham789.github.io/harrow-settlers/`.
- **Path Integrity:** All asset references must strictly remain relative (`public/assets/...` or `assets/...`) so the game works seamlessly on GitHub Pages subpaths.

## 3. VERIFICATION GATE (ORACLE)
- Every feature commit must maintain 100% pass on all node unit tests (`node --test tests/*.test.mjs`) and delivery gate checks (`delivery_gate.py`).
