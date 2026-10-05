import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, validateConfig } from './config';
import type { GameConfig } from './types';

describe('config', () => {
  it('defaults to a 24x18 grid with a 100 ms tick, 2 poisons and 2 traps', () => {
    expect(DEFAULT_CONFIG).toEqual({
      cols: 24,
      rows: 18,
      tickMs: 100,
      poisonCount: 2,
      trapCount: 2,
    });
  });

  it('accepts the default config', () => {
    expect(() => {
      validateConfig(DEFAULT_CONFIG);
    }).not.toThrow();
  });

  it.each<[string, Partial<GameConfig>]>([
    ['non-integer size', { cols: 10.5 }],
    ['zero rows', { rows: 0 }],
    ['grid smaller than 3x3', { cols: 2 }],
    ['non-positive tick', { tickMs: 0 }],
    ['negative poison count', { poisonCount: -1 }],
    ['too many items for the grid', { cols: 3, rows: 3, poisonCount: 3, trapCount: 3 }],
  ])('rejects %s', (_, override) => {
    expect(() => {
      validateConfig({ ...DEFAULT_CONFIG, ...override });
    }).toThrow(RangeError);
  });
});
