import { describe, expect, it } from 'vitest';
import { createTestState } from '../test/gameFactory';
import { MAX_QUEUED_INPUTS } from './config';
import { consumeInput, enqueueDirection } from './input';
import { step } from './step';
import type { GameStatus } from './types';

describe('enqueueDirection', () => {
  it('queues a perpendicular turn', () => {
    const state = enqueueDirection(createTestState({ direction: 'right' }), 'up');
    expect(state.inputQueue).toEqual(['up']);
  });

  it('rejects reversing onto the current direction', () => {
    const state = createTestState({ direction: 'right' });
    expect(enqueueDirection(state, 'left')).toBe(state);
  });

  it('ignores repeating the current direction', () => {
    const state = createTestState({ direction: 'right' });
    expect(enqueueDirection(state, 'right')).toBe(state);
  });

  it('validates against the last queued direction (regression: up + down reversed the snake)', () => {
    let state = createTestState({
      direction: 'right',
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
    });
    state = enqueueDirection(state, 'up');
    state = enqueueDirection(state, 'down');
    expect(state.inputQueue).toEqual(['up']);

    state = step(state).state;
    state = step(state).state;
    expect(state.status).toBe('running');
  });

  it('accepts a valid sequence of turns', () => {
    let state = createTestState({ direction: 'right' });
    state = enqueueDirection(state, 'up');
    state = enqueueDirection(state, 'left');
    state = enqueueDirection(state, 'down');
    expect(state.inputQueue).toEqual(['up', 'left', 'down']);
  });

  it(`keeps at most ${MAX_QUEUED_INPUTS} queued inputs`, () => {
    let state = createTestState({ direction: 'right' });
    for (const direction of ['up', 'left', 'down', 'right', 'up'] as const) {
      state = enqueueDirection(state, direction);
    }
    expect(state.inputQueue).toHaveLength(MAX_QUEUED_INPUTS);
  });

  it.each<GameStatus>(['ready', 'running'])('accepts input while %s', (status) => {
    const state = enqueueDirection(createTestState({ status }), 'up');
    expect(state.inputQueue).toEqual(['up']);
  });

  it.each<GameStatus>(['paused', 'over', 'won'])('ignores input while %s', (status) => {
    const state = createTestState({ status });
    expect(enqueueDirection(state, 'up')).toBe(state);
  });
});

describe('consumeInput', () => {
  it('keeps the current direction when the queue is empty', () => {
    expect(consumeInput(createTestState({ direction: 'down' }))).toEqual({
      direction: 'down',
      inputQueue: [],
    });
  });

  it('dequeues the next direction', () => {
    const state = createTestState({ direction: 'right', inputQueue: ['up', 'left'] });
    expect(consumeInput(state)).toEqual({ direction: 'up', inputQueue: ['left'] });
  });
});
