/** Built-in oscillator shapes (`custom` would require a `PeriodicWave`). */
export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface Tone {
  readonly waveform: Waveform;
  readonly fromHz: number;
  /** Frequency reached at the end of the tone; omit for a steady pitch. */
  readonly toHz?: number;
  /** Delay from the moment the cue is played. */
  readonly startMs: number;
  readonly durationMs: number;
  /** Peak gain in `(0, 1]`, before the master volume. */
  readonly volume: number;
}

/** Tones played together as a single sound effect. */
export type SoundCue = readonly Tone[];

/**
 * What the app needs from an audio backend. Keeps React independent from the
 * Web Audio API (and lets tests use a fake player).
 */
export interface SoundPlayer {
  /** Starts the audio output. Browsers only allow it during a user gesture. */
  unlock(): void;
  play(cue: SoundCue): void;
  destroy(): void;
}
