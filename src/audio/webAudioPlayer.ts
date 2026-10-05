import type { SoundPlayer, Tone } from './types';

export type AudioContextFactory = () => AudioContext;

const MASTER_VOLUME = 0.15;
const ATTACK_SECONDS = 0.005;
/** Exponential ramps cannot reach 0, so envelopes fade to this inaudible level. */
const SILENT_GAIN = 0.0001;

function createBrowserAudioContext(): AudioContext {
  return new AudioContext();
}

function ignoreError(): void {
  // Audio is optional: a failure here only means the game stays silent.
}

function scheduleTone(
  context: AudioContext,
  output: AudioNode,
  tone: Tone,
  cueStart: number,
): void {
  const start = cueStart + tone.startMs / 1000;
  const end = start + tone.durationMs / 1000;

  const oscillator = context.createOscillator();
  oscillator.type = tone.waveform;
  oscillator.frequency.setValueAtTime(tone.fromHz, start);
  if (tone.toHz !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(tone.toHz, end);
  }

  // A short attack and an exponential release avoid audible clicks.
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(SILENT_GAIN, start);
  envelope.gain.exponentialRampToValueAtTime(tone.volume, start + ATTACK_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(SILENT_GAIN, end);

  oscillator.connect(envelope);
  envelope.connect(output);
  oscillator.onended = () => {
    oscillator.disconnect();
    envelope.disconnect();
  };
  oscillator.start(start);
  oscillator.stop(end);
}

/**
 * Synthesised sound effects: no files to download, so nothing to wait for.
 * The context is only created on `unlock()` (browser autoplay policy) and
 * every failure degrades to silence instead of throwing.
 */
export function createWebAudioPlayer(
  createContext: AudioContextFactory = createBrowserAudioContext,
): SoundPlayer {
  let context: AudioContext | null = null;
  let output: GainNode | null = null;
  let unavailable = false;
  let destroyed = false;

  const ensureContext = (): AudioContext | null => {
    if (context || unavailable || destroyed) return context;
    try {
      const created = createContext();
      const master = created.createGain();
      master.gain.value = MASTER_VOLUME;
      master.connect(created.destination);
      context = created;
      output = master;
    } catch {
      // No Web Audio support (old browser, blocked by policy): stay silent.
      unavailable = true;
    }
    return context;
  };

  return {
    unlock() {
      const current = ensureContext();
      if (current && current.state !== 'running') {
        current.resume().catch(ignoreError);
      }
    },

    play(cue) {
      if (!context || !output || context.state !== 'running') return;
      try {
        const now = context.currentTime;
        for (const tone of cue) scheduleTone(context, output, tone, now);
      } catch {
        // A sound that fails to schedule must never interrupt the game.
      }
    },

    destroy() {
      destroyed = true;
      const current = context;
      context = null;
      output = null;
      current?.close().catch(ignoreError);
    },
  };
}
