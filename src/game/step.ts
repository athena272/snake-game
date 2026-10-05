import { DIRECTION_VECTORS } from './direction';
import { consumeInput } from './input';
import { containsPoint, indexOfPoint, pointEquals, translate, wrapPoint } from './point';
import { spawnItem } from './spawn';
import type { GameState, Point, StepResult } from './types';

function die(state: GameState, extraEvents: StepResult['events'] = []): StepResult {
  return {
    state: { ...state, status: 'over', inputQueue: [], tick: state.tick + 1 },
    events: [...extraEvents, 'died'],
  };
}

function replaceAt(points: readonly Point[], index: number, value: Point): Point[] {
  return points.map((point, i) => (i === index ? value : point));
}

/**
 * Advances the game by one tick. Pure: the same state always yields the same
 * result, and the input state is never mutated.
 */
export function step(state: GameState): StepResult {
  if (state.status !== 'running') {
    return { state, events: [] };
  }

  const head = state.snake[0];
  if (!head) {
    throw new Error('Invariant violated: running game with an empty snake');
  }

  const { cols, rows } = state.config;
  const { direction, inputQueue } = consumeInput(state);
  const nextHead = wrapPoint(translate(head, DIRECTION_VECTORS[direction]), cols, rows);
  const moved: GameState = { ...state, direction, inputQueue };

  if (containsPoint(state.traps, nextHead) || containsPoint(state.snake, nextHead)) {
    return die(moved);
  }

  const poisonIndex = indexOfPoint(state.poisons, nextHead);
  if (poisonIndex >= 0) {
    const shrunk = [nextHead, ...state.snake].slice(0, state.snake.length - 1);
    if (shrunk.length === 0) {
      return die(moved, ['poisoned']);
    }

    const otherPoisons = state.poisons.filter((_, i) => i !== poisonIndex);
    const occupied = [
      ...shrunk,
      ...state.traps,
      ...otherPoisons,
      ...(state.apple ? [state.apple] : []),
    ];
    const relocated = spawnItem(state.config, occupied, state.seed);

    return {
      state: {
        ...moved,
        snake: shrunk,
        poisons: relocated.value
          ? replaceAt(state.poisons, poisonIndex, relocated.value)
          : otherPoisons,
        seed: relocated.seed,
        tick: state.tick + 1,
      },
      events: ['poisoned'],
    };
  }

  if (state.apple && pointEquals(state.apple, nextHead)) {
    const grown = [nextHead, ...state.snake];
    const occupied = [...grown, ...state.traps, ...state.poisons];
    const apple = spawnItem(state.config, occupied, state.seed);
    const won = apple.value === null;

    return {
      state: {
        ...moved,
        snake: grown,
        apple: apple.value,
        seed: apple.seed,
        status: won ? 'won' : 'running',
        tick: state.tick + 1,
      },
      events: won ? ['ate', 'won'] : ['ate'],
    };
  }

  return {
    state: {
      ...moved,
      snake: [nextHead, ...state.snake.slice(0, -1)],
      tick: state.tick + 1,
    },
    events: [],
  };
}
