# Claude Drawing Skill — three code-drawn examples

Original examples made for Harrow Settlers by calling the repository's `LineArt`, `Morph`, and `Soft3D` modules directly. The drawings use Python, NumPy, and Pillow; no image-generation model or external image assets were used.

Source skill: https://github.com/cloveric/claude-drawing-skill
Source revision used: `24418f3`

## Deliverables

- `lineart_midnight_bakery.png` — one continuous line, one amber window accent, separate backdrop/path/glow/accent/type PNG layers, and cumulative draw stages.
- `morph_dough_to_loaf.png` — three-stage contour storyboard with onion-skin, easing curve, and point samples.
- `morph_dough_to_loaf.gif` — real 720×405 shape-morph loop; 37 optimized GIF frames.
- `morph_layer_*.png` — transparent raw, in-between, and baked contour layers exported from the Morph-generated point arrays.
- `soft3d_bakery_loaf.png` — ray-traced scene containing a rounded loaf, cutting board, flour pearls, 3D lighting, and depth of field.
- `stages/` — cumulative process snapshots saved by the skill APIs.
- `build_examples.py` — source for the original examples. Rebuild it after cloning the skill repository to `/tmp/claude-drawing-skill` (or change `SKILL` near the top of the script).

## Layer interpretation

`LineArt` has a single path plus compositing components; this example exports those components as independent PNGs. `Morph` animates one closed outline, so the useful exports are keyframes/in-between frames and onion-skin guides rather than body-part layers. `Soft3D` keeps separate geometry in its internal scene, but the repository's stage export is a cumulative full-scene render, not editable per-object RGBA layers.
