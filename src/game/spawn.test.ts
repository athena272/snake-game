import { describe, expect, it } from 'vitest';
import { defined, TEST_CONFIG } from '../test/gameFactory';
import { containsPoint } from './point';
import { freeCells, spawnItem, spawnItems } from './spawn';
import type { Point } from './types';

function allCellsExcept(...excluded: Point[]): Point[] {
  return freeCells(TEST_CONFIG, excluded);
}

describe('freeCells', () => {
  it('returns every cell of an empty board', () => {
    expect(freeCells(TEST_CONFIG, [])).toHaveLength(25);
  });

  it('excludes occupied cells', () => {
    const occupied = [
      { x: 0, y: 0 },
      { x: 4, y: 4 },
    ];
    const cells = freeCells(TEST_CONFIG, occupied);
    expect(cells).toHaveLength(23);
    occupied.forEach((point) => {
      expect(containsPoint(cells, point)).toBe(false);
    });
  });
});

describe('spawnItem', () => {
  it('never spawns on an occupied cell', () => {
    const occupied = allCellsExcept({ x: 1, y: 1 }, { x: 3, y: 2 });
    for (let seed = 0; seed < 50; seed++) {
      const { value } = spawnItem(TEST_CONFIG, occupied, seed);
      expect(containsPoint(occupied, defined(value))).toBe(false);
    }
  });

  it('picks the only free cell when the board is almost full', () => {
    const occupied = allCellsExcept({ x: 4, y: 0 });
    expect(spawnItem(TEST_CONFIG, occupied, 99).value).toEqual({ x: 4, y: 0 });
  });

  it('returns null and keeps the seed when the board is full', () => {
    const occupied = freeCells(TEST_CONFIG, []);
    expect(spawnItem(TEST_CONFIG, occupied, 99)).toEqual({ value: null, seed: 99 });
  });
});

describe('spawnItems', () => {
  it('spawns distinct items outside occupied cells', () => {
    const occupied = [{ x: 2, y: 2 }];
    const { value: items } = spawnItems(TEST_CONFIG, occupied, 10, 5);
    expect(items).toHaveLength(10);
    expect(new Set(items.map(({ x, y }) => `${x},${y}`)).size).toBe(10);
    expect(containsPoint(items, { x: 2, y: 2 })).toBe(false);
  });

  it('throws when there are not enough free cells', () => {
    expect(() => spawnItems(TEST_CONFIG, [], 26, 1)).toThrow(RangeError);
  });
});
