import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../game';
import { pickEventSound, SOUND_CUES } from './cues';

describe('pickEventSound', () => {
  it.each<GameEvent>(['ate', 'poisoned', 'died', 'won'])('plays the %s cue', (event) => {
    expect(pickEventSound([event])).toBe(SOUND_CUES[event]);
  });

  it('plays the death sound when the last segment is poisoned', () => {
    expect(pickEventSound(['poisoned', 'died'])).toBe(SOUND_CUES.died);
  });

  it('plays the victory sound when the last apple fills the board', () => {
    expect(pickEventSound(['ate', 'won'])).toBe(SOUND_CUES.won);
  });

  it('stays silent on ticks without events', () => {
    expect(pickEventSound([])).toBeNull();
  });
});

describe('SOUND_CUES', () => {
  it.each(Object.entries(SOUND_CUES))('%s has playable tones', (_event, cue) => {
    expect(cue.length).toBeGreaterThan(0);
    for (const tone of cue) {
      for (const hz of [tone.fromHz, tone.toHz ?? tone.fromHz]) {
        expect(hz).toBeGreaterThanOrEqual(20);
        expect(hz).toBeLessThanOrEqual(20_000);
      }
      expect(tone.startMs).toBeGreaterThanOrEqual(0);
      expect(tone.durationMs).toBeGreaterThan(0);
      expect(tone.volume).toBeGreaterThan(0);
      expect(tone.volume).toBeLessThanOrEqual(1);
    }
  });
});
