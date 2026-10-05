export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameStatus = 'ready' | 'running' | 'paused' | 'over' | 'won';

export type GameEvent = 'ate' | 'poisoned' | 'died' | 'won';

export interface GameConfig {
  readonly cols: number;
  readonly rows: number;
  readonly tickMs: number;
  readonly poisonCount: number;
  readonly trapCount: number;
}

export interface GameState {
  readonly config: GameConfig;
  /** Head first. Never empty: on death the last snake is kept so it can be rendered. */
  readonly snake: readonly Point[];
  readonly direction: Direction;
  readonly inputQueue: readonly Direction[];
  /** `null` only when the board is full (victory). */
  readonly apple: Point | null;
  readonly poisons: readonly Point[];
  readonly traps: readonly Point[];
  readonly status: GameStatus;
  readonly seed: number;
  readonly tick: number;
}

export interface StepResult {
  readonly state: GameState;
  readonly events: readonly GameEvent[];
}
