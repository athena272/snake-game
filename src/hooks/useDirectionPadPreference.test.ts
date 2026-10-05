import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createSafeStore } from '../services/storage';
import { DIRECTION_PAD_KEY, useDirectionPadPreference } from './useDirectionPadPreference';

describe('useDirectionPadPreference', () => {
  it('is hidden by default on devices without a coarse pointer', () => {
    const { result } = renderHook(() => useDirectionPadPreference(createSafeStore(() => null)));
    expect(result.current.visible).toBe(false);
  });

  it('restores the saved choice', () => {
    const store = createSafeStore(() => null);
    store.write(DIRECTION_PAD_KEY, '1');
    const { result } = renderHook(() => useDirectionPadPreference(store));
    expect(result.current.visible).toBe(true);
  });

  it('toggles and persists the choice', () => {
    const store = createSafeStore(() => null);
    const { result } = renderHook(() => useDirectionPadPreference(store));
    act(() => {
      result.current.toggle();
    });
    expect(result.current.visible).toBe(true);
    expect(store.read(DIRECTION_PAD_KEY)).toBe('1');
  });
});
