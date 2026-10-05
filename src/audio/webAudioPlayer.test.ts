import { describe, expect, it, vi } from 'vitest';
import { createFakeAudioContext } from '../test/fakes';
import type { SoundCue } from './types';
import { createWebAudioPlayer } from './webAudioPlayer';

const CHORD: SoundCue = [
  { waveform: 'square', fromHz: 440, toHz: 880, startMs: 0, durationMs: 500, volume: 0.5 },
  { waveform: 'triangle', fromHz: 220, startMs: 250, durationMs: 500, volume: 0.5 },
];

function setup(initialState?: AudioContextState) {
  const audio = createFakeAudioContext(initialState);
  const player = createWebAudioPlayer(audio.factory);
  return { ...audio, player };
}

describe('createWebAudioPlayer', () => {
  it('does not create an audio context before the first gesture', () => {
    const { player, factory } = setup();
    player.play(CHORD);
    expect(factory).not.toHaveBeenCalled();
  });

  it('creates and resumes the context once when unlocked', () => {
    const { player, factory, fake } = setup();
    player.unlock();
    player.unlock();
    expect(factory).toHaveBeenCalledOnce();
    expect(fake.resume).toHaveBeenCalledOnce();
  });

  it('schedules one oscillator per tone, offset from the current time', () => {
    const { player, fake } = setup();
    player.unlock();
    fake.currentTime = 2;
    player.play(CHORD);

    expect(fake.oscillators).toHaveLength(2);
    const [first, second] = fake.oscillators;
    expect(first?.type).toBe('square');
    expect(first?.frequency.setValueAtTime).toHaveBeenCalledWith(440, 2);
    expect(first?.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(880, 2.5);
    expect(first?.start).toHaveBeenCalledWith(2);
    expect(first?.stop).toHaveBeenCalledWith(2.5);
    expect(second?.frequency.exponentialRampToValueAtTime).not.toHaveBeenCalled();
    expect(second?.start).toHaveBeenCalledWith(2.25);
    expect(second?.stop).toHaveBeenCalledWith(2.75);
  });

  it('releases the nodes when a tone ends', () => {
    const { player, fake } = setup();
    player.unlock();
    player.play(CHORD);
    const oscillator = fake.oscillators[0];
    oscillator?.onended?.();
    expect(oscillator?.disconnect).toHaveBeenCalledOnce();
  });

  it('stays silent while the browser keeps the context locked', async () => {
    const { player, fake } = setup();
    fake.resume.mockRejectedValueOnce(new Error('NotAllowedError'));
    player.unlock();
    await Promise.resolve();

    player.play(CHORD);
    expect(fake.oscillators).toHaveLength(0);
  });

  it('degrades to a silent no-op when Web Audio is unavailable', () => {
    const factory = vi.fn((): AudioContext => {
      throw new ReferenceError('AudioContext is not defined');
    });
    const player = createWebAudioPlayer(factory);

    expect(() => {
      player.unlock();
      player.unlock();
      player.play(CHORD);
      player.destroy();
    }).not.toThrow();
    expect(factory).toHaveBeenCalledOnce();
  });

  it('never lets a scheduling failure escape', () => {
    const { player, fake } = setup('running');
    player.unlock();
    fake.createOscillator.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(() => {
      player.play(CHORD);
    }).not.toThrow();
  });

  it('closes the context on destroy and ignores later calls', () => {
    const { player, factory, fake } = setup();
    player.unlock();
    player.destroy();
    player.unlock();
    player.play(CHORD);

    expect(fake.close).toHaveBeenCalledOnce();
    expect(factory).toHaveBeenCalledOnce();
    expect(fake.oscillators).toHaveLength(0);
  });
});
