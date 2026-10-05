import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOUND_CUES } from '../audio/cues';
import { createFakeSoundPlayer } from '../test/fakes';
import { useGameSounds } from './useGameSounds';

function setup(initialEnabled = true) {
  const player = createFakeSoundPlayer();
  const createPlayer = () => player;
  const hook = renderHook(({ enabled }) => useGameSounds(enabled, createPlayer), {
    initialProps: { enabled: initialEnabled },
  });
  return { ...hook, player };
}

describe('useGameSounds', () => {
  it('plays the cue that represents the tick', () => {
    const { result, player } = setup();
    result.current.playEvents(['poisoned', 'died']);
    expect(player.play).toHaveBeenCalledExactlyOnceWith(SOUND_CUES.died);
  });

  it('stays silent for ticks without events', () => {
    const { result, player } = setup();
    result.current.playEvents([]);
    expect(player.play).not.toHaveBeenCalled();
  });

  it('stays silent while muted and resumes when unmuted', () => {
    const { result, player, rerender } = setup(false);
    result.current.playEvents(['ate']);
    expect(player.play).not.toHaveBeenCalled();

    rerender({ enabled: true });
    result.current.playEvents(['ate']);
    expect(player.play).toHaveBeenCalledExactlyOnceWith(SOUND_CUES.ate);
  });

  it('keeps a stable callback when the preference changes', () => {
    const { result, rerender } = setup();
    const first = result.current.playEvents;
    rerender({ enabled: false });
    expect(result.current.playEvents).toBe(first);
  });

  it('unlocks audio on user gestures', () => {
    const { player } = setup();
    fireEvent.pointerDown(window);
    fireEvent.pointerUp(window);
    fireEvent.keyDown(window, { code: 'Enter' });
    expect(player.unlock).toHaveBeenCalledTimes(3);
  });

  it('releases the player and the listeners on unmount', () => {
    const { player, unmount } = setup();
    unmount();
    fireEvent.keyDown(window, { code: 'Enter' });
    expect(player.destroy).toHaveBeenCalledOnce();
    expect(player.unlock).not.toHaveBeenCalled();
  });
});
