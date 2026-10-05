import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createFixedStepLoop, type FrameScheduler } from '../engine/fixedStepLoop';
import {
  createInitialState,
  DEFAULT_CONFIG,
  enqueueDirection,
  getScore,
  isGameFinished,
  pauseGame,
  startGame,
  step,
  togglePause as toggleGamePause,
  type Direction,
  type GameConfig,
  type GameEvent,
  type GameState,
  type GameStatus,
} from '../game';
import type { GameView } from '../render/types';
import { createRandomSeed } from '../services/seed';

export interface GameSnapshot {
  readonly status: GameStatus;
  readonly score: number;
}

export interface GameActions {
  readonly start: () => void;
  readonly restart: () => void;
  readonly togglePause: () => void;
  readonly turn: (direction: Direction) => void;
  /** Context action for Enter/Space: start, resume or play again. */
  readonly confirm: () => void;
}

export interface UseGameControllerOptions {
  readonly config?: GameConfig;
  readonly createSeed?: () => number;
  readonly scheduler?: FrameScheduler;
  readonly onFinish?: (score: number, status: GameStatus) => void;
  /** Called after the view with every tick that produced events (e.g. to play sounds). */
  readonly onEvents?: (events: readonly GameEvent[], state: GameState) => void;
}

export interface GameController {
  readonly config: GameConfig;
  readonly snapshot: GameSnapshot;
  readonly actions: GameActions;
  readonly attachView: (view: GameView | null) => void;
}

function toSnapshot(state: GameState): GameSnapshot {
  return { status: state.status, score: getScore(state) };
}

/**
 * Owns the game state and the loop. The state lives in refs so the 60 fps
 * render path never re-renders React; only status/score changes do.
 */
export function useGameController({
  config = DEFAULT_CONFIG,
  createSeed = createRandomSeed,
  scheduler,
  onFinish,
  onEvents,
}: UseGameControllerOptions = {}): GameController {
  const [initialState] = useState(() => createInitialState({ seed: createSeed(), config }));
  const currentRef = useRef(initialState);
  const previousRef = useRef(initialState);
  const [snapshot, setSnapshot] = useState(() => toSnapshot(initialState));
  const [view, setView] = useState<GameView | null>(null);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const onEventsRef = useRef(onEvents);
  useEffect(() => {
    onEventsRef.current = onEvents;
  }, [onEvents]);

  const syncSnapshot = useCallback(() => {
    const next = toSnapshot(currentRef.current);
    setSnapshot((prev) => (prev.status === next.status && prev.score === next.score ? prev : next));
  }, []);

  const update = useCallback(
    (transform: (state: GameState) => GameState) => {
      const next = transform(currentRef.current);
      if (next === currentRef.current) return;
      currentRef.current = next;
      syncSnapshot();
    },
    [syncSnapshot],
  );

  useEffect(() => {
    if (!view) return;

    const loop = createFixedStepLoop({
      stepMs: config.tickMs,
      scheduler,
      onStep: () => {
        const before = currentRef.current;
        const { state, events } = step(before);
        previousRef.current = before;
        currentRef.current = state;
        if (state === before) return;

        if (events.length > 0) {
          view.playEvents(events, state);
          onEventsRef.current?.(events, state);
        }
        syncSnapshot();
        if (!isGameFinished(before) && isGameFinished(state)) {
          onFinishRef.current?.(getScore(state), state.status);
        }
      },
      onRender: (alpha) => {
        view.render({
          previous: previousRef.current,
          current: currentRef.current,
          alpha,
          timeMs: performance.now(),
        });
      },
    });

    loop.start();
    return () => {
      loop.stop();
    };
  }, [view, config.tickMs, scheduler, syncSnapshot]);

  useEffect(() => {
    const handleVisibility = (): void => {
      if (document.hidden) update(pauseGame);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [update]);

  const actions = useMemo<GameActions>(() => {
    const restart = (): void => {
      const fresh = startGame(createInitialState({ seed: createSeed(), config }));
      previousRef.current = fresh;
      currentRef.current = fresh;
      syncSnapshot();
    };

    return {
      start: () => {
        update(startGame);
      },
      restart,
      togglePause: () => {
        update(toggleGamePause);
      },
      turn: (direction) => {
        update((state) =>
          enqueueDirection(state.status === 'ready' ? startGame(state) : state, direction),
        );
      },
      confirm: () => {
        const { status } = currentRef.current;
        if (status === 'ready') update(startGame);
        else if (status === 'paused') update(toggleGamePause);
        else if (status === 'over' || status === 'won') restart();
      },
    };
  }, [config, createSeed, syncSnapshot, update]);

  return { config, snapshot, actions, attachView: setView };
}
