export interface RandomResult<T> {
  readonly value: T;
  readonly seed: number;
}

/**
 * Pure mulberry32 step: the seed travels inside the game state, so every
 * transition stays deterministic and reproducible in tests.
 */
export function nextRandom(seed: number): RandomResult<number> {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0;
  let t = nextSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, seed: nextSeed };
}

/** Integer in `[0, maxExclusive)`. */
export function randomInt(seed: number, maxExclusive: number): RandomResult<number> {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError(`maxExclusive must be a positive integer, got ${maxExclusive}`);
  }
  const { value, seed: nextSeed } = nextRandom(seed);
  return { value: Math.floor(value * maxExclusive), seed: nextSeed };
}
