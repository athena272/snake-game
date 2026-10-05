import {
  DEFAULT_CONFIG,
  INITIAL_DIRECTION,
  INITIAL_HEAD,
  SAFE_ZONE_LENGTH,
  validateConfig,
} from './config';
import { DIRECTION_VECTORS } from './direction';
import { wrapPoint } from './point';
import { spawnItem, spawnItems } from './spawn';
import type { GameConfig, GameState, Point } from './types';

export interface CreateInitialStateOptions {
  readonly seed: number;
  readonly config?: GameConfig;
}

function offsetFromHead(delta: Point, distance: number, config: GameConfig): Point {
  return wrapPoint(
    { x: INITIAL_HEAD.x + delta.x * distance, y: INITIAL_HEAD.y + delta.y * distance },
    config.cols,
    config.rows,
  );
}

function safeZone(config: GameConfig): Point[] {
  const ahead = DIRECTION_VECTORS[INITIAL_DIRECTION];
  const side = { x: ahead.y, y: ahead.x };
  const cellsAhead = Array.from({ length: SAFE_ZONE_LENGTH }, (_, index) =>
    offsetFromHead(ahead, index + 1, config),
  );
  return [...cellsAhead, offsetFromHead(side, 1, config), offsetFromHead(side, -1, config)];
}

export function createInitialState({
  seed,
  config = DEFAULT_CONFIG,
}: CreateInitialStateOptions): GameState {
  validateConfig(config);

  const snake = [INITIAL_HEAD];
  const reserved = [...snake, ...safeZone(config)];

  const traps = spawnItems(config, reserved, config.trapCount, seed >>> 0);
  const poisons = spawnItems(config, [...reserved, ...traps.value], config.poisonCount, traps.seed);
  const apple = spawnItem(config, [...reserved, ...traps.value, ...poisons.value], poisons.seed);

  return {
    config,
    snake,
    direction: INITIAL_DIRECTION,
    inputQueue: [],
    apple: apple.value,
    poisons: poisons.value,
    traps: traps.value,
    status: 'ready',
    seed: apple.seed,
    tick: 0,
  };
}

export function startGame(state: GameState): GameState {
  return state.status === 'ready' ? { ...state, status: 'running' } : state;
}

export function pauseGame(state: GameState): GameState {
  return state.status === 'running' ? { ...state, status: 'paused' } : state;
}

export function resumeGame(state: GameState): GameState {
  return state.status === 'paused' ? { ...state, status: 'running' } : state;
}

export function togglePause(state: GameState): GameState {
  return state.status === 'paused' ? resumeGame(state) : pauseGame(state);
}

/** Same scoring as the original CLI: snake length minus the initial segment. */
export function getScore(state: GameState): number {
  return Math.max(0, state.snake.length - 1);
}

export function isGameFinished(state: GameState): boolean {
  return state.status === 'over' || state.status === 'won';
}
