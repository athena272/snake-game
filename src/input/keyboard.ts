import type { Direction } from '../game';
import type { GameCommand } from './commands';

const turn = (direction: Direction): GameCommand => ({ type: 'turn', direction });
const PAUSE: GameCommand = { type: 'pause' };
const CONFIRM: GameCommand = { type: 'confirm' };
const TOGGLE_SOUND: GameCommand = { type: 'toggleSound' };

/**
 * Mapped by `KeyboardEvent.code` (physical key), so WASD keeps its position on
 * non-QWERTY layouts. HJKL follows the vim layout used by the original CLI.
 */
const COMMANDS_BY_CODE: Readonly<Record<string, GameCommand>> = {
  ArrowUp: turn('up'),
  ArrowDown: turn('down'),
  ArrowLeft: turn('left'),
  ArrowRight: turn('right'),
  KeyW: turn('up'),
  KeyS: turn('down'),
  KeyA: turn('left'),
  KeyD: turn('right'),
  KeyK: turn('up'),
  KeyJ: turn('down'),
  KeyH: turn('left'),
  KeyL: turn('right'),
  KeyP: PAUSE,
  Escape: PAUSE,
  Enter: CONFIRM,
  NumpadEnter: CONFIRM,
  Space: CONFIRM,
  KeyM: TOGGLE_SOUND,
};

export interface KeyInput {
  readonly code: string;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly altKey?: boolean;
}

export function mapKeyToCommand({ code, ctrlKey, metaKey, altKey }: KeyInput): GameCommand | null {
  if (ctrlKey || metaKey || altKey) return null;
  return COMMANDS_BY_CODE[code] ?? null;
}
