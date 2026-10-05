import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSafeStore } from '../services/storage';
import { usePersistentToggle } from './usePersistentToggle';

const KEY = 'test:toggle';

describe('usePersistentToggle', () => {
  it('starts from the default while nothing is saved', () => {
    const getDefault = vi.fn(() => true);
    const { result } = renderHook(() =>
      usePersistentToggle(
        KEY,
        getDefault,
        createSafeStore(() => null),
      ),
    );
    expect(result.current.value).toBe(true);
    expect(getDefault).toHaveBeenCalledOnce();
  });

  it('prefers the saved choice over the default', () => {
    const store = createSafeStore(() => null);
    store.write(KEY, '0');
    const getDefault = vi.fn(() => true);
    const { result } = renderHook(() => usePersistentToggle(KEY, getDefault, store));
    expect(result.current.value).toBe(false);
    expect(getDefault).not.toHaveBeenCalled();
  });

  it('toggles back and forth, persisting every change', () => {
    const store = createSafeStore(() => null);
    const { result } = renderHook(() => usePersistentToggle(KEY, () => false, store));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.value).toBe(true);
    expect(store.read(KEY)).toBe('1');

    act(() => {
      result.current.toggle();
    });
    expect(result.current.value).toBe(false);
    expect(store.read(KEY)).toBe('0');
  });

  it('keeps a stable toggle between renders', () => {
    const store = createSafeStore(() => null);
    const { result, rerender } = renderHook(() => usePersistentToggle(KEY, () => false, store));
    const first = result.current.toggle;
    rerender();
    expect(result.current.toggle).toBe(first);
  });
});
