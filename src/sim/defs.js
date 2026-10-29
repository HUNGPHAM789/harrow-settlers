// Static game data. Single source of truth for goods, terrain and buildings.
export const TILE = 16;
export const T = Object.freeze({ DEEP: 0, WATER: 1, SAND: 2, GRASS: 3, FOREST_FLOOR: 4, ROCK: 5, MOUNTAIN: 6, SNOW: 7 });
export const WALKABLE = [false, false, true, true, true, true, true, false];
export const BUILDABLE = [false, false, false, true, true, false, false, false];
export const GOODS = ['log', 'plank', 'stone', 'fish', 'wheat', 'flour', 'bread', 'coal', 'ore', 'iron', 'tool'];
// size: footprint [w,h] in tiles; door = [dx,dy] tile (relative to top-left) where workers/porters enter.
// in/out: goods per cycle; cycle: seconds per production cycle at 1x speed; cost: build materials.
export const BUILDINGS = {
  hq:         { name: 'Castle',      size: [3, 3], door: [1, 3], cost: {},                          radius: 9,  pop: 12, store: true },
  hut:        { name: 'Settler Hut', size: [2, 2], door: [0, 2], cost: { plank: 2, log: 1 },        pop: 4 },
  woodcutter: { name: 'Woodcutter',  size: [2, 2], door: [0, 2], cost: { plank: 2 },                cycle: 12, out: { log: 1 },   needs: 'tree',  jobs: 1 },
  forester:   { name: 'Forester',    size: [2, 2], door: [0, 2], cost: { plank: 2 },                cycle: 14,                      plants: 'tree', jobs: 1 },
  quarry:     { name: 'Quarry',      size: [2, 2], door: [0, 2], cost: { plank: 2, log: 1 },        cycle: 16, out: { stone: 1 }, needs: 'rock',  jobs: 1 },
  sawmill:    { name: 'Sawmill',     size: [3, 2], door: [1, 2], cost: { plank: 2, log: 2, stone: 1 }, cycle: 10, in: { log: 1 }, out: { plank: 1 }, jobs: 1 },
  fisher:     { name: 'Fisher',      size: [2, 2], door: [0, 2], cost: { plank: 2 },                cycle: 15, out: { fish: 1 },  needs: 'water', jobs: 1 },
  farm:       { name: 'Farm',        size: [3, 3], door: [1, 3], cost: { plank: 3, log: 2 },        cycle: 20, out: { wheat: 1 }, jobs: 1 },
  mill:       { name: 'Windmill',    size: [2, 3], door: [0, 3], cost: { plank: 3, stone: 2 },      cycle: 10, in: { wheat: 1 }, out: { flour: 1 }, jobs: 1 },
  bakery:     { name: 'Bakery',      size: [2, 2], door: [0, 2], cost: { plank: 3, stone: 2 },      cycle: 12, in: { flour: 1 }, out: { bread: 2 }, jobs: 1 },
  mine:       { name: 'Mine',        size: [2, 2], door: [0, 2], cost: { plank: 4, stone: 2 },      cycle: 18, out: { ore: 1, coal: 1 }, needs: 'mountain', jobs: 2 },
  smelter:    { name: 'Smelter',     size: [2, 2], door: [0, 2], cost: { plank: 3, stone: 4 },      cycle: 16, in: { ore: 1, coal: 1 }, out: { iron: 1 }, jobs: 1 },
  smith:      { name: 'Smithy',      size: [3, 2], door: [1, 2], cost: { plank: 4, stone: 4 },      cycle: 20, in: { iron: 1, log: 1 }, out: { tool: 1 }, jobs: 1 },
  tower:      { name: 'Watchtower',  size: [2, 2], door: [0, 2], cost: { plank: 3, stone: 4 },      radius: 7, jobs: 1 },
  market:     { name: 'Market',      size: [3, 2], door: [1, 2], cost: { plank: 4, stone: 3 },      pop: 0, jobs: 0, happiness: 10 },
  monument:   { name: 'Great Hall',  size: [4, 3], door: [1, 3], cost: { plank: 20, stone: 20, iron: 6, tool: 4 }, jobs: 0, wonder: true },
};
export const START_STOCK = { log: 12, plank: 16, stone: 8, fish: 6, bread: 6 };
export const SETTLER_FOOD_PER_MIN = 0.6;   // each settler eats this many food units/min (fish or bread)
export const BUILD_ORDER = Object.keys(BUILDINGS).filter(k => k !== 'hq');
