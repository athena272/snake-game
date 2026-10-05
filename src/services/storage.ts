export interface KeyValueStore {
  read(key: string): string | null;
  write(key: string, value: string): void;
}

function defaultBackend(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

/**
 * localStorage wrapper that never throws: private modes, disabled storage or a
 * full quota fall back to an in-memory map so the session keeps working.
 */
export function createSafeStore(
  resolveBackend: () => Storage | null = defaultBackend,
): KeyValueStore {
  const memory = new Map<string, string>();

  const backend = (): Storage | null => {
    try {
      return resolveBackend();
    } catch {
      return null;
    }
  };

  return {
    read(key) {
      try {
        const value = backend()?.getItem(key);
        if (value !== null && value !== undefined) return value;
      } catch {
        // Unreadable storage: use the in-memory copy below.
      }
      return memory.get(key) ?? null;
    },
    write(key, value) {
      memory.set(key, value);
      try {
        backend()?.setItem(key, value);
      } catch {
        // Quota exceeded or storage blocked: the in-memory copy is kept.
      }
    },
  };
}
