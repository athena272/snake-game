import type { GameEvent } from '../game';
import type { SoundCue, Tone } from './types';

/** C major arpeggio: C5, E5, G5, C6. */
const VICTORY_NOTES_HZ = [523.25, 659.25, 783.99, 1046.5];
const VICTORY_NOTE_MS = 90;
const VICTORY_LAST_NOTE_MS = 280;

const victoryCue: SoundCue = VICTORY_NOTES_HZ.map((hz, index): Tone => ({
  waveform: 'square',
  fromHz: hz,
  startMs: index * VICTORY_NOTE_MS,
  durationMs: index === VICTORY_NOTES_HZ.length - 1 ? VICTORY_LAST_NOTE_MS : VICTORY_NOTE_MS,
  volume: 0.45,
}));

export const SOUND_CUES: Readonly<Record<GameEvent, SoundCue>> = {
  ate: [{ waveform: 'square', fromHz: 660, toHz: 990, startMs: 0, durationMs: 70, volume: 0.5 }],
  poisoned: [
    { waveform: 'triangle', fromHz: 440, toHz: 196, startMs: 0, durationMs: 160, volume: 0.9 },
  ],
  died: [{ waveform: 'sawtooth', fromHz: 330, toHz: 82, startMs: 0, durationMs: 420, volume: 0.6 }],
  won: victoryCue,
};

/** Most important first: a single tick can emit `['poisoned', 'died']` or `['ate', 'won']`. */
const EVENT_PRIORITY: readonly GameEvent[] = ['won', 'died', 'poisoned', 'ate'];

/** The one sound that represents a tick, so overlapping cues never play at once. */
export function pickEventSound(events: readonly GameEvent[]): SoundCue | null {
  const event = EVENT_PRIORITY.find((candidate) => events.includes(candidate));
  return event ? SOUND_CUES[event] : null;
}
