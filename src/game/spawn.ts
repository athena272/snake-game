import { randomInt, type RandomResult } from './random';
import type { GameConfig, Point } from './types';

export function freeCells(config: GameConfig, occupied: readonly Point[]): Point[] {
  const { cols, rows } = config;
  const taken = new Set(occupied.map(({ x, y }) => y * cols + x));
  const cells: Point[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!taken.has(y * cols + x)) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

/** Picks a random free cell, or `null` when the board is full. */
export function spawnItem(
  config: GameConfig,
  occupied: readonly Point[],
  seed: number,
): RandomResult<Point | null> {
  const cells = freeCells(config, occupied);
  if (cells.length === 0) {
    return { value: null, seed };
  }
  const { value: index, seed: nextSeed } = randomInt(seed, cells.length);
  return { value: cells[index] ?? null, seed: nextSeed };
}

/** Spawns `count` items that do not overlap each other nor `occupied`. */
export function spawnItems(
  config: GameConfig,
  occupied: readonly Point[],
  count: number,
  seed: number,
): RandomResult<Point[]> {
  const items: Point[] = [];
  let currentSeed = seed;

  for (let i = 0; i < count; i++) {
    const { value, seed: nextSeed } = spawnItem(config, [...occupied, ...items], currentSeed);
    if (!value) {
      throw new RangeError(`Not enough free cells to spawn ${count} items`);
    }
    items.push(value);
    currentSeed = nextSeed;
  }
  return { value: items, seed: currentSeed };
}
