import type { Direction, GameConfig, Point } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  cols: 24,
  rows: 18,
  tickMs: 100,
  poisonCount: 2,
  trapCount: 2,
};

export const INITIAL_HEAD: Point = { x: 2, y: 2 };
export const INITIAL_DIRECTION: Direction = 'right';
/**
 * Cells in front of the initial head kept free so the first moves are never
 * fatal. The head's side neighbours are kept free too, for an immediate turn.
 */
export const SAFE_ZONE_LENGTH = 3;
const SAFE_SIDE_CELLS = 2;
export const MAX_QUEUED_INPUTS = 3;

const MIN_GRID_SIZE = 3;

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function validateConfig(config: GameConfig): void {
  const { cols, rows, tickMs, poisonCount, trapCount } = config;

  if (!isPositiveInteger(cols) || !isPositiveInteger(rows)) {
    throw new RangeError(`Grid size must be positive integers, got ${cols}x${rows}`);
  }
  if (cols < MIN_GRID_SIZE || rows < MIN_GRID_SIZE) {
    throw new RangeError(`Grid must be at least ${MIN_GRID_SIZE}x${MIN_GRID_SIZE}`);
  }
  if (!(tickMs > 0)) {
    throw new RangeError(`tickMs must be greater than zero, got ${tickMs}`);
  }
  if (!isNonNegativeInteger(poisonCount) || !isNonNegativeInteger(trapCount)) {
    throw new RangeError('poisonCount and trapCount must be non-negative integers');
  }

  const reservedCells = 1 + SAFE_ZONE_LENGTH + SAFE_SIDE_CELLS;
  const itemCount = 1 + poisonCount + trapCount;
  if (cols * rows < reservedCells + itemCount) {
    throw new RangeError(`Grid ${cols}x${rows} is too small for ${itemCount} items`);
  }
}
