/**
 * Fast, high-quality 32-bit PRNG (Mulberry32).
 * @param {number} seed 32-bit integer seed
 * @returns {() => number} Generator function returning pseudo-random float in [0, 1)
 */
export function mulberry32(seed) {
  let s = seed >>> 0;
  return function rng() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a random integer in the range [a, b] inclusive.
 * @param {() => number} rng Generator function
 * @param {number} a Range bound
 * @param {number} b Range bound
 * @returns {number} Integer in [min(a,b), max(a,b)]
 */
export function rngInt(rng, a, b) {
  const min = Math.ceil(Math.min(a, b));
  const max = Math.floor(Math.max(a, b));
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Picks a random element from an array.
 * @template T
 * @param {() => number} rng Generator function
 * @param {T[]} arr Array to select from
 * @returns {T | undefined} Selected element or undefined if array is empty
 */
export function rngPick(rng, arr) {
  if (!arr || arr.length === 0) return undefined;
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @template T
 * @param {() => number} rng Generator function
 * @param {T[]} arr Array to shuffle
 * @returns {T[]} The shuffled array (same reference)
 */
export function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}
