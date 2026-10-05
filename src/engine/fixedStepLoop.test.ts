import { describe, expect, it, vi } from 'vitest';
import { advanceFrame, createFixedStepLoop, type FrameScheduler } from './fixedStepLoop';

/** Manual scheduler: frames only run when the test calls `flush`. */
function createManualScheduler() {
  let nextHandle = 1;
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

  const flush = (timestamp: number): void => {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((callback) => {
      callback(timestamp);
    });
  };

  return { scheduler, flush, pendingCount: () => pending.size };
}

describe('advanceFrame', () => {
  it('accumulates time without stepping before a full step', () => {
    expect(advanceFrame(0, 40, 100)).toEqual({ steps: 0, accumulator: 40, alpha: 0.4 });
  });

  it('runs one step and keeps the remainder', () => {
    expect(advanceFrame(80, 40, 100)).toEqual({ steps: 1, accumulator: 20, alpha: 0.2 });
  });

  it('runs several steps for long frames', () => {
    expect(advanceFrame(0, 350, 100)).toEqual({ steps: 3, accumulator: 50, alpha: 0.5 });
  });

  it('caps the number of steps and drops the backlog', () => {
    expect(advanceFrame(0, 10_000, 100, 5)).toEqual({ steps: 5, accumulator: 0, alpha: 0 });
  });

  it('ignores negative elapsed time', () => {
    expect(advanceFrame(30, -50, 100)).toEqual({ steps: 0, accumulator: 30, alpha: 0.3 });
  });
});

describe('createFixedStepLoop', () => {
  function setup() {
    const manual = createManualScheduler();
    const onStep = vi.fn();
    const onRender = vi.fn();
    const loop = createFixedStepLoop({
      stepMs: 100,
      onStep,
      onRender,
      scheduler: manual.scheduler,
    });
    return { ...manual, onStep, onRender, loop };
  }

  it('steps at a fixed rate and renders every frame with alpha', () => {
    const { loop, flush, onStep, onRender } = setup();
    loop.start();

    flush(1000);
    expect(onStep).not.toHaveBeenCalled();
    expect(onRender).toHaveBeenLastCalledWith(0);

    flush(1016);
    flush(1032);
    expect(onStep).not.toHaveBeenCalled();
    expect(onRender).toHaveBeenLastCalledWith(0.32);

    flush(1100);
    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onRender).toHaveBeenCalledTimes(4);

    flush(1350);
    expect(onStep).toHaveBeenCalledTimes(3);
    expect(onRender).toHaveBeenLastCalledWith(0.5);
  });

  it('stops scheduling frames after stop()', () => {
    const { loop, flush, pendingCount, onRender } = setup();
    loop.start();
    flush(0);
    loop.stop();

    expect(loop.isRunning()).toBe(false);
    expect(pendingCount()).toBe(0);
    flush(100);
    expect(onRender).toHaveBeenCalledTimes(1);
  });

  it('does not double-schedule when started twice', () => {
    const { loop, pendingCount } = setup();
    loop.start();
    loop.start();
    expect(pendingCount()).toBe(1);
  });

  it('resets timing on restart so paused time is not replayed', () => {
    const { loop, flush, onStep } = setup();
    loop.start();
    flush(0);
    loop.stop();

    loop.start();
    flush(60_000);
    flush(60_050);
    expect(onStep).not.toHaveBeenCalled();
  });

  it('rejects a non-positive step', () => {
    expect(() => createFixedStepLoop({ stepMs: 0, onStep: vi.fn(), onRender: vi.fn() })).toThrow(
      RangeError,
    );
  });
});
