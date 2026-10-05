import { vi } from 'vitest';
import type { FrameScheduler } from '../engine/fixedStepLoop';
import type { GameView } from '../render/types';

export function createFakeView() {
  return {
    canvas: document.createElement('canvas'),
    render: vi.fn<GameView['render']>(),
    playEvents: vi.fn<GameView['playEvents']>(),
    resize: vi.fn<GameView['resize']>(),
    destroy: vi.fn<GameView['destroy']>(),
  } satisfies GameView;
}

/** Frames run only when the test calls `advance`, with a controllable clock. */
export function createManualScheduler() {
  let nextHandle = 1;
  let now = 0;
  const pending = new Map<number, (timestamp: number) => void>();

  const scheduler: FrameScheduler = {
    request(callback) {
      const handle = nextHandle++;
      pending.set(handle, callback);
      return handle;
    },
    cancel(handle) {
      pending.delete(handle);
    },
  };

  const frame = (): void => {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((callback) => {
      callback(now);
    });
  };

  /** Runs frames every `frameMs` until `ms` have elapsed. */
  const advance = (ms: number, frameMs = 16): void => {
    frame();
    const end = now + ms;
    while (now < end) {
      now = Math.min(end, now + frameMs);
      frame();
    }
  };

  return { scheduler, advance, pendingCount: () => pending.size };
}
