import { describe, expect, it } from 'vitest';
import { createTestState, deepFreeze, defined, TEST_CONFIG } from '../test/gameFactory';
import { containsPoint } from './point';
import { freeCells } from './spawn';
import { createInitialState, startGame } from './state';
import { step } from './step';
import type { Direction, GameState, GameStatus, Point } from './types';

const horizontalSnake: Point[] = [
  { x: 2, y: 2 },
  { x: 1, y: 2 },
  { x: 0, y: 2 },
];

describe('step', () => {
  describe('status', () => {
    it.each<GameStatus>(['ready', 'paused', 'over', 'won'])('does nothing while %s', (status) => {
      const state = createTestState({ status });
      expect(step(state)).toEqual({ state, events: [] });
    });

    it('increments the tick counter', () => {
      expect(step(createTestState()).state.tick).toBe(1);
    });
  });

  describe('movement', () => {
    it.each<[Direction, Point]>([
      ['up', { x: 2, y: 1 }],
      ['down', { x: 2, y: 3 }],
      ['left', { x: 1, y: 2 }],
      ['right', { x: 3, y: 2 }],
    ])('moves the head %s', (direction, expectedHead) => {
      const { state } = step(createTestState({ direction }));
      expect(state.snake[0]).toEqual(expectedHead);
    });

    it('keeps the length and drops the tail on a regular move', () => {
      const { state } = step(createTestState({ snake: horizontalSnake }));
      expect(state.snake).toEqual([
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ]);
    });

    it('applies a queued turn on the very next tick', () => {
      const { state } = step(createTestState({ direction: 'right', inputQueue: ['up'] }));
      expect(state.snake[0]).toEqual({ x: 2, y: 1 });
      expect(state.direction).toBe('up');
      expect(state.inputQueue).toEqual([]);
    });
  });

  describe('wrapping through the borders', () => {
    it.each<[Direction, Point, Point]>([
      ['right', { x: 4, y: 1 }, { x: 0, y: 1 }],
      ['left', { x: 0, y: 1 }, { x: 4, y: 1 }],
      ['down', { x: 1, y: 4 }, { x: 1, y: 0 }],
      ['up', { x: 1, y: 0 }, { x: 1, y: 4 }],
    ])('heading %s from %o reappears at %o', (direction, head, expected) => {
      const { state, events } = step(createTestState({ direction, snake: [head] }));
      expect(state.snake[0]).toEqual(expected);
      expect(state.status).toBe('running');
      expect(events).toEqual([]);
    });
  });

  describe('apple', () => {
    it('grows by one and emits "ate"', () => {
      const { state, events } = step(
        createTestState({ snake: horizontalSnake, apple: { x: 3, y: 2 } }),
      );
      expect(state.snake).toEqual([{ x: 3, y: 2 }, ...horizontalSnake]);
      expect(events).toEqual(['ate']);
    });

    it('respawns the apple outside the snake and the obstacles', () => {
      for (let seed = 0; seed < 50; seed++) {
        const { state } = step(
          createTestState({
            seed,
            snake: horizontalSnake,
            apple: { x: 3, y: 2 },
            poisons: [{ x: 0, y: 0 }],
            traps: [{ x: 4, y: 4 }],
          }),
        );
        const occupied = [...state.snake, ...state.poisons, ...state.traps];
        expect(containsPoint(occupied, defined(state.apple))).toBe(false);
      }
    });

    it('wins when there is no free cell left for a new apple', () => {
      const apple = { x: 4, y: 4 };
      const head = { x: 3, y: 4 };
      const body = [head, ...freeCells(TEST_CONFIG, [apple, head])];
      const { state, events } = step(createTestState({ snake: body, direction: 'right', apple }));
      expect(state.status).toBe('won');
      expect(state.apple).toBeNull();
      expect(events).toEqual(['ate', 'won']);
    });
  });

  describe('poison', () => {
    it('shrinks by one, relocates the poison and emits "poisoned"', () => {
      const poison = { x: 3, y: 2 };
      const { state, events } = step(
        createTestState({ snake: horizontalSnake, poisons: [poison, { x: 0, y: 0 }] }),
      );
      expect(state.snake).toEqual([
        { x: 3, y: 2 },
        { x: 2, y: 2 },
      ]);
      expect(events).toEqual(['poisoned']);
      expect(state.status).toBe('running');
      expect(state.poisons).toHaveLength(2);
      expect(state.poisons[1]).toEqual({ x: 0, y: 0 });
      expect(containsPoint(state.snake, defined(state.poisons[0]))).toBe(false);
      expect(state.poisons[0]).not.toEqual(state.apple);
      expect(state.poisons[0]).not.toEqual({ x: 0, y: 0 });
    });

    it('ends the game when a single-segment snake is poisoned', () => {
      const snake = [{ x: 2, y: 2 }];
      const { state, events } = step(createTestState({ snake, poisons: [{ x: 3, y: 2 }] }));
      expect(state.status).toBe('over');
      expect(events).toEqual(['poisoned', 'died']);
      expect(state.snake).toEqual(snake);
    });
  });

  describe('collisions', () => {
    it('dies immediately on a trap', () => {
      const { state, events } = step(
        createTestState({ snake: horizontalSnake, traps: [{ x: 3, y: 2 }] }),
      );
      expect(state.status).toBe('over');
      expect(events).toEqual(['died']);
      expect(state.snake).toEqual(horizontalSnake);
    });

    it('dies when hitting its own body', () => {
      const coiled: Point[] = [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
      ];
      const { state, events } = step(createTestState({ snake: coiled, direction: 'left' }));
      expect(state.status).toBe('over');
      expect(events).toEqual(['died']);
    });

    it('dies when the head wraps around into its own body', () => {
      const snake: Point[] = [
        { x: 4, y: 0 },
        { x: 3, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ];
      const { state } = step(createTestState({ snake, direction: 'right' }));
      expect(state.status).toBe('over');
    });

    it('clears pending inputs on game over', () => {
      const { state } = step(createTestState({ traps: [{ x: 2, y: 1 }], inputQueue: ['up'] }));
      expect(state.status).toBe('over');
      expect(state.inputQueue).toEqual([]);
    });
  });

  describe('purity', () => {
    it('never mutates the input state', () => {
      const state = deepFreeze(
        createTestState({
          snake: horizontalSnake,
          apple: { x: 3, y: 2 },
          poisons: [{ x: 0, y: 0 }],
          inputQueue: ['up'],
        }),
      );
      const snapshot = structuredClone(state);
      expect(() => step(state)).not.toThrow();
      expect(state).toEqual(snapshot);
    });

    it('produces the same game for the same seed', () => {
      const play = (initial: GameState): GameState => {
        let state = startGame(initial);
        for (let i = 0; i < 40; i++) {
          state = step(state).state;
        }
        return state;
      };
      expect(play(createInitialState({ seed: 9 }))).toEqual(play(createInitialState({ seed: 9 })));
    });
  });
});
