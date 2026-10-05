import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardControls, type CommandActions } from './useKeyboardControls';

function setup() {
  const actions = {
    turn: vi.fn<CommandActions['turn']>(),
    togglePause: vi.fn<CommandActions['togglePause']>(),
    confirm: vi.fn<CommandActions['confirm']>(),
  };
  const hook = renderHook(() => {
    useKeyboardControls(actions);
  });
  return { ...hook, actions };
}

describe('useKeyboardControls', () => {
  it('turns with arrows and WASD', () => {
    const { actions } = setup();
    fireEvent.keyDown(window, { code: 'ArrowUp' });
    fireEvent.keyDown(window, { code: 'KeyD' });
    expect(actions.turn).toHaveBeenNthCalledWith(1, 'up');
    expect(actions.turn).toHaveBeenNthCalledWith(2, 'right');
  });

  it('toggles pause with P and Escape', () => {
    const { actions } = setup();
    fireEvent.keyDown(window, { code: 'KeyP' });
    fireEvent.keyDown(window, { code: 'Escape' });
    expect(actions.togglePause).toHaveBeenCalledTimes(2);
  });

  it('confirms with Enter and Space', () => {
    const { actions } = setup();
    fireEvent.keyDown(window, { code: 'Enter' });
    fireEvent.keyDown(window, { code: 'Space' });
    expect(actions.confirm).toHaveBeenCalledTimes(2);
  });

  it('prevents page scrolling for game keys', () => {
    setup();
    const event = new KeyboardEvent('keydown', { code: 'ArrowDown', cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores auto-repeat for pause so holding P does not flicker', () => {
    const { actions } = setup();
    fireEvent.keyDown(window, { code: 'KeyP', repeat: true });
    expect(actions.togglePause).not.toHaveBeenCalled();
  });

  it('lets a focused button handle Enter natively (no double action)', () => {
    const { actions } = setup();
    const button = document.createElement('button');
    document.body.appendChild(button);
    fireEvent.keyDown(button, { code: 'Enter' });
    expect(actions.confirm).not.toHaveBeenCalled();
    button.remove();
  });

  it('removes the listener on unmount', () => {
    const { actions, unmount } = setup();
    unmount();
    fireEvent.keyDown(window, { code: 'ArrowUp' });
    expect(actions.turn).not.toHaveBeenCalled();
  });
});
