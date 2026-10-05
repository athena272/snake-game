import { describe, expect, it } from 'vitest';
import { nextRandom, randomInt } from './random';

describe('random', () => {
  it('is deterministic for the same seed', () => {
    expect(nextRandom(123)).toEqual(nextRandom(123));
  });

  it('advances the seed', () => {
    expect(nextRandom(123).seed).not.toBe(123);
  });

  it('produces values in [0, 1)', () => {
    let seed = 7;
    for (let i = 0; i < 1000; i++) {
      const result = nextRandom(seed);
      expect(result.value).toBeGreaterThanOrEqual(0);
      expect(result.value).toBeLessThan(1);
      seed = result.seed;
    }
  });

  it('produces integers covering the whole [0, max) range', () => {
    const seen = new Set<number>();
    let seed = 1;
    for (let i = 0; i < 500; i++) {
      const result = randomInt(seed, 6);
      seen.add(result.value);
      seed = result.seed;
    }
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it.each([0, -1, 1.5])('rejects invalid max %s', (max) => {
    expect(() => randomInt(1, max)).toThrow(RangeError);
  });
});
