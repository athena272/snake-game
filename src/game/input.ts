import { MAX_QUEUED_INPUTS } from './config';
import { isOpposite } from './direction';
import type { Direction, GameState } from './types';

function acceptsInput(state: GameState): boolean {
  return state.status === 'ready' || state.status === 'running';
}

/**
 * Queues a turn. Each input is validated against the last *queued* direction,
 * so quick sequences (e.g. up + down while heading right) can never reverse
 * the snake onto itself.
 */
export function enqueueDirection(state: GameState, direction: Direction): GameState {
  if (!acceptsInput(state) || state.inputQueue.length >= MAX_QUEUED_INPUTS) {
    return state;
  }

  const lastDirection = state.inputQueue.at(-1) ?? state.direction;
  if (direction === lastDirection || isOpposite(direction, lastDirection)) {
    return state;
  }

  return { ...state, inputQueue: [...state.inputQueue, direction] };
}

export function consumeInput(state: GameState): Pick<GameState, 'direction' | 'inputQueue'> {
  const [nextDirection, ...remaining] = state.inputQueue;
  if (!nextDirection) {
    return { direction: state.direction, inputQueue: state.inputQueue };
  }
  return { direction: nextDirection, inputQueue: remaining };
}
