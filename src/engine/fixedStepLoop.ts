export interface FrameScheduler {
  request(callback: (timestamp: number) => void): number;
  cancel(handle: number): void;
}

export interface FrameAdvance {
  /** Logic steps to run this frame. */
  readonly steps: number;
  readonly accumulator: number;
  /** Progress towards the next step in `[0, 1)`, used for render interpolation. */
  readonly alpha: number;
}

export interface FixedStepLoopOptions {
  readonly stepMs: number;
  readonly onStep: () => void;
  readonly onRender: (alpha: number) => void;
  /** Caps catch-up work after long frames (avoids the "spiral of death"). */
  readonly maxStepsPerFrame?: number;
  readonly scheduler?: FrameScheduler;
}

export interface FixedStepLoop {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export const DEFAULT_MAX_STEPS_PER_FRAME = 5;

export function advanceFrame(
  accumulator: number,
  elapsedMs: number,
  stepMs: number,
  maxSteps: number = DEFAULT_MAX_STEPS_PER_FRAME,
): FrameAdvance {
  let total = accumulator + Math.max(0, elapsedMs);
  let steps = Math.floor(total / stepMs);

  if (steps > maxSteps) {
    steps = maxSteps;
    total = steps * stepMs;
  }

  const remaining = total - steps * stepMs;
  return { steps, accumulator: remaining, alpha: remaining / stepMs };
}

const browserScheduler: FrameScheduler = {
  request: (callback) => window.requestAnimationFrame(callback),
  cancel: (handle) => {
    window.cancelAnimationFrame(handle);
  },
};

export function createFixedStepLoop({
  stepMs,
  onStep,
  onRender,
  maxStepsPerFrame = DEFAULT_MAX_STEPS_PER_FRAME,
  scheduler = browserScheduler,
}: FixedStepLoopOptions): FixedStepLoop {
  if (!(stepMs > 0)) {
    throw new RangeError(`stepMs must be greater than zero, got ${stepMs}`);
  }

  let handle: number | null = null;
  let lastTimestamp: number | null = null;
  let accumulator = 0;

  const frame = (timestamp: number): void => {
    const elapsed = lastTimestamp === null ? 0 : timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const advance = advanceFrame(accumulator, elapsed, stepMs, maxStepsPerFrame);
    accumulator = advance.accumulator;
    for (let i = 0; i < advance.steps; i++) {
      onStep();
    }
    onRender(advance.alpha);

    if (handle !== null) {
      handle = scheduler.request(frame);
    }
  };

  return {
    start() {
      if (handle !== null) return;
      lastTimestamp = null;
      accumulator = 0;
      handle = scheduler.request(frame);
    },
    stop() {
      if (handle === null) return;
      scheduler.cancel(handle);
      handle = null;
    },
    isRunning: () => handle !== null,
  };
}
