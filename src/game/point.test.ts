import { describe, expect, it } from 'vitest';
import { containsPoint, indexOfPoint, pointEquals, translate, wrap, wrapPoint } from './point';

describe('point', () => {
  it('compares points by value', () => {
    expect(pointEquals({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    expect(pointEquals({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false);
  });

  it('translates a point by a delta', () => {
    expect(translate({ x: 1, y: 1 }, { x: -1, y: 2 })).toEqual({ x: 0, y: 3 });
  });

  it.each([
    [0, 5, 0],
    [4, 5, 4],
    [5, 5, 0],
    [-1, 5, 4],
    [-6, 5, 4],
  ])('wrap(%i, %i) = %i', (value, size, expected) => {
    expect(wrap(value, size)).toBe(expected);
  });

  it('wraps both axes independently', () => {
    expect(wrapPoint({ x: -1, y: 15 }, 20, 15)).toEqual({ x: 19, y: 0 });
  });

  it('finds points in a list', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 1 },
    ];
    expect(containsPoint(points, { x: 3, y: 1 })).toBe(true);
    expect(containsPoint(points, { x: 1, y: 3 })).toBe(false);
    expect(indexOfPoint(points, { x: 3, y: 1 })).toBe(1);
    expect(indexOfPoint(points, { x: 9, y: 9 })).toBe(-1);
  });
});
