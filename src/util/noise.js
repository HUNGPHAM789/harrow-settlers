/**
 * Hash coordinate pair into a 32-bit float in [0, 1).
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @returns {number}
 */
function hash2D(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442968193) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Quintic smoothstep function for smooth noise transitions.
 * @param {number} t
 * @returns {number}
 */
function fade(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Linear interpolation.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + t * (b - a);
}

/**
 * Creates a smooth 2D value noise function given a seed.
 * @param {number} seed Integer seed for generator
 * @returns {(x: number, y: number) => number} Function returning float in [0, 1)
 */
export function makeValueNoise(seed) {
  const s = seed >>> 0;
  return function noise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);

    const xf = x - xi;
    const yf = y - yi;

    const u = fade(xf);
    const v = fade(yf);

    const n00 = hash2D(xi, yi, s);
    const n10 = hash2D(xi + 1, yi, s);
    const n01 = hash2D(xi, yi + 1, s);
    const n11 = hash2D(xi + 1, yi + 1, s);

    const x1 = lerp(n00, n10, u);
    const x2 = lerp(n01, n11, u);

    let val = lerp(x1, x2, v);

    if (val < 0) val = 0;
    if (val >= 1) val = 1 - Number.EPSILON;

    return val;
  };
}

/**
 * Fractal Brownian Motion (FBM) noise.
 * @param {(x: number, y: number) => number} noise 2D noise generator
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {number} [octaves=4] Number of detail octaves
 * @param {number} [lacunarity=2] Frequency multiplier per octave
 * @param {number} [gain=0.5] Amplitude multiplier per octave
 * @returns {number} Normalized float in [0, 1)
 */
export function fbm(noise, x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
  const numOctaves = Math.floor(octaves);
  if (numOctaves <= 0) {
    return 0;
  }

  let total = 0;
  let amplitude = 1;
  let maxVal = 0;
  let frequency = 1;

  for (let i = 0; i < numOctaves; i++) {
    total += noise(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  if (maxVal === 0) {
    return 0;
  }

  let norm = total / maxVal;
  if (norm < 0) norm = 0;
  if (norm >= 1) norm = 1 - Number.EPSILON;

  return norm;
}
