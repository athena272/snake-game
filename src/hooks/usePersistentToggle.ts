import { useCallback, useState } from 'react';
import { appStore } from '../services/appStore';
import type { KeyValueStore } from '../services/storage';

/** On/off user preference: starts from `getDefault` until the user picks, then remembers the choice. */
export function usePersistentToggle(
  key: string,
  getDefault: () => boolean,
  store: KeyValueStore = appStore,
) {
  const [value, setValue] = useState(() => {
    const saved = store.read(key);
    return saved === null ? getDefault() : saved === '1';
  });

  const toggle = useCallback(() => {
    setValue((current) => {
      const next = !current;
      store.write(key, next ? '1' : '0');
      return next;
    });
  }, [key, store]);

  return { value, toggle } as const;
}
