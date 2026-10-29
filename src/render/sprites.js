import { BUILDINGS, TILE } from '../sim/defs.js';

/**
 * Hash a string to a 32-bit unsigned integer deterministically.
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Generate a short 2-3 letter label for missing sprite placeholders.
 * @param {string} name
 * @returns {string}
 */
function getPlaceholderLabel(name) {
  if (name.startsWith('b_')) {
    const parts = name.split('_');
    const type = parts[1] || '';
    return type.slice(0, 3).toUpperCase();
  }
  if (name.startsWith('tile_')) {
    const parts = name.split('_');
    const type = parts[1] || '';
    return type.slice(0, 2).toUpperCase();
  }
  if (name.startsWith('settler_')) {
    return 'SET';
  }
  if (name.startsWith('good_') || name.startsWith('g_')) {
    const parts = name.split('_');
    const item = parts[1] || '';
    return item.slice(0, 2).toUpperCase();
  }
  return name.slice(0, 3).toUpperCase();
}

/**
 * Sprites manager holding loaded sprite images/bitmaps and rendering fallback placeholders.
 */
export const Sprites = {
  /** @type {Map<string, { img: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, w: number, h: number }>} */
  _sprites: new Map(),

  /**
   * Check if a sprite with the given name is loaded.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._sprites.has(name);
  },

  /**
   * Register a loaded image or slice as a sprite name.
   * @param {string} name
   * @param {CanvasImageSource} img
   * @param {number} [sx=0]
   * @param {number} [sy=0]
   * @param {number} [sw]
   * @param {number} [sh]
   */
  register(name, img, sx = 0, sy = 0, sw = null, sh = null) {
    const width = sw ?? (img.width || TILE);
    const height = sh ?? (img.height || TILE);
    this._sprites.set(name, {
      img,
      sx,
      sy,
      sw: width,
      sh: height,
      w: width,
      h: height,
    });
  },

  /**
   * Get dimensions of a sprite or estimated size if missing.
   * @param {string} name
   * @returns {{ w: number, h: number, width: number, height: number }}
   */
  size(name) {
    if (this._sprites.has(name)) {
      const entry = this._sprites.get(name);
      return { w: entry.w, h: entry.h, width: entry.w, height: entry.h };
    }

    // Fallback dimension estimation when sprite is missing
    if (name.startsWith('b_')) {
      let type = name.slice(2);
      if (type.endsWith('_scaffold')) {
        type = type.slice(0, -9);
      }
      const def = BUILDINGS[type];
      if (def && def.size) {
        const w = def.size[0] * TILE;
        const h = def.size[1] * TILE;
        return { w, h, width: w, height: h };
      }
    }

    if (name.startsWith('settler_')) {
      return { w: 12, h: 16, width: 12, height: 16 };
    }

    return { w: TILE, h: TILE, width: TILE, height: TILE };
  },

  /**
   * Draw a sprite onto a Canvas2D context.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} name
   * @param {number} dx
   * @param {number} dy
   * @param {{ flip?: boolean|string, alpha?: number, scale?: number, tint?: string }} [opts={}]
   */
  draw(ctx, name, dx, dy, opts = {}) {
    const scale = opts.scale ?? 1;
    const flipH = opts.flip === true || opts.flip === 'h' || opts.flip === 'x';
    const flipV = opts.flip === 'v' || opts.flip === 'y';

    if (this._sprites.has(name)) {
      const entry = this._sprites.get(name);
      const tw = entry.w * scale;
      const th = entry.h * scale;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (opts.alpha !== undefined) {
        ctx.globalAlpha = opts.alpha;
      }

      ctx.translate(dx + tw / 2, dy + th / 2);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(
        entry.img,
        entry.sx,
        entry.sy,
        entry.sw,
        entry.sh,
        -tw / 2,
        -th / 2,
        tw,
        th
      );

      if (opts.tint) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = opts.tint;
        ctx.fillRect(-tw / 2, -th / 2, tw, th);
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();
    } else {
      // Deterministic hashed-color placeholder drawing
      const sz = this.size(name);
      const tw = sz.w * scale;
      const th = sz.h * scale;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (opts.alpha !== undefined) {
        ctx.globalAlpha = opts.alpha;
      }

      ctx.translate(dx + tw / 2, dy + th / 2);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      const hash = hashString(name);
      const hue = hash % 360;
      const sat = 55 + (hash % 25);
      const light = 45 + ((hash >> 8) % 20);

      const fillColor = `hsl(${hue}, ${sat}%, ${light}%)`;
      const borderColor = `hsl(${hue}, ${sat}%, ${Math.max(15, light - 25)}%)`;

      // Fill rectangle
      ctx.fillStyle = fillColor;
      ctx.fillRect(-tw / 2, -th / 2, tw, th);

      // Inset dark border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(-tw / 2 + 0.5, -th / 2 + 0.5, Math.max(1, tw - 1), Math.max(1, th - 1));

      // Optional tint overlay
      if (opts.tint) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = opts.tint;
        ctx.fillRect(-tw / 2, -th / 2, tw, th);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw short text label inside placeholder if large enough
      if (tw >= 10 && th >= 10) {
        const label = getPlaceholderLabel(name);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Unflip text orientation if transformed
        if (flipH || flipV) {
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        }

        ctx.fillText(label, 0, 0);
      }

      ctx.restore();
    }
  },
};

/**
 * Helper to fetch a URL safely without throwing.
 * @param {string} url
 * @returns {Promise<Response|null>}
 */
async function fetchSafe(url) {
  try {
    const res = await fetch(url);
    if (res.ok) return res;
  } catch (e) {
    // Tolerated missing asset or network error
  }
  return null;
}

/**
 * Load an image asset from candidate URL paths.
 * @param {string} name
 * @returns {Promise<CanvasImageSource|null>}
 */
async function loadImageFile(name) {
  const paths = [
    `public/assets/sprites/${name}.png`,
    `assets/sprites/${name}.png`,
    `public/assets/${name}.png`,
    `assets/${name}.png`,
  ];

  for (const path of paths) {
    const res = await fetchSafe(path);
    if (res) {
      try {
        const blob = await res.blob();
        if (typeof createImageBitmap === 'function') {
          return await createImageBitmap(blob);
        }
        return await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = URL.createObjectURL(blob);
        });
      } catch (e) {
        // Tolerated load error
      }
    }
  }
  return null;
}

/**
 * Predefined list of standard sprite names to probe if no manifest is provided.
 * @returns {string[]}
 */
function getCandidateSpriteNames() {
  const names = [
    'tile_deep', 'tile_water_1', 'tile_water_2', 'tile_sand',
    'tile_grass_1', 'tile_grass_2', 'tile_grass_3',
    'tile_forest', 'tile_rock', 'tile_mountain', 'tile_snow',
    'tree_1', 'tree_2', 'tree_3', 'sapling', 'rock_1', 'rock_2',
    'deco_1', 'deco_2', 'deco_3',
  ];

  // Building sprites
  for (const type of Object.keys(BUILDINGS)) {
    names.push(`b_${type}`, `b_${type}_scaffold`);
  }

  // Settler sprites
  const roles = ['idle', 'builder', 'worker', 'porter'];
  const dirs = ['u', 'd', 'l', 'r'];
  for (const r of roles) {
    for (const d of dirs) {
      for (let f = 0; f < 4; f++) {
        names.push(`settler_${r}_${d}_${f}`);
      }
    }
  }

  return names;
}

/**
 * Load manifest / atlas JSON and sprites in parallel.
 * Tolerates missing files without throwing.
 * @returns {Promise<typeof Sprites>}
 */
export async function loadSprites() {
  const manifestPaths = [
    'public/assets/manifest.json',
    'assets/manifest.json',
    'public/assets/atlas.json',
    'assets/atlas.json',
  ];

  let manifestData = null;
  let manifestPathUsed = '';

  for (const path of manifestPaths) {
    const res = await fetchSafe(path);
    if (res) {
      try {
        manifestData = await res.json();
        manifestPathUsed = path;
        break;
      } catch (e) {
        // Tolerated JSON parse failure
      }
    }
  }

  if (manifestData) {
    // Case 1: Atlas style JSON with frame coordinates
    if (manifestData.frames) {
      const atlasImgName = manifestData.meta?.image || 'atlas.png';
      const basePath = manifestPathUsed.substring(0, manifestPathUsed.lastIndexOf('/') + 1);
      const atlasRes = await fetchSafe(`${basePath}${atlasImgName}`);

      if (atlasRes) {
        try {
          const blob = await atlasRes.blob();
          const atlasImg = typeof createImageBitmap === 'function'
            ? await createImageBitmap(blob)
            : await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = URL.createObjectURL(blob);
              });

          if (atlasImg) {
            const frames = manifestData.frames;
            for (const name of Object.keys(frames)) {
              const f = frames[name].frame || frames[name];
              if (f && typeof f.x === 'number') {
                Sprites.register(name, atlasImg, f.x, f.y, f.w, f.h);
              }
            }
            return Sprites;
          }
        } catch (e) {
          // Tolerated atlas image failure
        }
      }
    }

    // Case 2: Manifest listing sprite names array or object keys
    let spriteList = [];
    if (Array.isArray(manifestData)) {
      spriteList = manifestData;
    } else if (Array.isArray(manifestData.sprites)) {
      spriteList = manifestData.sprites;
    } else if (Array.isArray(manifestData.files)) {
      spriteList = manifestData.files;
    } else if (typeof manifestData === 'object') {
      spriteList = Object.keys(manifestData);
    }

    if (spriteList.length > 0) {
      const tasks = spriteList.map(async (name) => {
        const cleanName = String(name).replace(/\.png$/i, '');
        const img = await loadImageFile(cleanName);
        if (img) {
          Sprites.register(cleanName, img);
        }
      });
      await Promise.allSettled(tasks);
      return Sprites;
    }
  }

  // Fallback: probe known standard sprite names in parallel
  const defaultNames = getCandidateSpriteNames();
  const tasks = defaultNames.map(async (name) => {
    const img = await loadImageFile(name);
    if (img) {
      Sprites.register(name, img);
    }
  });
  await Promise.allSettled(tasks);

  return Sprites;
}

/**
 * Maps terrain type and tile coordinates to a deterministic variant sprite name.
 * @param {number|string} type
 * @param {number} x
 * @param {number} y
 * @returns {string}
 */
export function terrainSprite(type, x, y) {
  let key = type;

  if (typeof type === 'number') {
    const names = ['deep', 'water', 'sand', 'grass', 'forest', 'rock', 'mountain', 'snow'];
    key = names[type] || 'grass';
  } else if (typeof type === 'string') {
    key = type.toLowerCase();
    if (key.startsWith('tile_')) key = key.slice(5);
    if (key === 'forest_floor') key = 'forest';
  }

  // Deterministic 32-bit hash of tile coordinates
  const hash = ((Math.imul(x, 374761393) ^ Math.imul(y, 668265263)) >>> 0);

  if (key === 'grass') {
    const variant = (hash % 3) + 1;
    return `tile_grass_${variant}`;
  }

  if (key === 'water') {
    const variant = (hash % 2) + 1;
    return `tile_water_${variant}`;
  }

  if (key === 'deep') return 'tile_deep';
  if (key === 'sand') return 'tile_sand';
  if (key === 'forest') return 'tile_forest';
  if (key === 'rock') return 'tile_rock';
  if (key === 'mountain') return 'tile_mountain';
  if (key === 'snow') return 'tile_snow';

  return `tile_${key}`;
}

/**
 * Formats role, direction, and frame index into a settler sprite name.
 * @param {string} [role='idle']
 * @param {string} [dir='d']
 * @param {number} [frame=0]
 * @returns {string}
 */
export function settlerSprite(role = 'idle', dir = 'd', frame = 0) {
  let d = String(dir).toLowerCase();

  if (d === 'up' || d === 'u') d = 'u';
  else if (d === 'down' || d === 'd') d = 'd';
  else if (d === 'left' || d === 'l') d = 'l';
  else if (d === 'right' || d === 'r') d = 'r';
  else d = 'd';

  const f = Math.floor(Math.abs(frame)) || 0;
  return `settler_${role}_${d}_${f}`;
}
