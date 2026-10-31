# HARROW SETTLERS DEVELOPMENT & LIVE VERIFICATION PROTOCOL
*Auto-loaded when working inside projects/harrow-settlers.*

## 1. MANDATORY VISUAL DELIVERY TO TELEGRAM (Boss 29/10/2026)
- Any upgrade, feature addition, art refresh, or new dev MUST capture live visual evidence (gameplay screenshot/canvas export) and send the image directly to Telegram Chat `7026364377` via `python3 /Users/hungpham/telegram_send.py`.

## 2. PRODUCTION HOST & PATH INTEGRITY
- **Live Production Host:** Game is hosted live on GitHub Pages at `https://hungpham789.github.io/harrow-settlers/`.
- **Path Integrity:** All asset references must strictly remain relative (`public/assets/...` or `assets/...`) so the game works seamlessly on GitHub Pages subpaths.

## 3. VERIFICATION GATE (ORACLE)
- Every feature commit must maintain 100% pass on all node unit tests (`node --test tests/*.test.mjs`) and delivery gate checks (`delivery_gate.py`).

## 4. ARCHITECTURAL CLARITY & SOLID BUILDING IDENTITY MANDATE (Boss 31/10/2026)
- **Zero-Ambiguity Building Rule:** A building or shopfront (e.g. Bakery House) must NEVER be rendered as an abstract, floating, wireframe-like cutaway or isolated box on a dark void.
- **Instant Visual Readability:** The architecture MUST be 100% unmistakably identifiable as its functional profession within 1 second of glancing:
  1. *Solid Structural Anatomy:* Complete authentic Settlers II architecture — terracotta tile gabled roof, riverstone plinth, honey oak timber framing (`Fachwerk`), glowing leaded windows, chimney with rising smoke puffs.
  2. *Definitive Profession Signage & Props:* Large gilded trade crest (e.g. Pretzel Guild Sign), prominent display counter with stacked fresh bread, functional clearly partitioned work zones (Flour Pantry, Kneading Table, Stone Oven, Cooling Rack).
  3. *Contextual Grounding:* The building must be grounded on a lush, sunny Settlers II landscape (vibrant green meadow `#63a628`, cobblestone street `#7d85a0`, flower beds), NEVER floating in a black or dark purple void.
  4. *Viewport Framing:* The stage must fill the camera view meaningfully (scale $\ge 1.5\times$ to $2\times$), keeping character and props crisp, large, and readable on mobile devices.
