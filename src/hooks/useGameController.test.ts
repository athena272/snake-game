import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createInitialState, type GameConfig, type GameState } from '../game';
import { createFakeView, createManualScheduler } from '../test/fakes';
import type { RenderFrame } from '../render/types';
import { useGameController, type UseGameControllerOptions } from './useGameController';

const SMALL_CONFIG: GameConfig = { cols: 5, rows: 5, tickMs: 100, poisonCount: 0, trapCount: 1 };

/** Seed whose single trap sits on row 2, right in the snake's straight path. */
function findSeedWithTrapAhead(): number {
  for (let seed = 0; seed < 10_000; seed++) {
    const state = createInitialState({ seed, config: SMALL_CONFIG });
    if (state.traps[0]?.x === 1 && state.traps[0].y === 2 && state.apple?.y !== 2) return seed;
  }
  throw new Error('No suitable seed found');
}

function setup(options: Partial<UseGameControllerOptions> = {}) {
  const manual = createManualScheduler();
  const view = createFakeView();
  const onFinish = vi.fn();
  const hook = renderHook(() =>
    useGameController({
      config: SMALL_CONFIG,
      createSeed: () => 1,
      scheduler: manual.scheduler,
      onFinish,
      ...options,
    }),
  );
  act(() => {
    hook.result.current.attachView(view);
  });

  const lastFrame = (): RenderFrame => {
    const frame = view.render.mock.lastCall?.[0];
    if (!frame) throw new Error('Nothing rendered yet');
    return frame;
  };
  const current = (): GameState => lastFrame().current;
  const advance = (ms: number): void => {
    act(() => {
      manual.advance(ms);
    });
  };

  return { ...hook, ...manual, view, onFinish, advance, current, lastFrame };
}

describe('useGameController', () => {
  it('starts in the ready state and renders without advancing', () => {
    const { result, advance, current } = setup();
    advance(500);
    expect(result.current.snapshot).toEqual({ status: 'ready', score: 0 });
    expect(current().tick).toBe(0);
    expect(current().snake).toEqual([{ x: 2, y: 2 }]);
  });

  it('moves one cell per tick after starting', () => {
    const { result, advance, current } = setup();
    act(() => {
      result.current.actions.start();
    });
    advance(100);
    expect(result.current.snapshot.status).toBe('running');
    expect(current().snake[0]).toEqual({ x: 3, y: 2 });
  });

  it('passes interpolation data to the view', () => {
    const { result, advance, lastFrame } = setup();
    act(() => {
      result.current.actions.start();
    });
    advance(150);
    const frame = lastFrame();
    expect(frame.previous.snake[0]).toEqual({ x: 2, y: 2 });
    expect(frame.current.snake[0]).toEqual({ x: 3, y: 2 });
    expect(frame.alpha).toBeCloseTo(0.5);
  });

  it('starts the game on the first turn and applies it', () => {
    const { result, advance, current } = setup();
    act(() => {
      result.current.actions.turn('down');
    });
    advance(100);
    expect(result.current.snapshot.status).toBe('running');
    expect(current().snake[0]).toEqual({ x: 2, y: 3 });
  });

  it('freezes the game while paused', () => {
    const { result, advance, current } = setup();
    act(() => {
      result.current.actions.start();
      result.current.actions.togglePause();
    });
    advance(1000);
    expect(result.current.snapshot.status).toBe('paused');
    expect(current().tick).toBe(0);

    act(() => {
      result.current.actions.confirm();
    });
    advance(100);
    expect(current().tick).toBe(1);
  });

  it('pauses automatically when the tab is hidden', () => {
    const { result } = setup();
    act(() => {
      result.current.actions.start();
    });
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.snapshot.status).toBe('paused');
    hidden.mockRestore();
  });

  it('reports game over with the final score and plays the death event', () => {
    const seed = findSeedWithTrapAhead();
    const { result, advance, view, onFinish } = setup({ createSeed: () => seed });
    act(() => {
      result.current.actions.start();
    });
    advance(400);

    expect(result.current.snapshot.status).toBe('over');
    expect(onFinish).toHaveBeenCalledExactlyOnceWith(0, 'over');
    expect(view.playEvents).toHaveBeenCalledWith(['died'], expect.anything());
  });

  it('forwards tick events to onEvents alongside the view', () => {
    const seed = findSeedWithTrapAhead();
    const onEvents = vi.fn();
    const { result, advance, view } = setup({ createSeed: () => seed, onEvents });
    act(() => {
      result.current.actions.start();
    });
    advance(400);

    expect(onEvents).toHaveBeenCalledExactlyOnceWith(['died'], view.playEvents.mock.lastCall?.[1]);
  });

  it('does not call onEvents on ticks without events', () => {
    const onEvents = vi.fn();
    const { result, advance, current } = setup({ onEvents });
    act(() => {
      result.current.actions.start();
    });
    advance(100);

    expect(current().tick).toBe(1);
    expect(onEvents).not.toHaveBeenCalled();
  });

  it('restarts with a fresh running game', () => {
    const seed = findSeedWithTrapAhead();
    const { result, advance, current } = setup({ createSeed: () => seed });
    act(() => {
      result.current.actions.start();
    });
    advance(400);
    act(() => {
      result.current.actions.confirm();
    });
    advance(16);

    expect(result.current.snapshot.status).toBe('running');
    expect(current().snake).toEqual([{ x: 2, y: 2 }]);
  });

  it('stops the loop on unmount', () => {
    const { unmount, pendingCount } = setup();
    expect(pendingCount()).toBe(1);
    unmount();
    expect(pendingCount()).toBe(0);
  });
});
