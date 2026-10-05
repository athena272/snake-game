import type { GameConfig, GameState } from '../game';

export const TEST_CONFIG: GameConfig = {
  cols: 5,
  rows: 5,
  tickMs: 100,
  poisonCount: 0,
  trapCount: 0,
};

/** A running game on a small empty board; override only what the scenario needs. */
export function createTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    config: TEST_CONFIG,
    snake: [{ x: 2, y: 2 }],
    direction: 'right',
    inputQueue: [],
    apple: { x: 0, y: 4 },
    poisons: [],
    traps: [],
    status: 'running',
    seed: 42,
    tick: 0,
    ...overrides,
  };
}

export function defined<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
}

export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) {
      deepFreeze(nested);
    }
  }
  return value;
}
