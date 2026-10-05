import { describe, expect, it } from 'vitest';
import type { GameCommand } from './commands';
import { mapKeyToCommand } from './keyboard';

describe('mapKeyToCommand', () => {
  it.each<[string, GameCommand]>([
    ['ArrowUp', { type: 'turn', direction: 'up' }],
    ['ArrowDown', { type: 'turn', direction: 'down' }],
    ['ArrowLeft', { type: 'turn', direction: 'left' }],
    ['ArrowRight', { type: 'turn', direction: 'right' }],
    ['KeyW', { type: 'turn', direction: 'up' }],
    ['KeyA', { type: 'turn', direction: 'left' }],
    ['KeyS', { type: 'turn', direction: 'down' }],
    ['KeyD', { type: 'turn', direction: 'right' }],
    ['KeyH', { type: 'turn', direction: 'left' }],
    ['KeyJ', { type: 'turn', direction: 'down' }],
    ['KeyK', { type: 'turn', direction: 'up' }],
    ['KeyL', { type: 'turn', direction: 'right' }],
    ['KeyP', { type: 'pause' }],
    ['Escape', { type: 'pause' }],
    ['Enter', { type: 'confirm' }],
    ['Space', { type: 'confirm' }],
    ['KeyM', { type: 'toggleSound' }],
  ])('maps %s', (code, expected) => {
    expect(mapKeyToCommand({ code })).toEqual(expected);
  });

  it('ignores unmapped keys', () => {
    expect(mapKeyToCommand({ code: 'KeyQ' })).toBeNull();
  });

  it('ignores shortcuts with modifiers (e.g. Ctrl+W, Cmd+R)', () => {
    expect(mapKeyToCommand({ code: 'KeyW', ctrlKey: true })).toBeNull();
    expect(mapKeyToCommand({ code: 'KeyD', metaKey: true })).toBeNull();
    expect(mapKeyToCommand({ code: 'ArrowLeft', altKey: true })).toBeNull();
    expect(mapKeyToCommand({ code: 'KeyM', ctrlKey: true })).toBeNull();
  });
});
