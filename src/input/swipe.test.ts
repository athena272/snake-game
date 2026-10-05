import { describe, expect, it } from 'vitest';
import type { Direction, Point } from '../game';
import { detectSwipe, SWIPE_THRESHOLD_PX } from './swipe';

const origin: Point = { x: 100, y: 100 };

describe('detectSwipe', () => {
  it.each<[Point, Direction]>([
    [{ x: 160, y: 110 }, 'right'],
    [{ x: 40, y: 90 }, 'left'],
    [{ x: 105, y: 170 }, 'down'],
    [{ x: 95, y: 30 }, 'up'],
  ])('detects a swipe to %o as %s', (end, expected) => {
    expect(detectSwipe(origin, end)).toBe(expected);
  });

  it('ignores small movements (taps and jitter)', () => {
    expect(detectSwipe(origin, { x: 110, y: 105 })).toBeNull();
  });

  it('triggers exactly at the threshold', () => {
    expect(detectSwipe(origin, { x: 100 + SWIPE_THRESHOLD_PX, y: 100 })).toBe('right');
  });

  it('accepts a custom threshold', () => {
    expect(detectSwipe(origin, { x: 110, y: 100 }, 8)).toBe('right');
  });
});
