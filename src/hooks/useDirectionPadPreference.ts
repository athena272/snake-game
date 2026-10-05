import { appStore } from '../services/appStore';
import type { KeyValueStore } from '../services/storage';
import { usePersistentToggle } from './usePersistentToggle';

export const DIRECTION_PAD_KEY = 'snake-game:show-direction-pad';

function prefersTouch(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

/** Whether the on-screen D-pad is visible: defaults to touch devices, then remembers the choice. */
export function useDirectionPadPreference(store: KeyValueStore = appStore) {
  const { value, toggle } = usePersistentToggle(DIRECTION_PAD_KEY, prefersTouch, store);
  return { visible: value, toggle } as const;
}
