export { DEFAULT_CONFIG, MAX_QUEUED_INPUTS } from './config';
export { DIRECTION_VECTORS, isOpposite } from './direction';
export { enqueueDirection } from './input';
export { pointEquals, wrap } from './point';
export {
  createInitialState,
  getScore,
  isGameFinished,
  pauseGame,
  resumeGame,
  startGame,
  togglePause,
} from './state';
export { step } from './step';
export type {
  Direction,
  GameConfig,
  GameEvent,
  GameState,
  GameStatus,
  Point,
  StepResult,
} from './types';
