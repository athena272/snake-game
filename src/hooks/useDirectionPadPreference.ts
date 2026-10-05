import { useCallback, useState } from 'react';
import { appStore } from '../services/appStore';
import type { KeyValueStore } from '../services/storage';

export const DIRECTION_PAD_KEY = 'snake-game:show-direction-pad';

function prefersTouch(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

/** Whether the on-screen D-pad is visible: defaults to touch devices, then remembers the choice. */
export function useDirectionPadPreference(store: KeyValueStore = appStore) {
  const [visible, setVisible] = useState(() => {
    const saved = store.read(DIRECTION_PAD_KEY);
    return saved === null ? prefersTouch() : saved === '1';
  });

  const toggle = useCallback(() => {
    setVisible((current) => {
      const next = !current;
      store.write(DIRECTION_PAD_KEY, next ? '1' : '0');
      return next;
    });
  }, [store]);

  return { visible, toggle } as const;
}
