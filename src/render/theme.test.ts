import { describe, expect, it } from 'vitest';
import { mixColors } from './theme';

describe('mixColors', () => {
  it('returns the endpoints', () => {
    expect(mixColors(0x000000, 0xffffff, 0)).toBe(0x000000);
    expect(mixColors(0x000000, 0xffffff, 1)).toBe(0xffffff);
  });

  it('blends each channel', () => {
    expect(mixColors(0x000000, 0xff8040, 0.5)).toBe(0x804020);
  });

  it('clamps the ratio', () => {
    expect(mixColors(0x102030, 0x405060, -1)).toBe(0x102030);
    expect(mixColors(0x102030, 0x405060, 2)).toBe(0x405060);
  });
});
