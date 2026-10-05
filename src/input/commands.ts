import type { Direction } from '../game';

export type GameCommand =
  | { readonly type: 'turn'; readonly direction: Direction }
  | { readonly type: 'pause' }
  | { readonly type: 'confirm' }
  | { readonly type: 'toggleSound' };
