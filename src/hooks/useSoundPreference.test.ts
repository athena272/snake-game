import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createSafeStore } from '../services/storage';
import { SOUND_ENABLED_KEY, useSoundPreference } from './useSoundPreference';

describe('useSoundPreference', () => {
  it('is enabled on the first visit', () => {
    const { result } = renderHook(() => useSoundPreference(createSafeStore(() => null)));
    expect(result.current.enabled).toBe(true);
  });

  it('restores a muted choice', () => {
    const store = createSafeStore(() => null);
    store.write(SOUND_ENABLED_KEY, '0');
    const { result } = renderHook(() => useSoundPreference(store));
    expect(result.current.enabled).toBe(false);
  });

  it('mutes and persists the choice', () => {
    const store = createSafeStore(() => null);
    const { result } = renderHook(() => useSoundPreference(store));
    act(() => {
      result.current.toggle();
    });
    expect(result.current.enabled).toBe(false);
    expect(store.read(SOUND_ENABLED_KEY)).toBe('0');
  });
});
