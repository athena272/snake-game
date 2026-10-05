import { appStore } from '../services/appStore';
import type { KeyValueStore } from '../services/storage';
import { usePersistentToggle } from './usePersistentToggle';

export const SOUND_ENABLED_KEY = 'snake-game:sound-enabled';

const enabledByDefault = (): boolean => true;

/** Whether sound effects play: on by default, then remembers the choice. */
export function useSoundPreference(store: KeyValueStore = appStore) {
  const { value, toggle } = usePersistentToggle(SOUND_ENABLED_KEY, enabledByDefault, store);
  return { enabled: value, toggle } as const;
}
