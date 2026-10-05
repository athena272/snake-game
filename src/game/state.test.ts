import { describe, expect, it } from 'vitest';
import { createTestState, TEST_CONFIG } from '../test/gameFactory';
import { DEFAULT_CONFIG } from './config';
import { containsPoint } from './point';
import {
  createInitialState,
  getScore,
  isGameFinished,
  pauseGame,
  resumeGame,
  startGame,
  togglePause,
} from './state';
import type { GameState, Point } from './types';

function itemsOf(state: GameState): Point[] {
  return [...state.traps, ...state.poisons, ...(state.apple ? [state.apple] : [])];
}

describe('createInitialState', () => {
  const state = createInitialState({ seed: 1 });

  it('uses the default 24x18 grid', () => {
    expect(state.config.cols).toBe(24);
    expect(state.config.rows).toBe(18);
  });

  it('starts with a single segment at (2,2) heading right, waiting to start', () => {
    expect(state.snake).toEqual([{ x: 2, y: 2 }]);
    expect(state.direction).toBe('right');
    expect(state.inputQueue).toEqual([]);
    expect(state.status).toBe('ready');
    expect(state.tick).toBe(0);
  });

  it('places 1 apple, 2 poisons and 2 traps', () => {
    expect(state.apple).not.toBeNull();
    expect(state.poisons).toHaveLength(DEFAULT_CONFIG.poisonCount);
    expect(state.traps).toHaveLength(DEFAULT_CONFIG.trapCount);
  });

  it('never overlaps items, the snake or the safe zone around the head', () => {
    const safeZone = [
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      // Side neighbours (regression: an immediate turn could hit a trap).
      { x: 2, y: 1 },
      { x: 2, y: 3 },
    ];
    for (let seed = 0; seed < 200; seed++) {
      const initial = createInitialState({ seed });
      const items = itemsOf(initial);
      expect(new Set(items.map(({ x, y }) => `${x},${y}`)).size).toBe(items.length);
      [...initial.snake, ...safeZone].forEach((reserved) => {
        expect(containsPoint(items, reserved)).toBe(false);
      });
    }
  });

  it('can spawn items on the last column and row (regression: old rnd skipped them)', () => {
    let reachedLastColumn = false;
    let reachedLastRow = false;
    for (let seed = 0; seed < 300; seed++) {
      itemsOf(createInitialState({ seed })).forEach(({ x, y }) => {
        reachedLastColumn ||= x === DEFAULT_CONFIG.cols - 1;
        reachedLastRow ||= y === DEFAULT_CONFIG.rows - 1;
      });
    }
    expect(reachedLastColumn).toBe(true);
    expect(reachedLastRow).toBe(true);
  });

  it('is deterministic for the same seed', () => {
    expect(createInitialState({ seed: 77 })).toEqual(createInitialState({ seed: 77 }));
  });

  it('accepts a custom config', () => {
    const custom = createInitialState({ seed: 3, config: { ...TEST_CONFIG, poisonCount: 1 } });
    expect(custom.config.cols).toBe(5);
    expect(custom.poisons).toHaveLength(1);
    expect(custom.traps).toHaveLength(0);
  });

  it('rejects an invalid config', () => {
    expect(() => createInitialState({ seed: 1, config: { ...TEST_CONFIG, cols: 0 } })).toThrow(
      RangeError,
    );
  });
});

describe('lifecycle', () => {
  it('starts only from ready', () => {
    expect(startGame(createTestState({ status: 'ready' })).status).toBe('running');
    const over = createTestState({ status: 'over' });
    expect(startGame(over)).toBe(over);
  });

  it('pauses and resumes', () => {
    const paused = pauseGame(createTestState({ status: 'running' }));
    expect(paused.status).toBe('paused');
    expect(resumeGame(paused).status).toBe('running');
  });

  it('toggles pause only while playing', () => {
    expect(togglePause(createTestState({ status: 'running' })).status).toBe('paused');
    expect(togglePause(createTestState({ status: 'paused' })).status).toBe('running');
    const ready = createTestState({ status: 'ready' });
    expect(togglePause(ready)).toBe(ready);
    const over = createTestState({ status: 'over' });
    expect(togglePause(over)).toBe(over);
  });

  it('reports finished games', () => {
    expect(isGameFinished(createTestState({ status: 'over' }))).toBe(true);
    expect(isGameFinished(createTestState({ status: 'won' }))).toBe(true);
    expect(isGameFinished(createTestState({ status: 'running' }))).toBe(false);
  });
});

describe('getScore', () => {
  it('is the snake length minus the initial segment', () => {
    expect(getScore(createTestState())).toBe(0);
    expect(
      getScore(
        createTestState({
          snake: [
            { x: 2, y: 2 },
            { x: 1, y: 2 },
            { x: 0, y: 2 },
          ],
        }),
      ),
    ).toBe(2);
  });
});
