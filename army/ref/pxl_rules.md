PXL HARD RULES (previous attempts failed validation on exactly these):
1. Palette keys are EXACTLY ONE character: pal({ k: "#1b1630", g: "#8ccf63" }). Never 'wd0', 'W1', 'W0'. Use letters/digits only. NEVER use '_' '.' ' ' '#' '-' as keys (reserved). Use distinct single chars (a-z A-Z 0-9).
2. ramps("ktGg") must only list keys that exist in pal (every char). Define all keys before ramps.
3. EVERY sprite needs a size: sprite("name", { w: 64, h: 48 }, ...ops) or a grid string. Never omit {w,h}.
4. In grid strings use only palette keys and '.' for transparent; no '-' or other chars.
5. Define helper functions (isoBox, roof) once; reuse in loops. Keep each sprite short.
6. A working isometric example that builds is art/iso_terrain.px.js: copy its style for poly()/shade/light usage.
7. After writing, mentally check: every sprite name in the required list is emitted exactly once with exact w x h.
