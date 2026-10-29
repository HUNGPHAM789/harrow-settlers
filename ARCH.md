# Harrow Settlers — architecture contract (all workers must follow exactly)

Game: real-time village/economy builder in the spirit of The Settlers. Player places buildings inside territory;
settlers walk, build, gather, carry goods to/from the Castle (HQ = central stock). Goal: raise the Great Hall
(needs plank,stone,iron,tool) while keeping people fed. Pixel art, 16px tiles, Canvas2D, vanilla ES modules, NO deps, NO build step.

## Modules (path -> exports)
- src/util/rng.js, heap.js, noise.js (done)   - src/sim/defs.js (done, READ IT: TILE,T,WALKABLE,BUILDABLE,GOODS,BUILDINGS,START_STOCK,SETTLER_FOOD_PER_MIN)
- src/sim/world.js : `generateWorld(seed, w=96, h=96)` -> World
    World = { w,h,seed, terrain:Uint8Array(w*h) (values of T), tree:Uint8Array (0 none,1 sapling,2 mature),
              rock:Uint8Array (stone units left on ROCK tiles, 0 elsewhere), ore:Uint8Array (units left on MOUNTAIN tiles),
              fish:Uint8Array (units on WATER tiles that touch land else 0), start:{x,y} (top-left of a 3x3 buildable flat area near center, all tiles GRASS/FOREST_FLOOR, with >=10 mature trees,
              >=1 rock cluster and water within 14 tiles and mountain within 22 tiles), deco:Uint8Array (0..3 flower/grass variant on GRASS for visuals) }
    Island shaped (deep ocean border), fbm-based, deterministic per seed. Helper exports: idx(w,x,y), inBounds(world,x,y).
- src/sim/pathfind.js : `findPath(world, sx,sy, tx,ty, opts?)` -> array of {x,y} tile steps (excluding start, including target) or null. 8-neighbour A*, no corner cutting,
    uses WALKABLE terrain, treats tiles where `opts.blocked(x,y)` is true as impassable (except the target tile), max 4000 expansions, uses util/heap MinHeap. Also `nearestTile(world, sx,sy, predicate, maxR)` BFS -> {x,y}|null.
- src/sim/game.js : `class Game` (headless, deterministic, NO DOM). See "Game API" below.
- src/render/sprites.js : loads `public/assets/*.png` atlases + `atlas.json`; exports `async loadSprites()` -> Sprites; `Sprites.draw(ctx, name, dx, dy, opts)`; falls back to colored rects if missing.
- src/render/renderer.js : `class Renderer(canvas, game, sprites)`: camera (pan with drag/WASD/edge, zoom wheel 1x-4x integer-ish snap), draws terrain, trees, rocks, roads, buildings (incl. construction scaffolds by progress), settlers (walking anim, carried goods icon), territory border, placement ghost (green/red), minimap method `drawMinimap(canvas)`, `screenToTile(sx,sy)`, `tileToScreen`.
- src/ui/ui.js : `class UI(root, game, renderer)`: top bar (stock icons+counts, pop/housing, game time, speed 0/1/2/4), bottom/side build menu grouped by category, building info panel (select building: status, inventory, workers, demolish), toast messages from game.events, objective tracker, pause menu, victory screen. Styled via src/ui/style.css (pixel font via CSS, no external fonts).
- src/audio/audio.js : `class Audio` WebAudio synthesized sfx (place, build_done, click, error, chop, mine, victory) + gentle generative ambient loop; `setMuted`, lazy init on first user gesture.
- src/main.js : wires everything, requestAnimationFrame loop with fixed 20Hz sim step, autosave to localStorage every 30s, "Continue/New game" title screen.
- index.html : canvas + #ui root + loads src/main.js as module.

## Game API (src/sim/game.js)
```
new Game({seed, world?})            // creates world, HQ at world.start, START_STOCK, 4 starting settlers
game.world, game.stock{good:n}, game.buildings[], game.settlers[], game.roads:Uint8Array(w*h), game.time (sim seconds), game.speed
game.territory:Uint8Array(w*h)      // 1 inside owned territory (HQ radius + towers), recomputed on tower completion
game.tick(dt)                       // advance by dt sim-seconds (dt<=0.25 each call; caller loops). Deterministic given seed + commands.
game.canPlace(type,x,y)->{ok:boolean, reason?:string}   // footprint all BUILDABLE, inside territory, no overlap with buildings, stock has full cost,
                                    // 'needs' satisfied: tree=>mature tree within 6 tiles; rock=>rock tile within 6; water=>water tile within 4; mountain=>mountain tile within 4
game.place(type,x,y)->{ok,reason?,id?}   // deducts cost immediately, building state 'queued'
game.demolish(id)                   // refunds 50% (floor) of cost, frees workers
game.paintRoad(x,y,on=true)         // road tiles walk 1.6x faster; only on walkable territory
game.events: array of {t,kind,text,x?,y?}  // kinds: 'info','built','warn','starve','born','victory'; UI drains with game.drainEvents()
game.stats: {pop, housing, foodPerMin, produced:{good:n}, victory:boolean, victoryTime}
game.toJSON()/Game.fromJSON(obj)    // full state (typed arrays as base64 or arrays) round trips exactly
Building = {id,type,x,y,state:'queued'|'building'|'active', progress:0..1, inv:{good:n}, out:{good:n}, workers:[settlerId], cycleT:number, working:boolean}
Settler = {id,x,y (float tile coords),role:'idle'|'builder'|'worker'|'porter',state:string,path:[],carry:null|good,home:buildingId|null,job:buildingId|null,dir:'l'|'r'|'u'|'d'}
```
Rules: placement deducts cost; an idle settler becomes builder, walks HQ door->site, builds (time = 6s * footprint area / 4), building becomes 'active'.
Active production building needs `jobs` settlers (idle ones auto-assign, nearest first). Worker cycle for building with `in`: fetch input from HQ stock (walk there/back carrying), produce for `cycle`s
(only while input present), deposit output to HQ stock by walking (carry icon). Raw buildings (`needs`): consume the resource tile nearby (tree/rock/ore/fish units decrement; woodcutter fells mature tree -> tree=0; forester plants saplings that mature after 90s; farm produces without tile).
Population: hut = +4 housing; HQ 12. Every 25s if housing free and food stock >= 2*pop/… a new settler is born at HQ (walks out). Food: every 60/ SETTLER_FOOD_PER_MIN … simply each settler eats 0.6 units/min in aggregate (fish/bread, bread first); if food is 0, 'starve' event and every 20s a settler leaves (min 2).
Market: +1 housing-equivalent happiness not needed; it's a cosmetic/achievement building (counts for score). Tower extends territory radius 7 around it when active.
Victory: Great Hall active => game.stats.victory=true, event 'victory'. Score = f(time,pop,buildings).
Everything the sim does must be deterministic (use util/rng seeded from game.seed; never Math.random in sim/).

## Art (pxl): art/*.px.js built with `node ~/.claude/skills/pxl-pixel-art/bin/pxl.js build art/<file>.px.js` -> out/ ; build script copies sheets to public/assets and writes atlas.json
Sprite names: terrain tiles 16x16 `tile_<name>` (+ variants _1.._3), `tree_1..3`, `sapling`, `rock_1..2`, `deco_1..3`, buildings `b_<type>` (size = footprint*16 px, optionally taller overlay: art may extend above top), `b_<type>_scaffold`,
`settler_<role>_<dir>_<frame>` 12x16.
Style: warm readable palette (use("sweetie16") or custom), 1px dark outline on objects, light from top-left, consistent.
