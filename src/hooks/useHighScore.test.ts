import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HIGH_SCORE_KEY } from '../services/highScore';
import { createSafeStore } from '../services/storage';
import { useHighScore } from './useHighScore';

describe('useHighScore', () => {
  it('loads the stored record', () => {
    const store = createSafeStore(() => null);
    store.write(HIGH_SCORE_KEY, '8');
    const { result } = renderHook(() => useHighScore(store));
    expect(result.current.highScore).toBe(8);
  });

  it('saves only scores that beat the record', () => {
    const store = createSafeStore(() => null);
    const { result } = renderHook(() => useHighScore(store));

    let isRecord = false;
    act(() => {
      isRecord = result.current.submitScore(5);
    });
    expect(isRecord).toBe(true);
    expect(result.current.highScore).toBe(5);
    expect(store.read(HIGH_SCORE_KEY)).toBe('5');

    act(() => {
      isRecord = result.current.submitScore(5);
    });
    expect(isRecord).toBe(false);

    act(() => {
      isRecord = result.current.submitScore(3);
    });
    expect(isRecord).toBe(false);
    expect(result.current.highScore).toBe(5);
  });
});
