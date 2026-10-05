import { useCallback, useEffect, useRef } from 'react';
import { pickEventSound } from '../audio/cues';
import type { SoundPlayer } from '../audio/types';
import { createWebAudioPlayer } from '../audio/webAudioPlayer';
import type { GameEvent } from '../game';

/**
 * Gestures that browsers accept to start audio. Touch only counts on release,
 * hence `pointerup`. Kept for the whole session because mobile browsers may
 * suspend the audio again (e.g. after a phone call).
 */
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'keydown'] as const;
const LISTENER_OPTIONS: AddEventListenerOptions = { capture: true, passive: true };

export interface GameSounds {
  readonly playEvents: (events: readonly GameEvent[]) => void;
}

/** Plays the sound effect of each tick while `enabled`. */
export function useGameSounds(
  enabled: boolean,
  createPlayer: () => SoundPlayer = createWebAudioPlayer,
): GameSounds {
  const playerRef = useRef<SoundPlayer | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const player = createPlayer();
    playerRef.current = player;
    const unlock = (): void => {
      player.unlock();
    };

    for (const type of UNLOCK_EVENTS) window.addEventListener(type, unlock, LISTENER_OPTIONS);
    return () => {
      for (const type of UNLOCK_EVENTS) window.removeEventListener(type, unlock, LISTENER_OPTIONS);
      player.destroy();
      playerRef.current = null;
    };
  }, [createPlayer]);

  const playEvents = useCallback((events: readonly GameEvent[]) => {
    if (!enabledRef.current) return;
    const cue = pickEventSound(events);
    if (cue) playerRef.current?.play(cue);
  }, []);

  return { playEvents };
}
