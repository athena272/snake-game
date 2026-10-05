import { vi } from 'vitest';
import type { SoundPlayer } from '../audio/types';
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

export function createFakeSoundPlayer() {
  return {
    unlock: vi.fn<SoundPlayer['unlock']>(),
    play: vi.fn<SoundPlayer['play']>(),
    destroy: vi.fn<SoundPlayer['destroy']>(),
  } satisfies SoundPlayer;
}

function createFakeAudioParam() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

function createFakeAudioNode() {
  return { connect: vi.fn(), disconnect: vi.fn() };
}

/** Minimal Web Audio stand-in: jsdom does not implement `AudioContext`. */
export function createFakeAudioContext(initialState: AudioContextState = 'suspended') {
  const oscillators: ReturnType<typeof createOscillator>[] = [];

  function createOscillator() {
    return {
      ...createFakeAudioNode(),
      type: 'sine' as OscillatorType,
      frequency: createFakeAudioParam(),
      onended: null as (() => void) | null,
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  const fake = {
    state: initialState,
    currentTime: 0,
    destination: createFakeAudioNode(),
    oscillators,
    resume: vi.fn((): Promise<void> => {
      fake.state = 'running';
      return Promise.resolve();
    }),
    close: vi.fn((): Promise<void> => {
      fake.state = 'closed';
      return Promise.resolve();
    }),
    createGain: vi.fn(() => ({ ...createFakeAudioNode(), gain: createFakeAudioParam() })),
    createOscillator: vi.fn(() => {
      const oscillator = createOscillator();
      oscillators.push(oscillator);
      return oscillator;
    }),
  };

  return {
    fake,
    /** Typed as the real thing for code under test; only the members above exist. */
    factory: vi.fn(() => fake as unknown as AudioContext),
  };
}
