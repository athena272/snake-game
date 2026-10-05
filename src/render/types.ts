import type { GameEvent, GameState } from '../game';
import type { BoardLayout } from './layout';

export interface RenderFrame {
  readonly previous: GameState;
  readonly current: GameState;
  /** Progress between `previous` and `current`, in `[0, 1)`. */
  readonly alpha: number;
  readonly timeMs: number;
}

/**
 * What the game controller needs from a renderer. Keeps React and the loop
 * independent from PixiJS (and lets tests use a fake view).
 */
export interface GameView {
  readonly canvas: HTMLCanvasElement;
  resize(layout: BoardLayout): void;
  render(frame: RenderFrame): void;
  playEvents(events: readonly GameEvent[], state: GameState): void;
  destroy(): void;
}
